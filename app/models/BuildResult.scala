package models

import org.joda.time.DateTime

import play.api.libs.json.{ Json, Reads, Writes }

import play.api.libs.functional.syntax.{ unapply, unlift }
import play.api.libs.json.OWrites

case class BuildResult(tag: String, last_commit: String, jenkins_url: String, date: DateTime)


object BuildResult{
  implicit val jodaDateReads = Reads.jodaDateReads("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
  implicit val jodaDateWrites = Writes.jodaDateWrites("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
  
  implicit val buildResultReads: Reads[BuildResult] = Json.reads[BuildResult]
  implicit val buildResultWrites: OWrites[BuildResult] = Json.writes[BuildResult]
}