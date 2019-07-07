/* globals Uint8Array */

const { useState, useEffect } = React;

export default function useFrequencyData(analyserNode) {
  const [data, setData] = useState(() => ({
    array: new Uint8Array(analyserNode.frequencyBinCount)
  }));

  useEffect(() => {
    let rafId;

    const frame = () => {
      analyserNode.getByteFrequencyData(data.array);
      setData({ array: data.array });
      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [analyserNode]);

  return data.array;
}
