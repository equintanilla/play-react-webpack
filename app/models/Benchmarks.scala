package models

import org.joda.time.DateTime

import play.api.libs.json.{ Json, Reads, Writes }

import play.api.libs.functional.syntax.{ unapply, unlift }
import play.api.libs.json.OWrites

case class Tpcds(name: String,
                 cluster_info: ClusterInfo,
                 git_url: String,
                 last_commit: String,
                 date: DateTime,
                 master: String,
                 workloads: Seq[Workload])
case class Workload(name: String, metrics: Seq[Metric])
case class Metric(name: String, value: Float)
case class ClusterInfo(master: NodeInfo, slaves: List[NodeInfo])
case class NodeInfo(hostname: String, ip: String, ram: String, vcpus: Int)

object Tpcds {

  /*
   * Json.reads and Json.writes are macros
   * */
  implicit val jodaDateReads = Reads.jodaDateReads("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
  implicit val jodaDateWrites = Writes.jodaDateWrites("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")

  implicit val metricReads: Reads[Metric] = Json.reads[Metric] /* (
    (JsPath \ "name").read[String] and
    (JsPath \ "value").read[String])(Metric.apply _)*/

  implicit val workloadReads: Reads[Workload] = Json.reads[Workload] /*(
    (JsPath \ "name").read[String] and
    (JsPath \ "metrics").read[Seq[Metric]])(Workload.apply _)*/

  implicit val nodeInfoReads: Reads[NodeInfo] = Json.reads[NodeInfo]
  
  implicit val clusterInfoReads: Reads[ClusterInfo] = Json.reads[ClusterInfo]
  
  

  implicit val tpcdsReads: Reads[Tpcds] = Json.reads[Tpcds] /*(
    (JsPath \ "name").read[String] and
    (JsPath \ "git_url").read[String] and
    (JsPath \ "last_commit").read[String] and
    (JsPath \ "date").read[String].map(DateTime.parse(_)) and 
    (JsPath \ "master").read[String] and
    (JsPath \ "workloads").read[Seq[Workload]])(Tpcds.apply _)*/

  //All the writes

  implicit val nodeInfoWrites: Writes[NodeInfo] = Json.writes[NodeInfo]
  
  implicit val clusterInfoWrites: Writes[ClusterInfo] = Json.writes[ClusterInfo]
  
  

  implicit val metricWrites: Writes[Metric] = Json.writes[Metric] /*(
    (JsPath \ "name").write[String] and
    (JsPath \ "value").write[String])(unlift(Metric.unapply))*/

  implicit val workloadWrites: Writes[Workload] = Json.writes[Workload] /* (
    (JsPath \ "name").write[String] and
    (JsPath \ "metrics").write[Seq[Metric]])(unlift(Workload.unapply))*/

  implicit val tpcdsWrites: OWrites[Tpcds] = Json.writes[Tpcds] /*(

    (JsPath \ "name").write[String] and
    (JsPath \ "git_url").write[String] and
    (JsPath \ "last_commit").write[String] and
    (JsPath \ "date").write[DateTime] and 
    (JsPath \ "master").write[String] and
    (JsPath \ "workloads").write[Seq[Workload]])(unlift(Tpcds.unapply))*/

}