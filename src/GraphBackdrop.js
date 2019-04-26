import StaticCanvas from './StaticCanvas.js';
import useWindowSize from './useWindowSize.js';

export default function GraphBackdrop({ binCount }) {
  const [windowHeight, windowWidth] = useWindowSize();

  return (
    <StaticCanvas
      draw={(ctx) => {
        ctx.fillStyle = 'green';
        ctx.fillRect(0, 0, windowWidth, windowHeight);

        // SET LINE STYLE
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';

        ctx.beginPath();

        // DRAW CENTER LINE
        ctx.moveTo(0, windowHeight / 2);
        ctx.lineTo(windowWidth, windowHeight / 2);

        // DRAW TICKS
        for (var i = 0; i < binCount; i++) {
          const x = ((Math.log(i) / Math.log(binCount)) * windowWidth);
          ctx.moveTo(x, windowHeight);
          ctx.lineTo(x, windowHeight - 5);
        }

        ctx.stroke();
      }}
      width={windowWidth}
      height={windowHeight}
    />
  );
};
