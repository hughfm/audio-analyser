const { useEffect, useRef } = React;

export default function FrequencyCanvas({
  dataArray,
  width,
  height,
}) {
  const canvas = useRef(null);

  useEffect(() => {
    const ctx = canvas.current.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.beginPath();

    // MOVE LINE TO STARTING POINT
    let x = 0;
    let y = height;
    ctx.moveTo(x, y);

    // BEGIN LOOPING OVER BINS
    for (var i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 255.0;
      const y = height - (v * height);
      ctx.lineTo(x, y);
      x = ((Math.log(i + 1) / Math.log(dataArray.length)) * width);
    }

    // DRAW LINE TO FINISHING POINT
    ctx.lineTo(width, height);
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
