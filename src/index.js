import React from 'react'
import { render } from 'react-dom'
import './reset.css'
import './index.css'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker' 

render(<App />, document.querySelector('#root'));
registerServiceWorker();