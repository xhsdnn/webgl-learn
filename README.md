# webgl-learn

### 一、入门

使用webgl来绘制图形，出了需要一个画布之外，还需要其他条件，如果只是2D图形使用webgl来说会很繁琐。下面一个HelloWorld就绘制一个2D的三角形，以此来了解webgl需要那些基本条件。

#### 1.定义着色器

webgl想要绘制出东西，必须具备两个着色器，一个是顶点着色器，另一个是片段着色器。这两种着色器由着色器语言（[GLSL](https://zh.wikipedia.org/wiki/GLSL)）编写，是运行在GPU也就是显卡中的程序，下面定义两个着色器：

```js
/* 顶点着色器 */
const VERTEX_SHADER = `
attribute vec4 a_position;

void main() {
    gl_Position = a_position;
}`

/* 片段着色器 */
const FRAGMENT_SHADER = `
precision mediump float;

void main() {
    gl_FragColor = vec4(1, 0, 0, 1);
}`;
```

#### 2.创建对用的着色器

首先获取webgl上下文：

```js
let glCanvas = document.getElementById("glCanvas");
let gl = glCanvas.getContext('webgl');
```

> 页面上也是一个`<canvas>`元素，与canvas唯一的不同就是`.getContext`的参数变成了`webgl`。

由于需要创建两个着色器，所以这里定义一个函数去创建着色器：

```js
function createShader(gl, type, source) {
    let shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader); // 编译着色器

    // 获取编译的状态
    let successShader = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (successShader) {
        return shader;
    }
    console.error('创建着色器失败！', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}
```

接着来就是使用刚刚创建好的函数生成对应的着色器，就像这样：

```js
let vshader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER); // 顶点着色器
let fshader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER); // 片段着色器
```

#### 3.创建一个webgl着色程序

上面已经创建了两个着色器，就像方向盘和轮胎，现在需要一个东西去使用方向盘和轮胎，就是这个program，像上面一样，先写一个创建program的方法：

```js
function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    // 将两个着色器挂载到program上
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // 判断着色器是否挂载成功
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.error('创建program失败！', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
```

接着传入着色器创建一个program并使用：

```js
// 创建program
let program = createProgram(gl, vshader, fshader);
// 使用program
gl.useProgram(program);
```

> 这里的着色器程序可以有多个，以应对复杂的场景。

#### 4.创建缓冲区

上面都是一些webgl的基本操作，为什么定义了两个方法，就是因为具有通用型，会反复使用，所以封装成了一个方法。基本所有的webgl代码都是这样，编写GLSL、创建着色器和创建着色程序，可能唯一的变化就是在着色器中定义的变量不同。

开始我们说要绘制一个三角形，想想canvas绘制2D图形的时候，肯定是需要坐标的，这样才能确定图形的位置及大小，现在就定义一个三角形的位置，三角形只需要三个点就像这样：

```js
let positions = [
    0, 0,
    0, 0.5,
    0.7, 0
];
```
接着就要创建一个缓冲区将三角形的数据放在缓冲区里面：

```js
let shapeBuffer = gl.createBuffer(); // 创建一个缓冲区
gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer); // 将数据绑定到缓冲区
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW); // 将数据绑定到对应的顶点上
```

> new Float32Array(positions) —— 这里将数据转成webgl需要的数据类型；
> gl.STATIC_DRAW —— 表示webgl不会经常修改这些数据。

至此，已经把要绘制图形的数据放入的缓冲区，按理说应该就可以绘制了，但是这个图形数据交给谁呢？跟上面方向盘和轮胎的问题一样，我们需要一个变量去接收这些数据，就是之前在着色器中用GLSL语法定义的一个变量`a_position`，接下来先获取这个变量：

```js
// 获取着色器变量
let aPosition = gl.getAttribLocation(program, 'a_position');
```

> 有关着色器变量的定义、获取及设置在后文。

#### 5.绘制

无论是canvas还是webgl，在考虑到做动画的时候配合requestAnimationFrame会频繁的重绘，所以将绘制也封装成了一个方法：

```js
/* 绘制 */
function drawScene() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // 设置视口为整个画布

    gl.clearColor(0, 0, 0, 1); // 指定颜色清空画布

    gl.clear(gl.COLOR_BUFFER_BIT); // 使用指定的值来清空缓冲区

    /* 将缓冲区的值依次赋值给着色器变量 
     * gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
     * index —— 获取的顶点着色器变量
     * size —— 每次从缓冲区取的数据个数，必须是1/2/3/4，因为是2D的所以为2
     * type —— 每个单位的数据类型，这里是32位浮点数
     * normalized —— boolean，是否对数据规范为固定的范围
     * stride —— 内存偏移量，即移动多少内存读取下一个数据（没有进行测试）
     * offset —— 从缓冲区的第几个数据开始读取
     */
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    // 启用这个属性
    gl.enableVertexAttribArray(aPosition);

    /* 绘制图形
     * gl.drawArrays(type, offset, count);
     * type —— 图元类型，可选值除了gl.TRIANGLES还有gl.drawElements
     * offset —— 0表示从缓冲起始位置开始
     * count —— 定点着色器运行的次数(要画几个点)
     */
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// 调用
drawScene();
```

现在打开页面就可以看见在一个黑色的矩形中有一个红的的直角三角形。
![webgl-triangle](https://github.com/xhsdnn/webgl-learn/raw/master/images/webgl-triangle.jpg)

### 二、着色器程序

#### 1.获取数据方式

着色器可获取数据的4种方式：Attributes(属性), Varyings(可变量), Uniforms(全局常量), Textures(纹理)。
上面的三角形定义了一个属性：
```js
attribute vec4 a_position; // 属性用来表示如何接收缓冲区中的数据并传给顶点着色器
```

以此类推，定义其他类型就是：
```js
uniform vec2 u_translation; // 在每次运行时被复制且全局都会生效
varying vec4 v_color; // 在每次着色器运行时会获取不同的值
```

> 纹理也是数据，使用上面的方法声明，但是需要一些特殊的处理。

#### 2.数据类型

上面声明的变量类型有`vec2`和`vec4`，这就是GLSL中声明变量的类型：n维向量。
所以`vec4 a_position`表示`a_position`是一个四维向量，即(x,y,z,w)，其实这种类型有很多，暂时接触的有：

| 类型     | 说明 |
| -------- | --- |
| float | 浮点型 |
| int | 整形 |
| vec2/vec3/vec4 | 二维向量/三维向量/四维向量 |
| mat2/mat3/mat4 | 二维矩阵/三维矩阵/四维矩阵 |

> 为什么上面定义了`vec4 a_position`是一个四维向量但是每次只去两个数据？
> 因为z和w默认为0和1，且2D的话不需要操作z和w，所以我们只需要传入需要的x和y值即可。

### 三、对比canvas

由于是2D的情不自禁的想跟canvas做个对比，下面用canvas画一个三角形，直接上代码：

```js
let canvas = document.getElementById("glCanvas");
let ctx = canvas.getContext('2d');

ctx.beginPath();
// 填充背景
ctx.fillStyle = "rgba(0, 0, 0, 1)";
ctx.fillRect(0, 0, canvas.width, canvas.height);
// 绘制三角形
ctx.fillStyle = "rgba(255, 0, 0, 1)";
ctx.moveTo(150, 75);
ctx.lineTo(150, 25);
ctx.lineTo(220, 75);
ctx.lineTo(150, 75);
ctx.fill();
ctx.closePath();
```
效果图：
![canvas-triangle](https://github.com/xhsdnn/webgl-learn/raw/master/images/canvas-triangle.jpg)

从上面能看出来同样是一个背景和一个三角形，使用webgl要繁琐的多，如果只有2D的内容，相对来说还是使用canvas来的好一些。

### 四、写在后面

webgl语法还是挺晦涩的，想做3D的可以使用[three.js](https://www.threejs.online/docs/index.html#manual/introduction/Creating-a-scene)，是对webgl包装了一层，使用方便，api丰富，便于理解，同时也可以作为过渡，使用了three.js之后再研究webgl会好很多。

### 参考资料：

[WebGL 教程](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API/Tutorial)

[WebGL 基础概念](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-fundamentals.html)

[OpenGL](http://www.khronos.org/registry/OpenGL/specs/es/2.0/GLSL_ES_Specification_1.00.pdf)

[GLSL-Card](https://github.com/wshxbqq/GLSL-Card)
