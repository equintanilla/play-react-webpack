import * as  React from 'react';
import {flatten,uniq} from 'lodash';
import container from "../inversify.config";
import BenchmarkService from "../services/benchmark_service";
import SERVICE_IDENTIFIER from "../constants/identifiers";

export default class LabelAsPoint extends React.Component <any,any>{
	static childPropsTypes = {
		getTableData: React.PropTypes.func,
	}
	constructor(props:any){
        super(props)       
    }
    onClick = () => {
        const { index, key, payload } = this.props;
		let date = this.formatDate(payload.name);
		this.getBenchMarks(date).then((response: any)=>{	
			let returnData: Array<any> = [];
			let all_dates = uniq(response.data.map((row:any)=>row.date));
			var that = this;
			response.data.forEach(function(data:any){
				all_dates.forEach(function(metric_date){
					if(data.date == metric_date){											
						data.workloads.forEach(function(workload:any){
							var d:any = {};
							d["Date"] = that.formatDate(data.date);
							d["Query Name"] = workload.name;
							workload.metrics.forEach(function(metric:any){
								d[metric.name]=(metric.value).toFixed(2);							
							});
							returnData.push(d);
						});
					}				
				});				
			});	
			this.props.getTableData(returnData);
		})
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

		return year + '-' + month + '-' + dt;
	} 
	getBenchMarks(year:any){
		let bm_service = container.get<BenchmarkService>(SERVICE_IDENTIFIER.BM_SERVICE);
		return bm_service.getBenchmarksOnDates(year);
	} 
	
    render() {
        const { x, y } = this.props;
        return (
            <circle
                className='dot'
                onClick={this.onClick}
                cx={x}
                cy={y}
                r={8}
                fill="transparent"/>
        );
    }
}