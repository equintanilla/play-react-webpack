import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {TPCDS} from './components/Tpcds';
import {Graph} from './components/Graph';
import {Mockup} from './components/Mockup';

import {
  BrowserRouter,
  Route,
  NavLink
} from 'react-router-dom'
import '../stylesheets/style.scss';

import 'bootstrap/dist/css/bootstrap.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css' 


export const Loader = () => <div className="loader">Loading...</div>

class TheApp extends React.Component<any,any>{
    
     constructor(props:any){
        super(props)
    }
    
    render(){
        return (
        <BrowserRouter>
        <div>
        <ul className="topNav">        
        <li> <NavLink to="/app/rawdata" activeClassName="active" >Raw data</NavLink> </li>
        <li> <NavLink to="/app/graph" activeClassName="active" >Graph</NavLink> </li> 
		<li> <NavLink to="/app/tpcds" activeClassName="active" >Tpcds</NavLink> </li>  		
        </ul>               
                <Route path="/app/rawdata" component={TPCDS}/>              
                <Route path="/app/graph" component={Graph}/>  
				<Route path="/app/tpcds" component={Mockup}/> 
        </div>
        </BrowserRouter>);
        }

};



export default TheApp;