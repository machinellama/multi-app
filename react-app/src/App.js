import React, { useEffect, useState } from 'react';
import { load } from 'web-component-load';

import './App.scss';

function App() {
  const [reactInputValue, setReactInputValue] = useState('');
  const [angularInputValue, setAngularInputValue] = useState('');

  useEffect(() => {
    load('http://localhost:4200');
  }, []);

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