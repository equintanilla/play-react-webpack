package controllers

import play.api.mvc.Controller
import play.api.Logger
import play.api.mvc.Action

class SecuredScalaController extends Controller {
  val log:Logger = Logger(getClass);
  
  def index() = Action {
    log.info("Got to secured controller")
    Ok("You got to a secured controller")
  }
}