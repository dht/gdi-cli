import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer as App } from './containers/AppContainer';
import './index.scss';

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);

bootstrapApp();
