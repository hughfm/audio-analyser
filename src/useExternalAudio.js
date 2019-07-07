const { useEffect, useState } = React;

export const WAITING = 'waiting';
export const LOADING = 'loading';
export const DECODING = 'decoding';

export default function useExternalAudio(url, { context }) {
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [state, setState] = useState(WAITING);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'arraybuffer';
    setError(null);
    context.suspend();

    request.addEventListener('abort', () => {
      setState(WAITING);
      setError(new Error('Request for audio was aborted.'));
      setProgress(0);
    });

    request.addEventListener('error', () => {
      setState(WAITING);
      setError(new Error('Request for audio was aborted.'));
      setProgress(0);
    });

    request.addEventListener('load', () => {
      if (request.status < 200 || request.status >= 300) {
        setError(new Error(`The HTTP request failed with status ${request.status}`));
        return;
      }

      setError(null);
      setState(DECODING);
      context.decodeAudioData(request.response, (buffer) => {
        /* success */
        setAudioBuffer(buffer);
        setState(WAITING);
        setError(null);
      }, (error) => {
        /* error */
        setAudioBuffer(null);
        setState(WAITING);
        setError(error);
      });
    });

    request.addEventListener('loadend', () => {
      // setState(WAITING);
    });

    request.addEventListener('loadstart', () => {
      setState(LOADING);
      setProgress(0);
      setError(null);
    });

    request.addEventListener('progress', (event) => {
      setProgress(Math.round(event.loaded / event.total * 100));
    });

    request.send();

    return () => {
      setError(null);
      setAudioBuffer(null);
      if (state === LOADING) request.abort();
      setState(WAITING);
    };
  }, [url, context]);

  const metadata = { state, error, progress };

  return [audioBuffer, metadata];
}
