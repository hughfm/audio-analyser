const { useEffect, useRef } = React;

export default function FrequencyCanvas({
  dataArray,
  width,
  height,
}) {
  const canvas = useRef(null);

  useEffect(() => {
    const ctx = canvas.current.getContext('2d');

    // CLEAR SCREEN
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    // FILL LOAD STATE
    // const loadProgress = audioEl.buffered.length
    //   ? audioEl.buffered.end(0) / audioEl.duration
    //   : 0;
    // canvasCtx.fillStyle = '#333';
    // canvasCtx.fillRect(0, 0, width * loadProgress, height);

    // SET LINE STYLE
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';

    // BEGIN
    ctx.beginPath();

    // CALCULATE BIN WIDTH
    const sliceWidth = width * 1.0 / (dataArray.length + 1);

    // DRAW PLAYHEAD
    // const progress = audioEl.currentTime / audioEl.duration;
    // canvasCtx.moveTo(progress * width, 0);
    // canvasCtx.lineTo(progress * width, height);

    // MOVE LINE TO STARTING POINT
    let x = 0;
    let y = height;
    ctx.moveTo(x, y);

    // BEGIN LOOPING OVER BINS
    for (var i = 0; i < dataArray.length; i++) {
      // CALCULATE NEXT Y VALUE
      const v = dataArray[i] / 255.0;
      const y = height - (v * height);

      // DRAW LINE TO NEXT COORDINATES
      ctx.lineTo(x, y);

      // DRAW TICK
      // ctx.moveTo(x, height);
      // ctx.lineTo(x, height - 5);

      // DRAW CENTER LINE
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);

      ctx.moveTo(x, y);

      // ADVANCE X
      x = ((Math.log(i + 1) / Math.log(dataArray.length)) * width);
    }

    // DRAW LINE TO FINISHING POINT
    ctx.lineTo(width, height);

    // STROKE
    ctx.stroke();
  });

  return (
    <canvas
      className="canvas"
      ref={canvas}
      width={width}
      height={height}
    ></canvas>
  );
};
