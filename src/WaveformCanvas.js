import useWindowSize from './useWindowSize.js';

const { useRef, useEffect } = React;

WaveformCanvas.defaultProps = {
  strokeStyle: 'black',
  resolution: 10000,
};
export default function WaveformCanvas({
  buffer,
  strokeStyle,
  resolution,
}) {
  const canvas = useRef(null);
  const [windowHeight, windowWidth] = useWindowSize();

  useEffect(() => {
    const ctx = canvas.current.getContext('2d');

    ctx.clearRect(0, 0, windowWidth, windowHeight);
    ctx.lineWidth = windowWidth / resolution;
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();

    if (buffer) {
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const data = buffer.getChannelData(channel);

        let x = 0;
        let dataIndex, dataValue, lineStart, lineLength, lineEnd;

        for (let sample = 0; sample < resolution; sample++) {
          dataIndex = ~~(data.length * (sample / resolution));
          dataValue = data[dataIndex];

          lineStart = windowHeight / 2 * (channel + 1) - windowHeight / buffer.numberOfChannels / 2;
          lineLength = dataValue * windowHeight / buffer.numberOfChannels / 2;
          lineEnd = lineStart + lineLength;

          ctx.moveTo(x, lineStart);
          ctx.lineTo(x, lineEnd);

          x = (sample / resolution) * windowWidth;
        }
      }

      ctx.stroke();
    }

    return () => {
      ctx.clearRect(0, 0, windowWidth, windowHeight);
    };
  }, [buffer, windowHeight, windowWidth]);

  return (
    <canvas
      className="canvas"
      ref={canvas}
      width={windowWidth}
      height={windowHeight}
      ></canvas>
  );
}
