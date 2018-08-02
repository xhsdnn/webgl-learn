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