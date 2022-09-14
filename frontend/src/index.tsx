/**
 * @author Sachin Pai
 * @email  sachin.pai@atmecs.com
 * @desc index file of the project
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Router from './Router';
import 'antd/dist/antd.min.css'
import { Typography } from 'antd';


// export const host = '192.168.29.216:5000'
// let hostnaeme = window.location.host

let hostname = 'localhost'
export const host = hostname + ':5000'

export const { Title } = Typography;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Router />
);