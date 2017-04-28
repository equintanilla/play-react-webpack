import * as  React from 'react';
import {flatten,uniq} from 'lodash';
import container from "../inversify.config";
import BenchmarkService from "../services/benchmark_service";
import SERVICE_IDENTIFIER from "../constants/identifiers";
import Loader from "./Loader";
import { BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

function shortDate(date:string, row:any){
    return new Date(date).toISOString().slice(0, 10);
}    

export class TPCDS extends React.Component<any,any>{

    constructor(props:any){
        super(props)
        
        this.state = {
            bm_data : [],
            load_names: [],
            loading: true
        };
    }
    
    getBenchMarks(){
        let bm_service = container.get<BenchmarkService>(SERVICE_IDENTIFIER.BM_SERVICE);
        return bm_service.getBenchmarks();
    }
    
    componentDidMount(){
        this.setState({loading: true}) 
        this.getBenchMarks().then((res: any)=>{
            let all_wl = res.data.map((a: any) => a.workloads.map((wl: any) => wl.name))
            let load_names = uniq(flatten(all_wl))
			
            let mod_data  = res.data.map((row:any) =>{ row.workloads.map((workload: any) => workload.metrics.map((metric: any) => { row[metric.name+workload.name] = metric.value}))
					return row
            });
            this.setState({bm_data: mod_data});
            this.setState({load_names: load_names})
            this.setState({loading: false})
        });
    }
    
    render(){
        if(this.state.loading){
            return (<Loader/>)
        }
        return(
            <div>
                <BootstrapTable data={this.state.bm_data}  keyField='date' striped>
                    <TableHeaderColumn tdStyle={ { 'width': '150px' } } thStyle={ { 'width': '150px' } }  row='0' rowSpan='2' dataField='name'>Benchmark Name</TableHeaderColumn>
                    <TableHeaderColumn tdStyle={ { 'width': '150px' } } thStyle={ { 'width': '150px' } } row='0' rowSpan='2' dataField='date' dataFormat={shortDate} >Date</TableHeaderColumn>
                    <TableHeaderColumn tdStyle={ { 'width': '150px' } } thStyle={ { 'width': '150px' } } row='0' rowSpan='2' dataField='git_url' > repo url</TableHeaderColumn>

					{ this.state.load_names.map(
                       function(name:string) { return [<TableHeaderColumn  row='0' colSpan='4' tdStyle={ { 'width': '400px' } } thStyle={ { 'width': '400px' } } >{name}</TableHeaderColumn>,
                            <TableHeaderColumn  tdStyle={ { 'width': '100px' } } thStyle={ { 'width': '100px' } }  dataField={"minTimeMs"+name} row='1'>min-time</TableHeaderColumn>,
                            <TableHeaderColumn tdStyle={ { 'width': '100px' } } thStyle={ { 'width': '100px' } } dataField={"maxTimeMs"+name} row='1'>max-time</TableHeaderColumn>,
                            <TableHeaderColumn tdStyle={ { 'width': '100px' } } thStyle={ { 'width': '100px' } } dataField={"avgTimeMs"+name} row='1'>avg-time</TableHeaderColumn>,
                            <TableHeaderColumn tdStyle={ { 'width': '100px' } } thStyle={ { 'width': '100px' } } dataField={"stdDev"+name} row='1'>std-dev</TableHeaderColumn> ]
                        })
					}
                </BootstrapTable>
            </div>
            );
    }
};

export default TPCDS;
