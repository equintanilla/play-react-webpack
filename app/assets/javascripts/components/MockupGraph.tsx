import * as  React from 'react';
import {flatten,uniq,uniqBy} from 'lodash';
import container from "../inversify.config";
import BenchmarkService from "../services/benchmark_service";
import SERVICE_IDENTIFIER from "../constants/identifiers";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine} from 'recharts';
import MockupLabelAsPoint from './MockupLabelAsPoint';
import Loader from "./Loader";
import 'bootstrap/dist/css/bootstrap.css';

class CustomTooltip extends React.Component<any,any>{
	static childPropsTypes = {
       type: React.PropTypes.string,
	   payload: React.PropTypes.array,
	   label: React.PropTypes.string	
	}
	render() {
    const { active } = this.props;

    if (active) {
      const { baselineVal, payload, label } = this.props;
	  let avgTimeMs = (payload[0].value - baselineVal).toFixed(2)
	  let stdDev = (payload[1].value).toFixed(2)
      return (
			<div className="recharts-default-tooltip custom-tooltip">
			 <p className="recharts-tooltip-label" >{`${label}`} </p>
			 <p className="colorff7300" > avgTimeMs: {`${avgTimeMs}`}, {`${payload[0].value}`}</p>
			 <p className="color82ca9d"> stdDev: {`${stdDev}`}</p>
			</div>
      );
    }

    return null;
  }
}

export class MockupGraph extends React.Component<any,any>{
	
	constructor(props:any){
        super(props)       
        this.state = {
			metric_names:["avgTimeMs","stdDev"]
        };
    }
	
	render(){		
		if(this.props.data.length==0){
			return(<div></div>);
		}
		var i = -1;
		var strokes_fill = ["#ff7300","#82ca9d"];
		var lowestavgTime = 0
		lowestavgTime = Math.min.apply(Math, this.props.data.map(function(item:any) {
			return item['avgTimeMs'];
		}))
				
		return (
				<div  className="chartAlign"> 							
					<LineChart width = {550} height = {250} data = {this.props.data} margin={{top: 10, right: 80, left: 0, bottom: 5}}>
						<XAxis dataKey = "tag_date"/>
						<YAxis/>
						<CartesianGrid strokeDasharray = "3 3"/>
						<Tooltip content={<CustomTooltip baselineVal={lowestavgTime}/>} />
						<Legend />
						<ReferenceLine y={lowestavgTime} stroke="red" label={lowestavgTime}/>
						{	
							this.state.metric_names.map((names:string) => {
								{i++}
								return (<Line key = {`line_{names}`} stroke = {strokes_fill[i]} dataKey = {names} activeDot = {true}  strokeWidth = {4} />)
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
