const { useRef } = React;

export default function useAnalyser(ctx) {
  const analyserNodeRef = useRef();

  if (!analyserNodeRef.current) {
    analyserNodeRef.current = ctx.createAnalyser();
    analyserNodeRef.current.fftSize = Math.pow(2, 11);
    analyserNodeRef.current.smoothingTimeConstant = 0.95;
  }

  return analyserNodeRef;
}
