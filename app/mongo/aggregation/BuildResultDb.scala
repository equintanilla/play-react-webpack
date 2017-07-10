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

@ImplementedBy(classOf[BuildResultDbMongo])
trait BuildResultDb{
}

class BuildResultDbMongo  @Inject() (val reactiveMongoApi: ReactiveMongoApi)  extends BuildResultDb{

  def collection: Future[JSONCollection] =
    reactiveMongoApi.database.map(_.collection[JSONCollection]("build_result"))
    
  def BuildResultDbMongo()= {
    
  }
  
  val log:Logger = Logger(getClass)
}