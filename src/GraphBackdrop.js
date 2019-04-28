import StaticCanvas from './StaticCanvas.js';
import useWindowSize from './useWindowSize.js';

GraphBackdrop.defaultProps = {
  fillStyle: 'green',
  strokeStyle: 'black',
  lineWidth: 1,
  centerLine: false,
  binSpacing: 'log',
  binCount: null,
  tickSize: 10,
};

export default function GraphBackdrop({
  binCount,
  binSpacing,
  fillStyle,
  lineWidth,
  strokeStyle,
  centerLine,
  tickSize,
}) {
  const [windowHeight, windowWidth] = useWindowSize();

  return (
    <StaticCanvas
      draw={(ctx) => {
        ctx.fillStyle = fillStyle;
        ctx.fillRect(0, 0, windowWidth, windowHeight);

        // SET LINE STYLE
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;

        ctx.beginPath();

        // DRAW CENTER LINE
        if (centerLine) {
          ctx.moveTo(0, windowHeight / 2);
          ctx.lineTo(windowWidth, windowHeight / 2);
        }

        // DRAW TICKS
        if (binCount) {
          for (var i = 0; i < binCount; i++) {
            const x = binSpacing === 'log' ?
              ((Math.log(i) / Math.log(binCount)) * windowWidth) :
              i / binCount * windowWidth;
            ctx.moveTo(x, windowHeight);
            ctx.lineTo(x, windowHeight - tickSize);
          }
        }

        ctx.stroke();
      }}
      width={windowWidth}
      height={windowHeight}
    />
  );
};
