package mongo.aggregation

import play.modules.reactivemongo.ReactiveMongoApi
import javax.inject.Inject
import play.api.Logger
import reactivemongo.play.json._
import reactivemongo.play.json.collection._
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.libs.json.JsString
import play.api.libs.json.Json
import com.google.inject.ImplementedBy
import play.api.libs.json.JsObject

@ImplementedBy(classOf[TpcdsDbMongo])
trait TpcdsDb{
  def aggregateValuesForTopGraph():Future[List[play.api.libs.json.JsObject]] ;
  def filterByQnameAndDates(fromDate:String , toDate:String , qName:String):Future[List[play.api.libs.json.JsObject]] ;;  
}


class TpcdsDbMongo  @Inject() (val reactiveMongoApi: ReactiveMongoApi)  extends TpcdsDb{

  def collection: Future[JSONCollection] =
    reactiveMongoApi.database.map(_.collection[JSONCollection]("tpcds"))
    
  def TpcdsDbMongo()= {
    
  }
  
  val log:Logger = Logger(getClass);


  
  
  /*
   * Method that implements below query
   *  db.tpcds.aggregate([{$unwind:"$workloads"},
		{$unwind:"$workloads.metrics"},
		{$group:{_id:{date:"$date",name:"$workloads.metrics.name"},average:{$avg:"$workloads.metrics.value"}}},
		{$sort:{"_id.date":1}}])
		
   * 
   * */
  
  def aggregateValuesForTopGraph():Future[List[JsObject]] = {
    collection.flatMap(col => {
    import col.BatchCommands.AggregationFramework.{AggregationResult, 
      Group, 
      AvgField,
      UnwindField,
      Sort,
      Ascending}
    
    //JSON object with two fields date and name, with respective $ values 
    val groupByIdentifier =  
        Json.obj(  "date" -> JsString("$date"),  
                  "name" -> JsString("$workloads.metrics.name")
        )
    //this api takes two parameters, first is the first operator in the pipeline
    //the second is a list of the remaining parameters.
    val res: Future[AggregationResult] = col.aggregate(
      UnwindField("workloads"),
      List( UnwindField("workloads.metrics"),
          Group(groupByIdentifier)("average"-> AvgField("workloads.metrics.value")),
          Sort(Ascending("_id.date"))
      )
    )
    res.map(_.firstBatch)
    })
  }
 
  /**
   * db.tpcds.aggregate([{$unwind:"$workloads"},
   * {$match:
   * 		{$and:[
   * 			{"workloads.name":"q4-v1.4"},
   * 			{"date":{$gt:"2016-03-15"}},
   * 			{"date":{$lt:"2017-03-16"}}]
   * 		}
   * }])
   */
  
  def filterByQnameAndDates(fromDate:String , toDate:String , qName:String):Future[List[JsObject]] = {
    collection.flatMap(col => {
    import col.BatchCommands.AggregationFramework.{AggregationResult, 
      UnwindField,
      Match
      }
    
    //JSON object with three fields date and name, with respective $ values 
    //wrapped in a $and
    val matchDoc =  Json.obj("$and" -> 
        Json.arr(
        Json.obj("workloads.name" -> new JsString(qName)),
        Json.obj("date" -> Json.obj("$gt" -> new JsString(fromDate))),
        Json.obj("date" -> Json.obj("$lt" -> new JsString(toDate)))
      )
    )
    //this api takes two parameters, first is the first operator in the pipeline
    //the second is a list of the remaining parameters.
    val res: Future[AggregationResult] = col.aggregate(
      UnwindField("workloads"),
      List(Match(matchDoc) )
      )
    
    res.map(_.firstBatch)
    })
  }
}