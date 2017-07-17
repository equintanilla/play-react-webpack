package models

import org.joda.time.DateTime

import play.api.libs.json.{ Json, Reads, Writes }

import play.api.libs.functional.syntax.{ unapply, unlift }
import play.api.libs.json.OWrites

case class BuildResult(tag: String, last_commit: String, jenkins_url: String, date: DateTime)


object BuildResult{
  implicit val jodaDateReads = Reads.jodaDateReads("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
  implicit val jodaDateWrites = Writes.jodaDateWrites("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
  
  implicit val buildResultReads: Reads[BuildResult] = Json.reads[BuildResult] /*(
    (JsPath \ "tag").read[String] and
    (JsPath \ "last_commit").read[String] and
    (JsPath \ "jenkins_url").read[String] and
    (JsPath \ "date").read[String].map(DateTime.parse(_)) (BuildResult.apply _)*/
  implicit val buildResultWrites: OWrites[BuildResult] = Json.writes[BuildResult] /*(
    (JsPath \ "tag").read[String] and
    (JsPath \ "last_commit").read[String] and
    (JsPath \ "jenkins_url").read[String] and
    (JsPath \ "date").read[String].map(DateTime.parse(_)) (unlift(BuildResult.unapply))*/
  
}