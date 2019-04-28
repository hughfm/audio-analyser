const { useEffect, useState } = React;

export default function useExternalAudio(url, { context }) {
  const [audioBuffer, setAudioBuffer] = useState(null);

  useEffect(() => {
    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'arraybuffer';
    request.onload = () => {
      context.decodeAudioData(request.response, (buffer) => {
        setAudioBuffer(buffer);
      }, (error) => {
        // eslint-disable-next-line no-console
        console.log('error decoding.', error);
      });
    };

    request.send();

    return () => {
      setAudioBuffer(null);
    };
  }, [url, context]);

  return audioBuffer;
}
