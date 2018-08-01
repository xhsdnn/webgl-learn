/* 定义着色器 */
const VERTEX_SHADER = `
attribute vec4 a_position;

void main() {
    gl_Position = a_position;
}`
const FRAGMENT_SHADER = `
precision mediump float;

void main() {
    gl_FragColor = vec4(1, 0, 0, 1);
}`;

/* 创建着色器并编译 */
function createShader(gl, type, source) {
    let shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);
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
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.error('创建program失败！', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

/* 绘制 */
function drawScan() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    // 启用这个属性
    gl.enableVertexAttribArray(aPosition);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

let glCanvas = document.getElementById("glCanvas");
let gl = glCanvas.getContext('webgl');

// 创建着色器
let vshader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
let fshader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

// 创建program
let program = createProgram(gl, vshader, fshader);
// 使用program（可以使用多个）
gl.useProgram(program);

// 获取着色器变量
let aPosition = gl.getAttribLocation(program, 'a_position');

// 创建图形缓冲区
let shapeBuffer = gl.createBuffer();
let positions = [
    0, 0,
    0, 0.5,
    0.7, 0
];
gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// 开始绘制
drawScan();
