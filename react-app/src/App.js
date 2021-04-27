import React, { useState } from 'react';

import './angular-files/runtime';
import './angular-files/polyfills';
import './angular-files/vendor';
import './angular-files/main';
import './angular-files/styles.css';

import './App.scss';

function App() {
  const [reactInputValue, setReactInputValue] = useState('');
  const [angularInputValue, setAngularInputValue] = useState('');

  document.addEventListener('angular-input-event', function (e) {
    setAngularInputValue(e.detail);
  }, { capture: true });

  return (
    <div className="app">
      <div><b>React App</b></div>
      <div>Value from Angular Component: {angularInputValue}</div>
      <div>
        <input
          onChange={(e) => setReactInputValue(e.target.value)}
          value={reactInputValue}
        />
      </div>
      <div><angular-component react-value={reactInputValue} /></div>
    </div>
  )
}

export default App;
