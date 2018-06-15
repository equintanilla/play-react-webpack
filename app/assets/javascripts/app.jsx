import React from 'react';
import ReactDOM from 'react-dom';
import Greeter from './Greeter.jsx';
import TPCDS from './Tpcds.jsx';

import '../stylesheets/style.scss';

import Bootstrap from 'bootstrap/dist/css/bootstrap.min.css';
import ReactBootstrapTable from 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css'

//var React = require('react');


import { BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';


ReactDOM.render((
    <div>
        <h1>CI Performance Benchmark Dashboard</h1>
        <h2>n2</h2>
        <Greeter name="ds"/>
        <TPCDS />
    </div>), document.getElementById("app"));
