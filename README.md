# Multi-App

## Running an Angular module inside a React Application using Web Components

**Prerequisites:** npm, ng

-----
### 1. Angular app setup with Web Component

1. Create a new angular project
   - `ng new angular-app`
    - no for strict; no for routing; scss

2. Install dependencies
    - in *angular-app*, run `ng add @angular/elements`

3. Modify *angular-app/src/app/app.component.html*, replace all contents with:
```html
  <div>llama</div>
```

4. Modify *angular-app/src/app/app.module.ts* to create a Web Component of the Angular module in its constructor; replace all with:
```js
  import { DoBootstrap, Injector, NgModule } from '@angular/core';
  import { createCustomElement } from '@angular/elements';
  import { BrowserModule } from '@angular/platform-browser';

  import { AppComponent } from './app.component';

  @NgModule({
    declarations: [
      AppComponent
    ],
    imports: [
      BrowserModule
    ],
    providers: [],
    entryComponents: [
      AppComponent
    ]
  })

  export class AppModule implements DoBootstrap {
    constructor(private injector: Injector) {
      const webComponent = createCustomElement(AppComponent, { injector: this.injector });
      customElements.define('angular-component', webComponent);
    }

    ngDoBootstrap() { }
  }
```
5. In *angular-app*, run `ng build` to build the static Web Component files which we'll use later in our host React application

-----
### 2. React app setup

1. Create a new React app using: https://github.com/MachineLlama/react-setup
	- run with: `node start react-app`

-----
### 3. Build, copy, and run Angular module in React

1. Create a new folder: *react-app/src/angular-files*

2. Copy these files from *angular-app/dist/angular-app* to *react-app/src/angular-files*:
    - main.js
    - polyfills.js
    - runtime.js
    - styles.css
    - styles.js (if it exists)
    - vendor.js

3. Modify *react-app/src/App.js* to import the Angular Web Component static files and to render the new custom element
```js
import React from 'react';

import './angular-files/runtime';
import './angular-files/polyfills';
import './angular-files/vendor';
import './angular-files/main';
import './angular-files/styles'; // if styles.js exists
import './angular-files/styles.css';

import './App.scss';

function App() {
  return (
    <div className="app">
      <angular-component  />
    </div>
  )
}

export default App;
```

4. In *react-app*, run `npm run start`
    - http://localhost:5070/ will open with your React app running with the Angular Web Component
	- you should see 'llama' rendered on the page, which comes from the Angular Web Component (yay!)

-----
### 4. Pass data from React down to the Angular Web Component using an attribute value

1. Add an input variable to the Angular module in *angular-app/src/app/app.component.ts*
```js
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-app';
  @Input() reactValue = '';
}
```

2. Show **reactValue** in *angular-app/src/app/app.component.html*. replace all with:
```html
<div>Value from React App: {{reactValue}}</div>
```

3. Add an input in *react-app/src/App.js*, whose value we will pass down from the React app to the Angular Web Component (important: notice the attribute in the Web Component is `react-value` to match the Angular variable of `reactValue`)
```js
import React, { useState } from 'react';

import './angular-files/runtime';
import './angular-files/polyfills';
import './angular-files/vendor';
import './angular-files/main';
import './angular-files/styles'; // if styles.js exists
import './angular-files/styles.css';

import './App.scss';

function App() {
  const [reactInputValue, setReactInputValue] = useState('');

  return (
    <div className="app">
      <input
        onChange={(e) => setReactInputValue(e.target.value)}
        value={reactInputValue}
      />
      <br/>
      <angular-component react-value={reactInputValue} />
    </div>
  )
}

export default App;
```

4. In *angular-app*, run `ng build` and copy files from *angular-app/dist/angular-app* to *react-app/src/angular-files*

5. In *react-app*, run `npm run start`
	-  you should see an input in your React app, which will update text in the Angular Web Component (nifty)

-----
### 5. Pass data from Angular Web Component up to React app using Custom Events

1. Add an input in *angular-app/src/app/app.component.html*, replace all contents with:
```html
<div class="angular-app-container">
  <div><b>Angular Component</b></div>
  <div>Value from React App: {{reactValue}}</div>
  <input (keyup)="onKey($event)">
</div>
```
2. Optional: add some styling for angular-app-container in *angular-app/src/app/app.component/scss*
```css
.angular-app-container {
  border: 1px solid black;
  margin: 20px;
  padding: 20px;
}
```
3. Add an **onKey** function to *angular-app/src/app.app.component.ts*, which emits a Custom Event whenever the Angular Input is changed:
```js
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-app';
  @Input() reactValue = '';
  inputValue = '';

  onKey(event: any) {
    this.inputValue = event.target.value;
    document.dispatchEvent(new CustomEvent('angular-input-event', { detail: event.target.value }));
  }
}
```

4. In *react-app/src/App.js*, add a listener to get and display the angular input value being emitted from the Web Component:
```js
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
```

5. In *angular-app*, run `ng build` and copy files in *angular-app/dist/angular-app* to *react-app/src/angular-files*

6. In *react-app*, run `npm run start`
	- now you have a React app rendering an Angular module wrapped in a Web Component, with data going both ways between the two (nice)

-----
### 6. Dynamically load scripts (no more copying needed)

1. In *react-app*, run `npm i web-component-load`

2. Update *react-app/src/App.js* to remove static imports; web-component-load assumes your Angular app is running and you have access to these chunk files: 'vendor.js', 'polyfills.js', 'main.js', 'runtime.js', and 'styles.css'. You can call the load function in this package with a given url and all the Angular chunk files will be appended as scripts (or link for the styles.css file) to the running app's document head section, if that particular script/link doesn't exist already:
```js
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
```

3. Run *angular-app* with `ng serve`. This will run the app on a given port (4200 in this case) and we can access the necessary Web Component scripts from there

4. Run *react-app* with `npm run start` and everything should work the same as before

5. Now try updating *angular-app/src/app/app.component.html* and restarting *angular-app* with `ng serve`. If you refresh your React app in your browser, you'll see the update to the Angular Web Component without needing to copy static build files over and without needing to restart the React application. This is crucial for large scale production applications because it means you can make updates to small parts of your application (which are running independently on different urls or ports) without needing to update/restart your main application. The user will simply need to refresh their browser to see the new content and the app will have no downtime (so cool!)
