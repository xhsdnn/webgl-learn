/* 定点着色器 */
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

/* 创建着色器并编译 */
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

/* 创建program并将着色器的绑定在program上 */
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

/* 绘制 */
function drawScene() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // 设置视口为整个画布

    gl.clearColor(0, 0, 0, 1); // 指定颜色清空画布

    gl.clear(gl.COLOR_BUFFER_BIT); // 使用指定的值来清空缓冲区

    /* 将缓冲区的值依次赋值给着色器变量 
     * gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
     * index —— 获取的顶点着色器变量
     * size —— 每次从缓冲区取的数据个数，必须是1/2/3/4，因为是2d的所以为2
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

let glCanvas = document.getElementById("glCanvas");
let gl = glCanvas.getContext('webgl');

// 创建着色器
let vshader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER); // 顶点着色器
let fshader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER); // 片段着色器

// 创建program
let program = createProgram(gl, vshader, fshader);
// 使用program（可以使用多个）
gl.useProgram(program);

// 获取着色器变量
let aPosition = gl.getAttribLocation(program, 'a_position');

let positions = [
    0, 0,
    0, 0.5,
    0.7, 0
];
// 创建图形缓冲区
let shapeBuffer = gl.createBuffer(); // 创建一个缓冲区
gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer); // 将数据绑定到缓冲区
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW); // 将数据绑定到对应的顶点上

// 开始绘制
drawScene();
