
# Multi-App

## Running an Angular module inside a React Application using Web Components

**Prerequisites:** npm, yarn, ng

-----
### Angular app setup with Web Component

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
### React app setup

1. Create a new React app using: https://github.com/MachineLlama/react-setup
	- run with: `node start react-app`

2. Install dependencies
	- in *react-app*, run: `npm i @webcomponents/webcomponentsjs vendor-copy`

3. Modify *react-app/package.json*
	- add `"postinstall": "vendor-copy"` to the scripts array
	- add these lines at the root level:
```json
  "vendorCopy": [
    {
      "from": "node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js",
      "to": "src/vendor/custom-elements-es5-adapter.js"
    },
    {
      "from": "node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js",
      "to": "src/vendor/webcomponents-bundle.js"
    }
  ]
```
4. In *react-app*, run `npm i` so the webcomponentjs files are copied to *src/vendor*

-----
### Build, copy, and run Angular module in React

1. Create a new folder: *react-app/src/angular-files*

2. Copy these files from *angular-app/dist/angular-app* to *react-app/src/angular-files*:
	- main.js
	- polyfills.js
	- runtime.js
	- styles.css
	- vendor.js

3. In *react-app/src/App.js*, import Angular web component static files:
```js
import './angular-files/runtime';
import './angular-files/polyfills';
import './angular-files/vendor';
import './angular-files/main';
import './angular-files/styles.css';
```
4. In *react-app/src/App.js*, replace 'Hello World' in the JSX with the new angular web-component:
```js
  <angular-component  />
```

5. In *react-app*, run `npm run start`

6. http://localhost:5070/ will open with your React app running with the Angular Web Component
	- you should see 'llama' rendered on the page, which comes from the Angular Web Component (yay!)

-----
### Pass data from React down to the Angular Web Component using an attribute value

1. Add an input variable to the Angular module
	- in *angular-app/src/app/app.component.ts*, add `@Input() reactValue = '';` (right below the title variable)
	- also import **Input** from @angular/core: `import { Component, Input } from '@angular/core';`

2. Show **reactValue** in *angular-app/src/app/app.component.html*
	- Replace 'llama' with: `<div>Value from React App: {{reactValue}}</div>`

3. Add an input in *react-app/src/App.js*:
```js
import React, { useState } from 'react';

import './angular-files/runtime';
import './angular-files/polyfills';
import './angular-files/vendor';
import './angular-files/main';
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
      <angular-component />
    </div>
  )
}

export default App;
```

4. In *react-app/src/App.js*, pass **reactInputValue** to the Angular Web Component:
	- `<angular-component  react-value={reactInputValue}  />`

5. In *angular-app*, run `ng build` and copy files from *angular-app/dist/angular-app* to *react-app/src/angular-files*

6. In *react-app*, run `npm run start`
	-  you should see an input in your React app, which will update text in the Angular Web Component

-----
### Pass data from Angular Web Component up to React app using Custom Events

1. Add an input in *angular-app/src/app/app.component.html*, replace all contents with:
```html
<div class="angular-app-container">
  <div><b>Angular Component</b></div>
  <div>Value from React App: {{reactValue}}</div>
  Angular Input: <input (keyup)="onKey($event)">
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
	- now you have a React app rendering an Angular module wrapped in a Web Component, with data going both ways between the two, nice
