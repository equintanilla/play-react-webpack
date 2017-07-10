import * as React from 'react';
import container from "../inversify.config";
import BuildService from "../services/build_service";
import SERVICE_IDENTIFIER from "../constants/identifiers";
import { BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';


class URLFormatter extends React.Component<any,any> {
  render() {
    return (
      <a href={ this.props.url } target="_blank">
        {this.props.url}
       </a>
    );
  }
}

function urlFormatter(cell:any, row:any) {
  return (
    <URLFormatter url={ cell } />
  );
}


export class BuildList extends React.Component<any,any>{

  constructor(props:any){
        super(props)
        this.state={
          data:{builds:[]},
          message:"hi there!"
        };
    }

  getAllBuildList(){
    let build_service = container.get<BuildService>(SERVICE_IDENTIFIER.BUILD_SERVICE);
    return build_service.getBuilds();
  }

  render(){
    //console.log(this.state.data);
    //console.log("Builds Length is :"+ this.state.data.builds.length);
    if(this.state.data.builds.length == 0){
      return(<div>No builds found</div>);
    }

    return(<div>
      <BootstrapTable data={this.state.data.builds} keyField="tag" striped hover>
        <TableHeaderColumn  dataField="date" >Build Date </TableHeaderColumn>
        <TableHeaderColumn  dataField="tag" >Build Tag </TableHeaderColumn>
        <TableHeaderColumn  dataField="url" dataFormat={urlFormatter} >URL </TableHeaderColumn>
      </BootstrapTable>
    </div>)
  }

  componentDidMount(){
    this.setState({message:"Ok bye!"});
    this.getAllBuildList().then((res:any)=>{
      this.setState({data:res});
    })
  }
}
