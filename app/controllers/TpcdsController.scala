package controllers
import play.api._

import play.api.mvc._
import play.modules.reactivemongo.ReactiveMongoApi
import javax.inject.Inject
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import scala.concurrent.Future
import play.api.libs.json.{ Json, JsObject, JsString }

import reactivemongo.play.json._
import reactivemongo.play.json.collection._

import models.Tpcds
import models.Tpcds._
import play.api.libs.json.JsError
import scala.util.Failure
import scala.util.Success
import play.api.libs.json.JsPath
import play.api.data.validation.ValidationError
import reactivemongo.api.commands.WriteResult
import scala.concurrent.Await

import scala.concurrent.duration._
import scala.concurrent.duration.Duration.Infinite
import scala.concurrent.duration.Duration.Infinite
import reactivemongo.bson.BSONDocument
import reactivemongo.bson.BSONString
import play.api.libs.json.JsValue
import reactivemongo.api.SortOrder
import reactivemongo.api.Cursor
import org.joda.time.DateTime
import mongo.aggregation.TpcdsDb
import mongo.aggregation.TpcdsDb
import controllers.requests.model.FilterRequest
import controllers.requests.model.TestInject



class TpcdsController @Inject() (val reactiveMongoApi: ReactiveMongoApi,
  val tpcdsDb:TpcdsDb ) extends Controller {

  val log:Logger = Logger(getClass);
  
  
  def collection: Future[JSONCollection] =
    reactiveMongoApi.database.map(_.collection[JSONCollection]("tpcds"))

  def syncCollection = reactiveMongoApi.db.collection("tpcds")

  def index = Action.async { implicit request =>
   
    val found = collection.map(_.find(Json.obj())
        .sort(Json.obj("date" -> -1))
        .cursor[JsObject]()
        .collect(-1, Cursor.FailOnError[List[JsObject]]())
        )
 
    found.flatMap(benchMarks => benchMarks.map(bmList => Ok(Json.toJson(bmList))))    
    .recover {
      case e =>
        log.error("Something went wrong", e)
        e.printStackTrace()
        BadRequest(e.getMessage())
    }
  }

  
  def create_exp = Action.async(parse.json) { implicit request =>
    val tpcdsResult = request.body.validate[Tpcds]
    tpcdsResult.fold[Future[Result]](
      errors => {
        log.error("Validation failed:" + errors)
        Future { BadRequest(Json.obj("status" -> "KO", "message" -> JsError.toJson(errors))) }
      },
      tpcds => {
        collection.flatMap(_.insert(tpcds).map[Result](wr => wrToResult(wr)))
      })
  }

  
  def create = Action.async(parse.json) { implicit request =>
    val tpcdsResult = request.body.validate[Tpcds]
    tpcdsResult.fold[Future[Result]](
      errors => {
        log.error("Validation failed:" + errors)
        Future { BadRequest(Json.obj("status" -> "KO", "message" -> JsError.toJson(errors))) }
      },
      tpcds => {
        val response = collection.map(_.insert(tpcds).map[Result](wr => wrToResult(wr)))
        Await.result(response, scala.concurrent.duration.Duration.Inf)
      })

  }

  /**
   * this method is kept here to show 
   * how to use old api, most examples on the internet
   * use this api so if one cannot do using new aysnch api.
   * The synchronous api is always an option 
   */
  def create_mongo_old_api = Action.async(parse.json) { implicit request =>
    val tpcdsResult = request.body.validate[Tpcds]
    tpcdsResult.fold(
      errors => {
        log.error("Validation failed:" + errors)
        Future{ BadRequest(Json.obj("status" -> "KO", "message" -> JsError.toJson(errors))) } 
      },
      tpcds => {
        val response = syncCollection.insert(tpcds)
        response.map(wrToResult)
      })
  }
  
  def wrToResult(wr: WriteResult): Result = {
    if (wr.ok) {
      Ok(wr.n + " Rows updated")
    } else {
      BadRequest(wr.writeErrors.mkString(","))
    }
  }
  
  
  /*
   * Method that implements below query
   *  db.tpcds.aggregate([{$unwind:"$workloads"},
		{$unwind:"$workloads.metrics"},
		{$group:{_id:{date:"$date",name:"$workloads.metrics.name"},average:{$avg:"$workloads.metrics.value"}}},
		{$sort:{"_id.date":1}}])
		
   * 
   * */
  
  def graph = Action.async{ implicit request =>
    val x = tpcdsDb.aggregateValuesForTopGraph()
    x.map( a => Ok(Json.toJson(a))) 
  }

  
  def read_by_date(date: String) = Action.async{
    val found = collection.map(_.find(Json.obj("date" -> Json.obj("$regex" -> new JsString(date+".*"))))
    .cursor[Tpcds]()
    .collect(-1, Cursor.FailOnError[List[Tpcds]]())
    )
    found.flatMap(benchMarks => benchMarks.map(bmList => Ok(Json.toJson(bmList))))    
    .recover {
      case e =>
        log.error("Something went wrong", e)
        e.printStackTrace()
        BadRequest(e.getMessage())
    }   
  }
  
  def read_by_dates_qname = Action.async(parse.json){ implicit request => 
    val valResult = request.body.validate[FilterRequest]
    valResult.fold[Future[Result]](
      errors => {
        log.error("Validation failed:" + errors)
        Future { BadRequest(Json.obj("status" -> "KO", "message" -> JsError.toJson(errors))) }
      },
      frRequest => {
         val x = tpcdsDb.filterByQnameAndDates(frRequest.from_date,frRequest.to_date,frRequest.q_name)
         x.map( a => Ok(Json.toJson(a)))     
      })
  }
  
  
  
  def read(id: String) = TODO

  def update(id: String) = TODO

  def delete(id: String) = TODO
}