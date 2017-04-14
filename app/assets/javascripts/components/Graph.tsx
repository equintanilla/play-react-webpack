import * as  React from 'react';
import {flatten,uniq} from 'lodash';
import container from "../inversify.config";
import BenchmarkService from "../services/benchmark_service";
import SERVICE_IDENTIFIER from "../constants/identifiers";
import 'bootstrap/dist/css/bootstrap.css';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import LabelAsPoint from './LabelAsPoint';
import {MetricTable} from './MetricTable';

export const Loader = () => <div className="loader">Loading...</div>
export class Graph extends React.Component<any,any>{
	constructor(props:any){
        super(props)       
        this.state = {
            data : {},
			loading: true,
			metric_names:[],
			benchmark_date_json:[],
			col_names:[ "Date","Query Name","stdDev","maxTimeMs","minTimeMs","avgTimeMs"]
        };
    }
	getBenchMarks(){
		let bm_service = container.get<BenchmarkService>(SERVICE_IDENTIFIER.BM_SERVICE);
		return bm_service.getBenchmarksGraphs();
	}
	formatDate(date){
		var d = new Date(date); 
		var year = d.getFullYear();
		var month = d.getMonth()+1;
		var dt = d.getDate();

		if (dt < 10) {
		  dt = '0' + dt;
		}
		if (month < 10) {
		  month = '0' + month;
		}

		return year + '/' + month + '/' + dt;
	}   
    componentDidMount(){
		this.setState({loading: true}) 
		let series = [];
        this.setState({loading: true}) 
        this.getBenchMarks().then(res=>{
			
		let all_date = res.data.map(metric=>{ return this.formatDate(metric._id.date)});
		let x_Axis_labels = uniq(flatten(all_date));
		let metric_names = uniq(flatten(res.data.map(metric=>metric._id.name)));
		let that = this;
		var series =[];
			 
		x_Axis_labels.forEach(function(date){
			var d = {};
			d["name"] = date;
			metric_names.forEach(function(names,index){
				res.data.forEach(function(metric){
					if((that.formatDate(metric._id.date) == date)){
							d[metric._id.name] = metric.average;
					} 								  
				});	
					
			});
			series.push(d);			
		}); 		
			this.setState({data:series});
			this.setState({metric_names: metric_names});
			this.setState({loading: false});			
		});
    }
	handleClickFunc(table_data){
		this.setState({benchmark_date_json:table_data});
	}
	
	render(){
		if(this.state.loading){
            return (<Loader/>)
        }
		var i = 0;
		var strokes_fill = ["#8884d8","#ff7300","#82ca9d","#8884d8"];
		return (
			<div className="chartAlign"> 
			<LineChart width = {450} height = {250} data = {this.state.data}>
				<XAxis dataKey = "name"/>
				<YAxis/>
				<CartesianGrid strokeDasharray = "3 3"/>
				<Tooltip/>
				<Legend />
				{	
					this.state.metric_names.map((names) => {
						{i++}
						return (<Line key = {`line_{names}`} stroke = {strokes_fill[i]} dataKey = {names} activeDot = {false} label = {<LabelAsPoint getTableData={this.handleClickFunc.bind(this)} />} strokeWidth = {4}  />)
					})		
				}
			</LineChart>
			<p className="querNameAlign">q1-1.4</p>
			<br/><br/>					
			</div>
	  );
	}
}