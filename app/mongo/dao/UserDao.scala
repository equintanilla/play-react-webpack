package mongo.dao

import models.User
import com.google.inject.ImplementedBy

class UserDaoImpl extends UserDao {
  def get(username:String) = new User("Mahesh","Mahesh")
}

@ImplementedBy(classOf[UserDaoImpl])
trait UserDao{
  def get(username:String):User
}