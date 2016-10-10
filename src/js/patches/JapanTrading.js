import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import * as ActionsCreators from '../actions/ActionsCreators';
import configureStore from '../store/configureStore';
import JapanContainer from '../components/JapanContainer';
import addAppendEventListener from './addAppendEventListener';

let store;
let appNode;

const start = () => {
  if (typeof store === 'object') {
    return false;
  }

  const storage = localStorage.japan ? JSON.parse(localStorage.japan) : {};
  store = configureStore({ storage });

  store.dispatch(ActionsCreators.getSymbols());
  appNode = document.getElementById('japan-app');
  ReactDOM.render(<Provider store={store}><JapanContainer /></Provider>, appNode);

  addAppendEventListener();

  return true;
};


const stop = () => {
  if (typeof store !== 'object') {
    return false;
  }

  $('body').unbind('append');

  store.dispatch(ActionsCreators.close());
  store = undefined;
  ReactDOM.unmountComponentAtNode(appNode);
  return true;
};

export default { start, stop };
