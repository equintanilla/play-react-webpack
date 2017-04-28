import * as  React from 'react';
import {flatten,uniq} from 'lodash';
import container from "../inversify.config";
import BenchmarkService from "../services/benchmark_service";
import SERVICE_IDENTIFIER from "../constants/identifiers";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import MockupLabelAsPoint from './MockupLabelAsPoint';
import Loader from "./Loader";
import 'bootstrap/dist/css/bootstrap.css';

export class MockupGraph extends React.Component<any,any>{
	static childPropsTypes = {
		setGraphData: React.PropTypes.func,
	}
	constructor(props:any){
        super(props)       
        this.state = {
            data : [],
			loading: true,
			metric_names:[]		
        };
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
	
    componentDidMount(){
		this.getGraphData(this.props.startDate, this.props.endDate, this.props.queryName)					
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
		this.setState({loading: true}) 		
		let series: Array<any> = [];
		var date_range = this.getDateFromMomentObj(startDate, endDate);
		this.getBenchMarksForDates(date_range[0], date_range[1], queryName).then((res:any)=>{		
			let all_dates = res.data.map((benchmark:any)=>{ return this.formatDateYYMMDD(benchmark.date)});
			let x_Axis_labels = (uniq(flatten(all_dates))).sort();
			let metric_names = uniq(flatten(res.data.map((benchmark:any)=>benchmark.workloads.metrics.map((metrics:any)=>metrics.name))));
			let that = this;

			x_Axis_labels.forEach(function(date){
				var data_obj: any = {};
				data_obj["date"] = that.formatDateDDMMYY(date);
				metric_names.forEach(function(names){
					res.data.forEach(function(benchmark:any){
						if((that.formatDateYYMMDD(benchmark.date) == date)){
								benchmark.workloads.metrics.map((metric: any)=>{ 
									data_obj[metric.name] = parseFloat((metric.value).toFixed(2));
									data_obj['cluster_info'] = benchmark.cluster_info;
									data_obj['spark_params'] = benchmark.spark_params;
									data_obj['last_commit'] = typeof(benchmark.last_commit) != 'undefined' ? benchmark.last_commit : "";
									data_obj['branch'] = typeof(benchmark.branch) != 'undefined' ? benchmark.branch : "";
									data_obj['git_url'] = typeof(benchmark.git_url) != 'undefined' ? benchmark.git_url : "";
								})
						} 								  
					});							
				});
				series.push(data_obj);	
				that.props.setGraphData(data_obj)				
			}); 	
			this.setState({data:series});
			this.setState({metric_names: metric_names});			
			this.setState({loading: false});
		});
							
	}
		
	componentWillReceiveProps(nextProps:any) {		
		const diffStartDate = this.props.startDate !== nextProps.startDate;
		const diffEndDate = this.props.endDate !== nextProps.endDate;		
		const diffQueryName = this.props.queryName !== nextProps.queryName;

		if (diffStartDate || diffEndDate || diffQueryName){
			this.getGraphData(nextProps.startDate,nextProps.endDate,nextProps.queryName)		
		}		
    }
	
	render(){		
		if(this.state.data.length==0){
			return(<div></div>);
		}
		if(this.state.loading){
            return (<Loader/>)
        }
		var i = 0;
		var strokes_fill = ["#8884d8","#ff7300","#82ca9d","#8884d8"];
		return (
				<div  className="chartAlign"> 							
					<LineChart width = {450} height = {250} data = {this.state.data} >
						<XAxis dataKey = "date"/>
						<YAxis/>
						<CartesianGrid strokeDasharray = "3 3"/>
						<Tooltip/>
						<Legend />
						{	
							this.state.metric_names.map((names:string) => {
								{i++}
								return (<Line key = {`line_{names}`} stroke = {strokes_fill[i]} dataKey = {names} activeDot = {false} label = {<MockupLabelAsPoint  />} strokeWidth = {4}  />)
							})		
						}
					</LineChart>				
					<p className="querNameAlign">{this.props.queryName}</p>
					<br/>
					<br/>										
				</div>								
		);
	}
}