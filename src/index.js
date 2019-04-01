import App from './App.js';

const appContainer = document.getElementById('app');
export const AudioContext = React.createContext();

ReactDOM.render(
  <AudioContext.Provider value={new window.AudioContext()}>
    <App />
  </AudioContext.Provider>,
  appContainer,
);
