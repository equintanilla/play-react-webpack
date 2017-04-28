import * as  React from 'react';
import { BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import 'bootstrap/dist/css/bootstrap.css';


export class MetricTable extends React.Component<any,any>{
	constructor(props:any){
        super(props) 	
    }
	
   render(){
	  return (
		<div>
		<BootstrapTable data={this.props.data} keyField='Date' striped hover options={ { noDataText: 'No coordinates selected' } } >
		{
			
			this.props.col_names.map((names:string,index:number) => {
				return(<TableHeaderColumn key={index} dataField={names}>{names}</TableHeaderColumn>)
			})	
		}
		 
		</BootstrapTable>
		</div>
	  );
  }
}

