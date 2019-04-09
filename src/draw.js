export default function createDrawFunction({
  canvasCtx,
  analyser,
  dataArray,
  bufferLength,
  audioEl,
}) {
  const draw = () => {
    const width = canvasCtx.canvas.width;
    const height = canvasCtx.canvas.height;
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    // CLEAR SCREEN
    canvasCtx.fillStyle = 'black';
    canvasCtx.fillRect(0, 0, width, height);

    // FILL LOAD STATE
    const loadProgress = audioEl.buffered.length
      ? audioEl.buffered.end(0) / audioEl.duration
      : 0;
    canvasCtx.fillStyle = '#333';
    canvasCtx.fillRect(0, 0, width * loadProgress, height);

    // SET LINE STYLE
    canvasCtx.lineWidth = 1;
    canvasCtx.strokeStyle = 'white';

    // BEGIN
    canvasCtx.beginPath();

    // CALCULATE BIN WIDTH
    const sliceWidth = width * 1.0 / (bufferLength + 1);

    // DRAW PLAYHEAD
    const progress = audioEl.currentTime / audioEl.duration;
    canvasCtx.moveTo(progress * width, 0);
    canvasCtx.lineTo(progress * width, height);

    // MOVE LINE TO STARTING POINT
    let x = 0;
    let y = height;
    canvasCtx.moveTo(x, y);

    // BEGIN LOOPING OVER BINS
    for (var i = 0; i < bufferLength; i++) {
      // CALCULATE NEXT Y VALUE
      const v = dataArray[i] / 255.0;
      const y = height - (v * height);

      // DRAW LINE TO NEXT COORDINATES
      canvasCtx.lineTo(x, y);

      // DRAW TICK
      canvasCtx.moveTo(x, height);
      canvasCtx.lineTo(x, height - 5);

      // DRAW CENTER LINE
      canvasCtx.moveTo(0, height / 2);
      canvasCtx.lineTo(width, height / 2);

      canvasCtx.moveTo(x, y);

      // ADVANCE X
      x = ((Math.log(i + 1) / Math.log(bufferLength)) * width);
    }

    // DRAW LINE TO FINISHING POINT
    canvasCtx.lineTo(width, height);

    // STROKE
    canvasCtx.stroke();
  };

  return draw;
};
