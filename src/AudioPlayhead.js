import useAnimatedAudioTime from './useAnimatedAudioTime.js';
import useWindowSize from './useWindowSize.js';

const { useRef, useEffect } = React;

AudioPlayhead.defaultProps = {
  strokeStyle: 'black',
  lineWidth: 1,
};

function AudioPlayhead({
  strokeStyle,
  lineWidth,
  progress,
}) {
  const canvas = useRef(null);
  const [windowHeight, windowWidth] = useWindowSize();

  useEffect(() => {
    const ctx = canvas.current.getContext('2d');
    ctx.clearRect(0, 0, windowWidth, windowHeight);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();

    // DRAW PLAYHEAD
    ctx.moveTo(progress * windowWidth, 0);
    ctx.lineTo(progress * windowWidth, windowHeight);

    ctx.stroke();
  }, [progress]);

  return (
    <canvas
      ref={canvas}
      className="canvas"
      width={windowWidth}
      height={windowHeight}
    ></canvas>
  );
}

export default function AnimatedAudioPlayhead({ context, startTime, duration }) {
  const currentTime = useAnimatedAudioTime(context) - startTime;
  const progress = currentTime / duration;

  return (
    <AudioPlayhead progress={progress} />
  );
}
