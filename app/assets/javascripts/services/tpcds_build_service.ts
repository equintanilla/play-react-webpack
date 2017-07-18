import BuildService from "./build_service"
import {injectable} from "inversify"

//import * as BB from "bluebird";
import axios from "axios";

@injectable()
export default class TpcdsBuildService implements  BuildService {

  getBuilds() {
    let that = this;
    console.log("get builds of tpcds_build_service")

    return axios.get("/api/build_info",
                {headers: {'Content-Type': 'application/json'}});
    /*return new Promise(function(resolve){
      resolve(that.getBuildsMock())
    });*/
  }

  getBuildsMock(){
    return {
      builds:[
        {"tag":"xxx", "date":"", "url":"https://sys-aix-jenkins.swg-devops.com/job/ART-SPARK-PERF-TEST/job/Matrix_test_full/22/"},
        {"tag":"xxy","date":"", "url":"https://sys-aix-jenkins.swg-devops.com/job/ART-SPARK-PERF-TEST/job/Matrix_test_full/22/"}
      ]
    };
  }

  addBuild(build:any){

  }
}
