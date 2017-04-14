package controllers.requests.model

import com.google.inject.ImplementedBy


class TestInjectWorks extends TestInject{
  
  
  override def doSomething:String = "Yellow"
}

@ImplementedBy(classOf[TestInjectWorks])
trait TestInject {
  def doSomething:String = "Something"
}