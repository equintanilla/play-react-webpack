import org.specs2.mutable._
import org.specs2.runner._
import org.junit.runner._

import play.api.test._
import play.api.test.Helpers._
import play.api.libs.json.{ Json }

/**
 * Add your spec here.
 * You can mock out a whole application including requests, plugins etc.
 * For more information, consult the wiki.
 */
@RunWith(classOf[JUnitRunner])
class ApplicationSpec extends Specification {

  "Application" should {

    "send 404 on a bad request" in new WithApplication{
      route(FakeRequest(GET, "/boum")) must beSome.which (status(_) == NOT_FOUND)
    }

    "render the index page" in new WithApplication{
      val home = route(FakeRequest(GET, "/")).get

      status(home) must equalTo(OK)
      contentType(home) must beSome.which(_ == "text/html")
      contentAsString(home) must contain ("CI performance dashboard")
    }
    
    "test build result REST API with POST" in new WithApplication{
      val home = route(FakeRequest(POST, "/api/build_info").withJsonBody(Json.parse("""{"tag":"v2.2.0-rc4","last_commit":"9fd064be5ab9f07f4eb768e45ae82c0b03c00137","jenkins_url":"https://sys-aix-jenkins.swg-devops.com:8443/job/ART-SPARK-PERF-TEST/job/Matrix_test_full/","date":"2017-04-20T08:25:26.807Z"}"""))).get

      status(home) must equalTo(OK)
      contentType(home) must beSome.which(_ == "text/plain")
      println(contentAsString(home))
      contentAsString(home) must contain ("inserted")
    }
    
    "test build result REST API with GET" in new WithApplication{
      val home = route(FakeRequest(GET, "/api/build_info")).get

      status(home) must equalTo(OK)
      contentType(home) must beSome.which(_ == "application/json")
      println(contentAsString(home))
      contentAsString(home) must contain ("jenkins_url")
    }
  }
}
