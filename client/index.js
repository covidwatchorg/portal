import ReactDOM from 'react-dom';
import React from 'react';
import Routes from './Routes';
import "regenerator-runtime/runtime";

import './styles/application.scss';
import Firebase, { FirebaseContext } from './src/components/Firebase';

ReactDOM.render(
    <FirebaseContext.Provider value={new Firebase()}>
        <Routes />  
    </FirebaseContext.Provider>,
    document.getElementById('root'));
