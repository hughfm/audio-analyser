const { useState, useEffect } = React;

const DEFAULT_SIZE = Math.pow(2, 11);

export default function useAnalyser(size = DEFAULT_SIZE, { context, smoothing = 0.95 }) {
  const [node, setNode] = useState(null);

  useEffect(() => {
    const newNode = context.createAnalyser();
    newNode.fftSize = size;
    newNode.smoothingTimeConstant = smoothing;

    setNode(newNode);
  }, [context, size, smoothing]);

  return { node };
}
