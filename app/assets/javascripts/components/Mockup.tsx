import * as  React from 'react';
import container from "../inversify.config";
import BenchmarkService from "../services/benchmark_service";
import SERVICE_IDENTIFIER from "../constants/identifiers";
import {Graph} from './Graph';
import { DateRangePicker, SingleDatePicker, DayPickerRangeController } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import * as moment from 'moment';

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
const data = {
  points: {
    total: [ "q1-q10", "q10-q20", "q20-q30", "q30-q40","q40-q50","q50-q60","q60-q70","q70-q80","q80-q90","q90-q100"]
  }
}

export class Mockup extends React.Component <any,any>{

	constructor(props:any){
        super(props)      
		this.state ={
			selectedTabId : 0,
			query_names: [],
			startDate: null,
			endDate: null,
			focusedInput: null,
			dateFormat: 'YYYY/MM/DD'
		}
	}
  
	isActive(id) {
		return this.state.selectedTabId === id;
	} 
	setActiveTab(selectedTabId) {
		this.setState({ selectedTabId });
	}
	componentDidMount(){				
		var SelectedStartDate = moment('2017/04/14',"YYYY/MM/DD");
		var SelectedEndDate = moment('2017/07/01',"YYYY/MM/DD");
		this.setState({startDate: SelectedStartDate});
		this.setState({endDate: SelectedEndDate});
	}	
	render() {
      var total = data.points.total,
    	tabs = total.map(function (el, i) {
          return <Tab 
            key={ i }
            content={ el } 
            isActive={ this.isActive(i) } 
            onActiveTab={ this.setActiveTab.bind(this, i) }
          />
        }, this);
	   var query_names =["q1-1.4","q2-1.4","q3-1.4","q4-1.4","q5-1.4","q6-1.4","q7-1.4","q8-1.4","q9-1.4","q10-1.4"]
	   var i=0;
       return(
		   <div>
			   <div className="tab">
					{ tabs }
				   </div>
				   <div className="tabContent">
				   <h1>Spark Performance Benchmark trend</h1> 
				   <br/>
				   <DateRangePicker
						  startDate={this.state.startDate}
						  endDate={this.state.endDate}
						  onDatesChange={({ startDate, endDate }) => this.setState({ startDate, endDate })} 
						  focusedInput={this.state.focusedInput}
						  displayFormat={this.state.dateFormat}
						  onFocusChange={focusedInput => this.setState({ focusedInput })} 
					/>
					<button type="button" className="btn-lg btnMargin">Apply</button>
					<br/>
					<br/>
					<br/>
					 {
						query_names.map((names) => {							
							return <Graph queryname={names}/>
						})
					 }					
				</div>
			</div>
	   );
    }
}