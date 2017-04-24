import * as  React from 'react';
import container from "../inversify.config";
import BenchmarkService from "../services/benchmark_service";
import SERVICE_IDENTIFIER from "../constants/identifiers";
import {MockupGraph} from './MockupGraph';
import { DateRangePicker, SingleDatePicker, DayPickerRangeController } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import * as moment from 'moment';
import { BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import 'bootstrap/dist/css/bootstrap.css';
import Collapsible from 'react-collapsible';

var Tab = React.createClass({
  render: function() {
    return <button 
      className={ this.props.isActive ? 'active': '' }
      onClick={ this.props.onActiveTab }
	>
      <p>{ this.props.content }</p>
    </button>
  }
});
const leftNavTabs = ["q1-q10", "q11-q20", "q21-q30", "q31-q40", "q41-q50", "q51-q60", "q61-q70", "q71-q80", "q81-q90", "q91-q100"]

let initialStartDate: object=null;
let initialEndDate: object=null;

export class Mockup extends React.Component <any,any>{

	constructor(props:any){
        super(props)      
		this.state ={
			selectedTabId : 0,
			query_names: ["q1-v1.4","q2-v1.4","q3-v1.4","q4-v1.4","q5-v1.4","q6-v1.4","q7-v1.4","q8-v1.4","q9-v1.4","q10-v1.4"],
			startDate: null,
			endDate: null,
			focusedInput: null,
			dateFormat: 'YYYY/MM/DD',
			graphParamStartDate:null,
			graphParamEndDate:null,
			graphData:[],
			cluster_info:[],
			selectedDateIndex:null
		}
	}
  
	isActive(id) {
		return this.state.selectedTabId === id;
	} 
	
	setActiveTab(selectedTabId:number, text:string) {
		this.setState({ selectedTabId });
		var q = text.split("-");
		var start = parseInt(q[0].replace(/[^0-9\.]/g, ''), 10);
		var end = parseInt(q[1].replace(/[^0-9\.]/g, ''), 10);
		var q_names =[];
		for(var i=start; i<=end; i++){
			q_names.push("q"+i+"-v1.4");
		}
		this.setState({cluster_info:[]})
		this.setState({graphData:[]})
		this.setState({query_names:q_names})
	}
	
	getDate(lastMonth:boolean){
		var d = new Date(); 
		var year = d.getFullYear();
		var month = d.getMonth()+1;
		var dt = d.getDate();
		if(lastMonth){
			month = month-1;
		}
		if (dt < 10) {
		  dt = '0' + dt;
		}
		if (month < 10) {
		  month = '0' + month;
		}

		return year + '/' + month + '/' + dt;
	} 
	
	componentDidMount(){	
		//set initial start and end date
		 initialStartDate = moment(this.getDate(true),this.state.dateFormat);
		 initialEndDate = moment(this.getDate(),this.state.dateFormat);
		 
		 this.setState({startDate: initialStartDate});
		 this.setState({endDate: initialEndDate});	
		 
		 this.setState({ graphParamStartDate:initialStartDate})
		 this.setState({ graphParamEndDate:initialEndDate}) 
	}
	
	handleBtnClick(){
		this.setState({cluster_info:[]})
		this.setState({graphData:[]})
		var stdate = this.state.startDate;
		var endate = this.state.endDate;
		this.setState({ graphParamStartDate:stdate}) 
		this.setState({ graphParamEndDate:endate}) 
		
	}
	
	handleDateClick(date,index){		
		var cluster_data =[];
		this.state.graphData.map(obj=>{ if(obj.date === date) 
			{
				cluster_data.push(obj.cluster_info)
				this.setState({cluster_info:cluster_data})
			}
			});
		this.setState({ selectedDateIndex: index });
	}

	selectableDateRange(date:any, startDate:any, endDate:any) {	 
		return (date.isSameOrBefore(startDate) || date.isAfter(endDate));
	}
	
	setGraphData(graphData){
		var data = this.state.graphData;
		var found = data.filter(function(obj){
			return obj.date == graphData.date
		})
		if(found.length == 0){
			data.push(graphData);
			this.setState({graphData:data});
		}			
	}
	showIP(cell, row, enumObject, index){
		if(cell instanceof Array){
			return cell[index].ip
		}else{
			return cell.ip
		}
	}
	showHostname(cell, row, enumObject, index){
		if(cell instanceof Array){
			return cell[index].hostname
		}else{
			return cell.hostname
		}
	}
	showVcpus(cell, row, enumObject, index){
		if(cell instanceof Array){
			return cell[index].vcpus
		}else{
			return cell.vcpus
		}
	}
	showRAM(cell, row, enumObject, index){
		if(cell instanceof Array){
			return cell[index].ram
		}else{
			return cell.ram
		}
	}
	render() {
      var leftTabs = leftNavTabs,
    	tabs = leftTabs.map(function (el, i) {
          return <Tab 
            key={ i }
            content={ el } 
            isActive={ this.isActive(i) } 
            onActiveTab={ this.setActiveTab.bind(this, i, el) }
          />
        }, this);
       return(
		   <div className="mockupContainer">
			   <div className="tab">
				{ tabs }
			   </div>
			   <div className="tabContent">			   
				   <br/>
				   <DateRangePicker
						  startDate={this.state.startDate}
						  endDate={this.state.endDate}						 
						  focusedInput={this.state.focusedInput}
						  displayFormat={this.state.dateFormat}
						  onDatesChange={({ startDate, endDate }) => this.setState({ startDate, endDate })}
						  isOutsideRange={day => this.selectableDateRange(day, initialStartDate,initialEndDate.clone().add(1, 'day'))}
						  onFocusChange={focusedInput => this.setState({ focusedInput })} 
					/>
					<button type="button" className="btn-lg btnMargin" onClick={this.handleBtnClick.bind(this)}>Apply</button>
					<br/>
					<br/>
		
					 <Collapsible trigger="Cluster Info">
					<div>
						<div>
						{ this.state.graphData.length != 0 ? this.state.graphData.map((obj,i)=>{ 
							return (<a key={i} className = { this.state.selectedDateIndex == i ? "dateLink active" : "dateLink"} onClick={this.handleDateClick.bind(this,obj.date,i)}>{obj.date}</a>)
						}):null}
						</div>
						<br/>
						<br/>
					   { 				  
							this.state.cluster_info.length != 0 ? <div>
											<BootstrapTable data={this.state.cluster_info}  striped hover options={ { noDataText: 'No Date selected' } }>										
											<TableHeaderColumn  row='0' rowSpan="2" isKey={ true } dataField='master' dataFormat={this.showIP} >Master IP</TableHeaderColumn>																				 
											<TableHeaderColumn  row='0' rowSpan="2" dataField='master' dataFormat={this.showHostname} >Master Hostname</TableHeaderColumn>																				 
											<TableHeaderColumn  row='0' rowSpan="2" dataField='master' dataFormat={this.showVcpus}>Master VCPUS</TableHeaderColumn>																				 
											<TableHeaderColumn  row='0' rowSpan="2" dataField='master' dataFormat={this.showRAM} >Master RAM</TableHeaderColumn>	
											
											{this.state.cluster_info.map(info=>info.slaves.map((slave,i)=>{ 											
											return  [											
												<TableHeaderColumn  row='0' colSpan="4" thStyle={ { "textAlign": "center"} }>Slave {i+1}</TableHeaderColumn>	,											
												<TableHeaderColumn  row='1' dataField='slaves'  dataFormat={this.showIP} >IP</TableHeaderColumn>,
												<TableHeaderColumn  row='1' dataField='slaves'  dataFormat={this.showHostname}>Hostname</TableHeaderColumn>,
												<TableHeaderColumn  row='1' dataField='slaves' dataFormat={this.showVcpus} >VCPUS</TableHeaderColumn>,												
												<TableHeaderColumn  row='1' dataField='slaves' dataFormat={this.showRAM} >RAM</TableHeaderColumn>	
												]																						
											}))
											}
																																									 
										</BootstrapTable>
							</div>:this.state.graphData.length == 0 ? <p> No data </p>:<p>No date Selected</p>		  
					   }
					  </div>
					</Collapsible>					  
				  <br/>
				  <br/>
					  {
							this.state.query_names.map((name:string,i:number) => {								
								return <MockupGraph key={i} queryName={name} startDate={this.state.graphParamStartDate} endDate={this.state.graphParamEndDate} setGraphData={this.setGraphData.bind(this)}/>
							})
						}	
			   </div>
		   </div>
	   );
    }
}