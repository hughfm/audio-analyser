const { useRef, useState } = React;

export default function useGain(ctx) {
  const gainNodeRef = useRef();

  if (!gainNodeRef.current) gainNodeRef.current = ctx.createGain();

  const [gainValue, setGainValue] = useState(gainNodeRef.current.gain.value);

  return [
    gainNodeRef,
    (value) => {
      gainNodeRef.current.gain.value = value;
      setGainValue(value);
    },
  ];
}
