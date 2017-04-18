package services

import javax.inject.Inject
import mongo.dao.UserDao
import com.mohiva.play.silhouette.api.services.IdentityService
import scala.concurrent.ExecutionContext.Implicits.global
import models.User
import com.mohiva.play.silhouette.api.LoginInfo
import scala.concurrent.Future


class UserService @Inject() (userDao:UserDao) extends IdentityService[User]{
  override def retrieve(loginInfo:LoginInfo) = {
    Future{Some(new User("Mahesh","Mahesh"))}
  }
}