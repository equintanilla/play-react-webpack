package models

import com.mohiva.play.silhouette.api.Identity

case class User(username:String ,password:String) extends Identity