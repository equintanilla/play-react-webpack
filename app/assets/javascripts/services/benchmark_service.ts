interface BenchmarkService{
  getBenchmarks():any;
	getBenchmarksGraphs():any;
	getBenchmarksOnDates(date:any):any;
	getBenchmarksForDates(startDate:any,endDate:any,queryName:any):any;
}

export default BenchmarkService;
