package controller

import play.modules.reactivemongo.ReactiveMongoApi
import controllers.TagsController
import org.scalatest.mockito.MockitoSugar
import org.scalatestplus.play.PlaySpec
import play.api.test.FakeRequest
import scala.concurrent.Future
import play.api.mvc._
import org.scalatest.mock._
import org.mockito.Mockito._
import reactivemongo.api.DefaultDB
import reactivemongo.play.json.collection.JSONCollection
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.libs.json.Json
import play.api.libs.json.JsObject
import play.api.libs.json.JsNumber
import play.api.libs.json.JsString
import play.api.Logger
import org.scalatestplus.play._
import play.api.test.Helpers._
import org.scalatest.Matchers

class TagsControllerSpec extends PlaySpec with MockitoSugar with Results {
  
  val log:Logger = Logger(getClass);
  
  
  "TagsControllerSpec#getBenchmarkTags" should {
    "return a list of matching json tags" in {
      val mongoApi = mock[ReactiveMongoApi]
      val mongoDb = mock[Future[DefaultDB]]
      when(mongoApi.database).thenReturn(mongoDb)
      
      val jsonColl = mock[Future[JSONCollection]]
      when(mongoDb.map(_.collection[JSONCollection]("tpcds"))).thenReturn(jsonColl)
      
      val pattern = "pattern"
      
      val tags:Set[String] = Set("tag1","tag2")
      
      when(jsonColl.flatMap({ 
      _.distinct[String,Set]("tag",Option(Json.obj("tag" -> Json.obj("$regex" -> JsString(pattern)))))
    })).thenReturn(Future(tags))
      
      val tagController = new TagsController(mongoApi)
      val result:Future[Result] = tagController.getBenchmarkTags(pattern).apply(FakeRequest())
      
      val bodyText: String = contentAsString(result)
      bodyText must include ("tag1")
      bodyText  must include ("tag2")
      //uncomment this to test failure
      //bodyText  must include ("tag3")
    }
  }
}