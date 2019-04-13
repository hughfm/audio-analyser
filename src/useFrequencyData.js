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
    console.log('running raf effect');
    const rafId = window.requestAnimationFrame(frame);

    return () => {
      console.log('cleaning up raf effect');
      window.cancelAnimationFrame(rafId);
    };
  }, [analyserNode]);

  return data.array;
};
