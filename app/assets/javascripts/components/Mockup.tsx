import * as  React from 'react';
import container from "../inversify.config";
import BenchmarkService from "../services/benchmark_service";
import SERVICE_IDENTIFIER from "../constants/identifiers";
import {MockupGraph} from './MockupGraph';
import { DateRangePicker, SingleDatePicker, DayPickerRangeController } from 'react-dates';
import * as moment from 'moment';
import { BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import Collapsible from 'react-collapsible';
import MessageBox from './MessageBox';
import {difference} from 'lodash';
import 'react-dates/lib/css/_datepicker.css';
import 'bootstrap/dist/css/bootstrap.css';

export class Tab extends React.Component <any,any>{
  render() {
    return <button 
      className={ this.props.isActive ? 'active': '' }
      onClick={ this.props.onActiveTab } >
      <p>{ this.props.content }</p>
    </button>
  }
}

const leftNavTabs = ["q1-q10", "q11-q20", "q21-q30", "q31-q40", "q41-q50", "q51-q60", "q61-q70", "q71-q80", "q81-q90", "q91-q100"]
let initialStartDate: any = null;
let initialEndDate: any = null;

export class Mockup extends React.Component <any,any>{

	constructor(props:any){
        super(props)      
		this.state ={
			selectedTabId : 0,
			query_names: ["q1-v1.4", "q2-v1.4", "q3-v1.4", "q4-v1.4", "q5-v1.4", "q6-v1.4", "q7-v1.4", "q8-v1.4", "q9-v1.4", "q10-v1.4"], /*Initial queries to display*/
			startDate: null,  /*Date picker start date*/
			endDate: null,    /*Date picker end date*/
			focusedInput: null,
			dateFormat: 'DD/MM/YYYY', /* date picker date format*/
			graphParamStartDate:null,
			graphParamEndDate:null,
			benchmarkData:[],    /* array of objects containing - date,cluster_info,spark_params,branch,git_url,last_commit*/
			cluster_info:[], /*holds cluster_info for selected date*/
			spark_params:[], /*holds spark_params for selected date*/
			selectedDateTagIndex:null,
			branch_name:'',
			last_commit:'',
			git_url:'',
			data:[]
		}
	}
  
	isActive(id:number) {
		return this.state.selectedTabId === id;
	} 
	
	/*recompute query names,
	**clears graph_date,cluster_info,spark_params,selectedDateTagIndex
	*sets selected left nav tab active
	*/
	setActiveTab(selectedTabId:number, text:string) {
		this.setState({ selectedTabId });
		var q = text.split("-");
		var start = parseInt(q[0].replace(/[^0-9\.]/g, ''), 10);
		var end = parseInt(q[1].replace(/[^0-9\.]/g, ''), 10);
		var q_names =[];
		for(var i=start; i<=end; i++){
			q_names.push("q"+i+"-v1.4");
		}
		this.setState({query_names:q_names})
	}
	
	
	/* Called after component is rendered */
	componentDidMount(){	
		//set initial start and end date
		 initialStartDate = moment(new Date(),this.state.dateFormat).subtract(1,'month');
		 initialEndDate = moment(new Date(),this.state.dateFormat);
		 
		 this.setState({startDate: initialStartDate});
		 this.setState({endDate: initialEndDate});	
		 
		 this.setState({ graphParamStartDate:initialStartDate})
		 this.setState({ graphParamEndDate:initialEndDate}) 
	}
	
	/* Called when state changes 
	** If state changed, clear cluster_info,spark_params,benchmarkData,selectedDateTagIndex,data
	*/
	componentDidUpdate(prevProps:any, prevState:any){
		const diffStartDate = prevState.graphParamStartDate != this.state.graphParamStartDate
		const diffEndDate = prevState.graphParamEndDate != this.state.graphParamEndDate
		const diffQueryNames = difference(prevState.query_names,this.state.query_names)
		if (diffStartDate || diffEndDate || diffQueryNames.length >0){				
				this.setState({cluster_info:[]})
				this.setState({spark_params:[]})
				this.setState({ selectedDateTagIndex: null });
				this.setState({benchmarkData:[]})
				this.setState({data:[]})
				this.state.query_names.map((queryname:string) => {	
					this.getGraphData(this.state.graphParamStartDate,this.state.graphParamEndDate, queryname)
				})
		}	
	}
	
	/* Invoke API call to fetch benchmark data for specific dates and query name */
	getBenchMarksForDates(startDate:any, endDate:any, queryName:any){
		let bm_service = container.get<BenchmarkService>(SERVICE_IDENTIFIER.BM_SERVICE);
		return bm_service.getBenchmarksForDates(startDate,endDate,queryName);
	}
	
	formatDateYYMMDD(date:any){
		var d = new Date(date); 
		var year:any = d.getFullYear();
		var month:any = d.getMonth()+1;
		var dt:any = d.getDate();

		if (dt < 10) {
		  dt = '0' + dt;
		}
		if (month < 10) {
		  month = '0' + month;
		}

		return year + '/' + month + '/' + dt;
	}
	
	formatDateDDMMYY(date:any){
		var d = new Date(date); 
		var year:any = d.getFullYear();
		var month:any = d.getMonth()+1;
		var dt:any = d.getDate();

		if (dt < 10) {
		  dt = '0' + dt;
		}
		if (month < 10) {
		  month = '0' + month;
		}
		
		return dt + '/' + month + '/' + year;
	}	
	
	getDateFromMomentObj(startDate:any, endDate:any){
		var startMonth:any = parseInt(startDate.month())+1;
		var endMonth:any = parseInt(endDate.month())+1;

		startMonth = startMonth < 10 ? '0'+startMonth : startMonth;
		endMonth = endMonth < 10 ? '0' + endMonth : endMonth;
		
		var startDay:any = startDate.date() < 10 ? '0'+startDate.date() : startDate.date();
		var endDay:any = endDate.date() < 10 ? '0'+endDate.date() : endDate.date();
		
		return [startDate.year()+ "-"+ startMonth + "-" + startDay, endDate.year()+ "-"+ endMonth+ "-" + endDay];
	}
	
	/* Generate x and y coordinates for graph
	** Dates are plotted on X axis, metric values on Y axis
	** data var is array of objects contaning unique dates,metric names and their values,
	** cluster_info,spark_params, branch, git_url, last_commit
	** Only dates and metric values are used to plot graphs
	*/
	getGraphData(startDate:object, endDate:object, queryName:string){
		if(startDate == null && endDate == null){
			return;
		}
			
		let series: Array<any> = [];
		var date_range = this.getDateFromMomentObj(startDate, endDate);
		this.getBenchMarksForDates(date_range[0], date_range[1], queryName).then((res:any)=>{			
			
			/* get all tags, dates from response */
			let all_tags_dates = res.data.map((benchmark:any)=>{ return [benchmark.tag,this.formatDateYYMMDD(benchmark.date)]});
			
			/* form an array of unique tags, dates */
			let tags_dates: Array<any> =[];
			all_tags_dates.forEach(function(elem:any){
				var found = tags_dates.filter(function(arr){ 
					return ((arr[0] == elem[0]) && (arr[1] == elem[1])) 
				}); 
				if(found.length ==0){ 
					tags_dates.push(elem)
				} 			
			})
			
			/* make 'this' context available inside forEach loop */
			let that = this;
			
			/* for each tag, date get data from response object */
			tags_dates.map((tags_dates_array:any)=>{
				var data_obj: any = {};			  				
				res.data.forEach(function(benchmark:any){				
					if((benchmark.tag == tags_dates_array[0] && that.formatDateYYMMDD(benchmark.date) == tags_dates_array[1])){
							benchmark.workloads.metrics.map((metric: any)=>{ 
								data_obj[metric.name] = parseFloat((metric.value).toFixed(2));
								data_obj['cluster_info'] = benchmark.cluster_info;
								data_obj['spark_params'] = benchmark.spark_params;
								data_obj['last_commit'] = typeof(benchmark.last_commit) != 'undefined' ? benchmark.last_commit : "";
								data_obj['branch'] = typeof(benchmark.branch) != 'undefined' ? benchmark.branch : "";
								data_obj['git_url'] = typeof(benchmark.git_url) != 'undefined' ? benchmark.git_url : "";									
								data_obj["date"] = that.formatDateDDMMYY(benchmark.date);
								data_obj["tag_date"] = tags_dates_array[0] + "[" + that.formatDateDDMMYY(benchmark.date) + "]";
								data_obj["tag"] = tags_dates_array[0];
							})						
					} 								  
				});													
				series.push(data_obj);	
				that.setbenchmarkData(data_obj)				
			}); 
			
			/*sort dates, tags in ascending order */
			series.sort(function(a,b){
			  var tag1 = a.tag.split("-");
			  var tag2 = b.tag.split("-")
			  var tag1_part1 = parseInt(tag1[0].replace(/[^0-9]/g, ""), 10);
			  var tag2_part1 = parseInt(tag2[0].replace(/[^0-9]/g, ""), 10);
			  if((tag1_part1 == tag2_part1) && ( tag1[1] != undefined && tag2[1] != undefined )){
				  var tag1_part2 = parseInt(tag1[1].replace(/[^0-9]/g, ""), 10);
				  var tag2_part2 = parseInt(tag2[1].replace(/[^0-9]/g, ""), 10);
				  if(tag1_part2 == tag2_part2){
					var j = a.date.split('/');
					var k = b.date.split('/');
					return j[2] - k[2] || j[1] - k[1] || j[0] - k[0];
				  }else{
					return tag1_part2 > tag2_part2 ? 1:-1;
				  }
			  
			  }else{
				return tag1_part1 > tag2_part1 ? 1:-1
			  }
			  
			})	
			let stateData = this.state.data;
			stateData.push({'data':series,'query_name':queryName})
			
			/*sort query names */
			stateData.sort(function(a:any,b:any){
				var q_name1 = a.query_name.split("-");
				var q_num1 = parseInt(q_name1[0].replace(/[^0-9\.]/g, ''), 10);
				var q_name2 = b.query_name.split("-");
				var q_num2 = parseInt(q_name2[0].replace(/[^0-9\.]/g, ''), 10);
				return q_num1 < q_num2 ? -1:1;
			})
			this.setState({data:stateData});
		});		
	}
	
	/*
	** set new start and end date 
	*/
	handleApplyBtnClick(){
		var stdate = this.state.startDate;
		var endate = this.state.endDate;
		this.setState({ graphParamStartDate:stdate}) 
		this.setState({ graphParamEndDate:endate}) 		
	}
	
	/*
	** On tag [date] click inside accordian, display cluster info,
	** spark params, branch name, git url, last commit
	*/
	handleDateTagClick(tag_date:any, index:number){		
		var cluster_data:Array<any> =[];
		var spark_data:Array<any> =[];
		this.state.benchmarkData.map((obj:any)=>{ 
			if(obj.tag_date === tag_date) {
				typeof(obj.cluster_info) != "undefined" ? cluster_data.push(obj.cluster_info) : null
				typeof(obj.spark_params) != "undefined" ? spark_data.push(obj.spark_params) : null
				this.setState({branch_name: obj.branch})
				this.setState({last_commit: obj.last_commit})
				this.setState({git_url: obj.git_url})
				this.setState({cluster_info:cluster_data})
				this.setState({spark_params:spark_data})
			}
		});
		this.setState({ selectedDateTagIndex: index });
	}

	/* disable future dates on date picker*/
	selectableDateRange(date:any, endDate:any) {
		return (date.isAfter(endDate));
	}
	
	/*
	** For a range of dates push  benchmark data to benchmarkData var
	** benchmarkData is array of objects consisting of unique dates, tags(sorted in descending order),
	** metric names and their values,cluster_info, spark_params, branch, git_url,last_commit
	*/
	setbenchmarkData(benchmarkData:any){
		var data:Array<any> = this.state.benchmarkData;
		var found:Array<any> = data.filter(function(obj){
			return obj.tag_date == benchmarkData.tag_date
		})

		if(found.length == 0){
			data.push(benchmarkData);
			/*sort dates, tags in descender order - display latest first on collapsible div*/
			data.sort(function(a,b){
			  var tag1 = a.tag.split("-");
			  var tag2 = b.tag.split("-")
			  var tag1_part1 = parseInt(tag1[0].replace(/[^0-9]/g, ""), 10);
			  var tag2_part1 = parseInt(tag2[0].replace(/[^0-9]/g, ""), 10);
			  if((tag1_part1 == tag2_part1) && ( (tag1[1] != undefined) && (tag2[1] != undefined) )){
				  var tag1_part2 = parseInt(tag1[1].replace(/[^0-9]/g, ""), 10);
				  var tag2_part2 = parseInt(tag2[1].replace(/[^0-9]/g, ""), 10);
				  if(tag1_part2 == tag2_part2){
					var j = a.date.split('/');
					var k = b.date.split('/');
					return k[2] - j[2] || k[1] - j[1] || k[0] - j[0];
				  }else{
					return tag1_part2 > tag2_part2 ? -1:1;
				  }
			  
			  }else{
				return tag1_part1 > tag2_part1 ? -1:1
			  }			  
			})
			this.setState({benchmarkData:data});
		}			
	}
	
	showIP(cell:any, row:any, enumObject:any, index:any){
		if(cell instanceof Array){
			return cell[enumObject].ip
		}else{
			return cell.ip
		}
	}
	
	showHostname(cell:any, row:any, enumObject:any, index:any){
		if(cell instanceof Array){
			return cell[enumObject].hostname
		}else{
			return cell.hostname
		}
	}
	
	showVcpus(cell:any, row:any, enumObject:any, index:any){
		if(cell instanceof Array){
			return cell[enumObject].vcpus
		}else{
			return cell.vcpus
		}
	}
	
	showRAM(cell:any, row:any, enumObject:any, index:any){
		if(cell instanceof Array){
			return cell[enumObject].ram
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
						  isOutsideRange={day => this.selectableDateRange(day, initialEndDate)}
						  onFocusChange={focusedInput => this.setState({ focusedInput })} 
					/>
					<button type="button" className="btn-lg btnMargin" onClick={this.handleApplyBtnClick.bind(this)}>Apply</button>
					<br/>
					<br/>		
					<Collapsible trigger="Cluster Info">
						<div>
							<div>
							{ this.state.benchmarkData.length != 0 ? this.state.benchmarkData.map((obj:any, i:number)=>{ 
									return (<a key={i} className = { this.state.selectedDateTagIndex == i ? "dateLink active" : "dateLink"} onClick={this.handleDateTagClick.bind(this,obj.tag_date,i)}>{obj.tag_date}</a>)})
							  : null }
							</div>
							<br/>
							{ this.state.selectedDateTagIndex != null ? 
									<div className="git_params">
										<label>Branch</label>
										<span>: {this.state.branch_name}</span>
										<br/>
										<label>Git Url</label>
										<span>: {this.state.git_url}</span>
										<br/>
										<label>Last Commit</label>
										<span>: {this.state.last_commit}</span>
									</div> : null }
							<br/>
							{ this.state.cluster_info.length != 0 ? 
									<div>
										<BootstrapTable data={this.state.cluster_info}  striped hover options={ { noDataText: 'No Date selected' } }>										
											<TableHeaderColumn  row='0' rowSpan="2" isKey={ true } dataField='master' dataFormat={this.showIP} >Master IP</TableHeaderColumn>																				 
											<TableHeaderColumn  row='0' rowSpan="2" dataField='master' dataFormat={this.showHostname} >Master Hostname</TableHeaderColumn>																				 
											<TableHeaderColumn  row='0' rowSpan="2" dataField='master' dataFormat={this.showVcpus}>Master VCPUS</TableHeaderColumn>																				 
											<TableHeaderColumn  row='0' rowSpan="2" dataField='master' dataFormat={this.showRAM} >Master RAM</TableHeaderColumn>	
											
											{ this.state.cluster_info.map((info:any)=>info.slaves.map((slave:any,i:number)=>{ 											
												return [											
													<TableHeaderColumn  row='0' colSpan="4" thStyle={ { "textAlign": "center"} }>Slave {i+1}</TableHeaderColumn>	,											
													<TableHeaderColumn  row='1' dataField='slaves'  formatExtraData={i} dataFormat={this.showIP} >IP</TableHeaderColumn>,
													<TableHeaderColumn  row='1' dataField='slaves' formatExtraData={i} dataFormat={this.showHostname}>Hostname</TableHeaderColumn>,
													<TableHeaderColumn  row='1' dataField='slaves' formatExtraData={i} dataFormat={this.showVcpus} >VCPUS</TableHeaderColumn>,												
													<TableHeaderColumn  row='1' dataField='slaves' formatExtraData={i} dataFormat={this.showRAM} >RAM</TableHeaderColumn>	
													]																						
												}))
											}																																									 
										</BootstrapTable>
										<br/>
									</div> : null }	
																	
							{ this.state.spark_params.length != 0 ? 
									<div>
										<BootstrapTable data={this.state.spark_params}  striped hover options={ { noDataText: 'No Date selected' } }>										
											<TableHeaderColumn  isKey={ true } dataField='num_executors' >Num Executors</TableHeaderColumn>																				 
											<TableHeaderColumn  dataField='executor_cores' >Executor Cores</TableHeaderColumn>																				 
											<TableHeaderColumn  dataField='executor_memory' >Executor Memory</TableHeaderColumn>																				 
											<TableHeaderColumn  dataField='driver_memory' >Driver Memory</TableHeaderColumn>	
											<TableHeaderColumn  dataField='driver_cores' >Driver Cores</TableHeaderColumn>	
											<TableHeaderColumn  dataField='total_executor_cores' >Total Executor Cores</TableHeaderColumn>	
											<TableHeaderColumn  dataField='shuffle_partitions' >Shuffle Partitions</TableHeaderColumn>	
											<TableHeaderColumn  dataField='gc_threads' >GC Threads</TableHeaderColumn>	
											<TableHeaderColumn  dataField='exec_memoryOverhead' >Exec Memory Overhead</TableHeaderColumn>	
											<TableHeaderColumn  dataField='driver_memoryOverhead' >Driver Memory Overhead</TableHeaderColumn>	
										</BootstrapTable>
									</div> : null }
					  
							{ this.state.benchmarkData.length == 0 ?
									<MessageBox message = "No Data" />
									:(this.state.selectedDateTagIndex != null && (this.state.cluster_info.length == 0 && this.state.spark_params.length == 0))?
									<MessageBox message = "No Cluster Info and Spark Data" />
									:(this.state.selectedDateTagIndex != null && this.state.spark_params.length == 0)?
									<MessageBox message = "No Spark Params" />
									:(this.state.selectedDateTagIndex != null && this.state.cluster_info.length == 0)?
									<MessageBox message = "No Cluster Info" />
									:(this.state.selectedDateTagIndex == null) ?
									<MessageBox message = "No Tag Selected" />
									: null }
						</div>
					</Collapsible>					  
					<br/>
					<br/>
						{	this.state.data.length >0 ?
								this.state.data.map((object:any,i:number) => {								
									return <MockupGraph key={i} queryName= {object.query_name} data ={object.data} />
								})
							: null
						}
						{ this.state.benchmarkData.length == 0 ? <MessageBox message = "No Data" />:null }
			   </div>
		   </div>
	   );
    }
}
