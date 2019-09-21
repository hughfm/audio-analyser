/* globals Uint8Array */

const { useState, useEffect } = React;

export default function useFrequencyData(analyserNode) {
  const [data, setData] = useState(() => ({
    array: new Uint8Array(analyserNode.frequencyBinCount)
  }));

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      analyserNode.getByteFrequencyData(data.array);
      setData({ array: data.array });
    });

    return () => cancelAnimationFrame(rafId);
  }, [analyserNode, data]);

  return data.array;
}
