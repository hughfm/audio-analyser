import App from './App.js';

const appContainer = document.getElementById('app');
export const AudioContext = React.createContext();
const BrowserAudioContext = window.AudioContext || window.webkitAudioContext;

ReactDOM.render(
  <AudioContext.Provider value={new BrowserAudioContext()}>
    <App />
  </AudioContext.Provider>,
  appContainer,
);
