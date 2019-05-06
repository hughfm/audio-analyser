const { useState } = React;

const randomIntBelow = (max) => {
  return Math.floor(Math.random() * max);
};

const randomRGB = () => {
  return `rgba(${randomIntBelow(256)}, ${randomIntBelow(256)}, ${randomIntBelow(256)})`;
};

export default function useColorScheme() {
  const [colors, setColors] = useState({ background: randomRGB() });

  const resetColors = () => {
    setColors({ background: randomRGB() });
  };

  return [colors, resetColors];
}
