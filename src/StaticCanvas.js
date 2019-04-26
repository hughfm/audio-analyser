const { useRef, useEffect } = React;

export default function Canvas({ draw, width, height }) {
  const canvas = useRef(null);

  useEffect(() => {
    const ctx = canvas.current.getContext('2d');
    draw(ctx);
  }, [draw]);

  return (
    <canvas
      className="canvas"
      ref={canvas}
      width={width}
      height={height}
    ></canvas>
  );
};
