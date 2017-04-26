import * as  React from 'react';
import {flatten,uniq} from 'lodash';
import container from "../inversify.config";
import BenchmarkService from "../services/benchmark_service";
import SERVICE_IDENTIFIER from "../constants/identifiers";
import 'bootstrap/dist/css/bootstrap.css';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import MockupLabelAsPoint from './MockupLabelAsPoint';
import {MetricTable} from './MetricTable';


export const Loader = () => <div className="loader">Loading...</div>
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
	
	getBenchMarksForDates(startDate:any,endDate:any,queryName:any){
		let bm_service = container.get<BenchmarkService>(SERVICE_IDENTIFIER.BM_SERVICE);
		return bm_service.getBenchmarksForDates(startDate,endDate,queryName);
	}
	
	formatDate(date:any){
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
		this.getGraphData(this.props.startDate,this.props.endDate,this.props.queryName)					
    }	
	
	getGraphData(startDate:object,endDate:object,queryName:string){
		if(startDate == null && endDate == null){
			return;
		}
		this.setState({loading: true}) 		
		let series: Array<any> = [];
		var returnedDate = this.getDateFromMomentObj(startDate,endDate);
		this.getBenchMarksForDates(returnedDate[0],returnedDate[1],queryName).then((res:any)=>{		
			let all_dates = res.data.map((benchmark:any)=>{ return this.formatDate(benchmark.date)});
			let x_Axis_labels = uniq(flatten(all_dates));
			let metric_names = uniq(flatten(res.data.map((benchmark:any)=>benchmark.workloads.metrics.map((metrics:any)=>metrics.name))));
			let that = this;

			x_Axis_labels.forEach(function(date){
				var d: any = {};
				d["date"] = date;
				metric_names.forEach(function(names){
					res.data.forEach(function(benchmark:any){
						if((that.formatDate(benchmark.date) == date)){
								benchmark.workloads.metrics.map((metric: any)=>{ d[metric.name]=parseFloat((metric.value).toFixed(2)); d['cluster_info']=benchmark.cluster_info;d['spark_params']=benchmark.spark_params})
						} 								  
					});	
						
				});
				series.push(d);	
				that.props.setGraphData(d)				
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
					<br/><br/>										
				</div>								
	  );
	}
}