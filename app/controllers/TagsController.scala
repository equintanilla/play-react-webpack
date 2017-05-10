package controllers

import javax.inject.Inject
import play.modules.reactivemongo.ReactiveMongoApi
import play.api.mvc.Controller
import play.api.Logger
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import reactivemongo.play.json.collection.JSONCollection
import play.api.mvc.Action
import play.api.libs.json.Json
import play.api.libs.json.JsObject
import play.api.libs.json.JsNumber
import play.api.libs.json.JsString
import reactivemongo.play.json._
import reactivemongo.play.json.collection._
import reactivemongo.api.Cursor

class TagsController @Inject() (val mongoApi: ReactiveMongoApi ) extends Controller {
  
  val log:Logger = Logger(getClass);
  
  
  def collection: Future[JSONCollection] =
    mongoApi.database.map(_.collection[JSONCollection]("tpcds"))

  def getBenchmarkTags(tagPattern:String ) = Action.async {
    log.info("Fetching tags with pattern: " + tagPattern)
    val a = collection.flatMap({ 
      _.find(Json.obj("tag" -> Json.obj("$regex" -> JsString(tagPattern))))
        .projection(Json.obj("_id" -> 0, "tag" -> 1))
        .cursor[JsObject]()
        .collect(-1, Cursor.FailOnError[List[JsObject]]())
    })
            
    a.map(x => Ok(Json.toJson(x)))
  }
}