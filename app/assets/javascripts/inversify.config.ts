import { Container } from "inversify";
//reflect-metadata should be imported
//before any interface or other imports
//also it should be imported only once
//so that a singleton is created.
import "reflect-metadata";
import Battle from "./interfaces/battle";
import EpicBattle from "./interfaces/epic_battle";
import SERVICE_IDENTIFIER from "./constants/identifiers";
import BenchmarkService from "./services/benchmark_service";
import TpcdsBenchmarkService from "./services/tpcds_benchmark_service";
import BuildService from "./services/build_service";
import TpcdsBuildService from "./services/tpcds_build_service";

let container = new Container();
container.bind<Battle>(SERVICE_IDENTIFIER.BATTLE).to(EpicBattle);
container.bind<BuildService>(SERVICE_IDENTIFIER.BUILD_SERVICE).to(TpcdsBuildService);
container.bind<BenchmarkService>(SERVICE_IDENTIFIER.BM_SERVICE).to(TpcdsBenchmarkService);
export default container;
