const { useState, useEffect } = React;

export default function useFrequencyData(analyserNode) {
  const [data, setData] = useState(() => ({
    array: new Uint8Array(analyserNode.frequencyBinCount)
  }));

  const frame = () => {
    analyserNode.getByteFrequencyData(data.array);
    setData({ array: data.array });
    return window.requestAnimationFrame(frame);
  };

  useEffect(() => {
    const rafId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [analyserNode]);

  return data.array;
};
