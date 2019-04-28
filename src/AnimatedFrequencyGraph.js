import FrequencyCanvas from './FrequencyCanvas.js';
import useWindowSize from './useWindowSize.js';
import useFrequencyData from './useFrequencyData.js';

export default function AnimatedFrequencyGraph({
  analyserNode,
  strokeStyle,
  lineWidth,
}) {
  const [windowHeight, windowWidth] = useWindowSize();
  const dataArray = useFrequencyData(analyserNode);

  return (
    <FrequencyCanvas
      width={windowWidth}
      height={windowHeight}
      dataArray={dataArray}
      strokeStyle={strokeStyle}
      lineWidth={lineWidth}
    />
  );
}
