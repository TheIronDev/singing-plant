const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const AContext = (window.AudioContext || window.webkitAudioContext);
const audioContext = new AContext();
const analyser = audioContext.createAnalyser();
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);


navigator.mediaDevices.getUserMedia({audio: true}).then((mediaStream) => {
  const streamNode = audioContext.createMediaStreamSource(mediaStream);
  streamNode.connect(analyser);
  analyser.getByteFrequencyData(dataArray);
  audioContext.resume();
});

function drawStem(x, y) {
  ctx.beginPath();
  ctx.strokeStyle = '#519F52';
  ctx.lineWidth = 20;
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 80);
  ctx.stroke();
}

function drawPetals(x, y, height, width) {
  ctx.translate(x, y);
  ctx.lineWidth = 1;
  ctx.beginPath();

  const grd = ctx.createLinearGradient(0, 0, width/2, height/2);
  grd.addColorStop(0, '#EED54E');
  grd.addColorStop(1, '#E2B545');

  ctx.strokeStyle = '#000';
  ctx.fillStyle = grd;

  let rotate = 0;
  while (rotate * .125 < 2) {
    const position = [3,4,5, 11, 12, 13].includes(rotate) ? -60 : -55;

    ctx.beginPath();
    ctx.rotate(Math.PI * rotate * .125);
    ctx.ellipse(0, position, 12, 20, 0, 0, 2 * Math.PI);
    ctx.rotate(-Math.PI * rotate *.125);
    ctx.stroke();
    ctx.fill();
    rotate++;
  }

  ctx.translate(-x,-y);
}

function drawEye(x, y) {
  ctx.beginPath();
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#000';
  ctx.ellipse(x, y, 5, 10, 0, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = '#fff';
  ctx.ellipse(x - 1, y - 2, 2, 3, 0, 0, 2 * Math.PI);
  ctx.fill();
}

function drawMouth(x, y, avgFrequency) {
  const mouthSide = 30;
  const mouthOpenAdjustment = 30;
  const mouthTop = y + 15;
  const mouthTopOffset = 15;
  const mouthPercent = Math.min(Math.max(avgFrequency - 5, 0) / 64, 1);
  const mouthOpen = mouthTop + mouthTopOffset + mouthOpenAdjustment * mouthPercent;

  // Dimples
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.moveTo(x - mouthSide, mouthTop - 3);
  ctx.lineTo(x - mouthSide, mouthTop + 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + mouthSide, mouthTop - 3);
  ctx.lineTo(x + mouthSide, mouthTop + 3);
  ctx.stroke();

  // Upper lip
  ctx.beginPath();
  ctx.moveTo(x + mouthSide, mouthTop);

  // Lower lip
  ctx.quadraticCurveTo(x, mouthTop + mouthTopOffset, x - mouthSide, mouthTop);
  ctx.quadraticCurveTo(x, mouthOpen, x + mouthSide, mouthTop);
  ctx.stroke();
  ctx.fill();
}

function drawHead (x, y, height, width) {
  const grad = ctx.createLinearGradient(x - width, y - height, x + width/2, y + height/2);
  grad.addColorStop(0, '#E0BE74');
  grad.addColorStop(1, '#B27542');

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.strokeStyle = '#000';
  ctx.fillStyle = grad;
  ctx.ellipse(x, y, width, height, 0, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fill();
}

function drawPlant(height, width, avgFrequency) {
  const plantHeight = 40;
  const plantWidth = 60;
  const x = height/2;
  const y = width / 2;
  drawStem(x, y, plantHeight + 10);
  drawPetals(x, y, plantHeight, plantWidth);
  drawHead(x, y, plantHeight, plantWidth);

  drawEye(x - 20, y - 10); // left eye
  drawEye(x + 20, y - 10); // right eye
  drawMouth(x, y, avgFrequency);
}

function render() {
  requestAnimationFrame(render);
  analyser.getByteFrequencyData(dataArray);

  const {height, width} = canvas;
  const avgFrequency = dataArray.reduce((memo, val) => memo + val, 0) / dataArray.length;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(2, 2);
  ctx.clearRect(0, 0, 400, 400);
  drawPlant(height/2, width/2, avgFrequency);
}

render();