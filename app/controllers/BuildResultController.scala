package controllers

import play.api.mvc._
import play.api.Logger
import play.modules.reactivemongo.ReactiveMongoApi
import javax.inject.Inject
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import scala.concurrent.Future
import play.api.libs.json.{ Json, JsObject, JsString }

import reactivemongo.play.json._
import reactivemongo.play.json.collection._

import models.BuildResult
import models.BuildResult._
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
import mongo.aggregation.BuildResultDb
import controllers.requests.model.FilterRequest
import controllers.requests.model.TestInject


class BuildInfoController @Inject() (val reactiveMongoApi: ReactiveMongoApi,
  val buildResultDb:BuildResultDb ) extends Controller {
  val log:Logger = Logger(getClass)
  
  
  def collection: Future[JSONCollection] =
    reactiveMongoApi.database.map(_.collection[JSONCollection]("build_results"))

  def syncCollection = reactiveMongoApi.db.collection("build_results")
  
  def index = Action.async { implicit request =>
   
    val found = collection.map(_.find(Json.obj())
        .sort(Json.obj("date" -> -1))
        .cursor[JsObject]()
        .collect(-1, Cursor.FailOnError[List[JsObject]]())
        )
 
    found.flatMap(buildResults => buildResults.map(buildResultList => Ok(Json.toJson(buildResultList))))    
    .recover {
      case e =>
        log.error("Something went wrong", e)
        e.printStackTrace()
        BadRequest(e.getMessage())
    }
  }
  
  def create = Action.async(parse.json) { implicit request =>
    val buildResult = request.body.validate[BuildResult]
    buildResult.fold[Future[Result]](
      errors => {
        log.error("Validation failed:" + errors)
        Future { BadRequest(Json.obj("status" -> "KO", "message" -> JsError.toJson(errors))) }
      },
      build_result => {
        val response = collection.map(_.insert(build_result).map[Result](wr => wrToResult(wr)))
        Await.result(response, scala.concurrent.duration.Duration.Inf)
      })
  }
  
  def wrToResult(wr: WriteResult): Result = {
    if (wr.ok) {
      Ok(wr.n + " row(s) inserted")
    } else {
      BadRequest(wr.writeErrors.mkString(","))
    }
  }
}
