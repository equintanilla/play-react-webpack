import * as React from 'react';
import container from "../inversify.config";
import BuildService from "../services/build_service";
import SERVICE_IDENTIFIER from "../constants/identifiers";

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
    console.log(this.state.data);
    return(<div>
      <ul>
        {
          this.state.data.builds.map((build:any) =>
          {
            return(<li key={build.tag}><a  href={build.url} target="_blank" >{build.url}</a></li>);
          }
        }
        </ul></div>)
  }

  componentDidMount(){
    this.setState({message:"Ok bye!"});
    this.getAllBuildList().then((res:any)=>{
      this.setState({data:res});
    })
  }
}
