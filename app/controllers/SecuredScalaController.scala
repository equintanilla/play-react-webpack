package controllers

import play.api.mvc.Controller
import play.api.Logger
import play.api.mvc.Action
import com.mohiva.play.silhouette.api.Silhouette
import auth.DefaultEnv
import javax.inject.Inject


class SecuredScalaController @Inject() (silhouette: Silhouette[DefaultEnv]) extends Controller {
  val log:Logger = Logger(getClass);
  
  def index() = Action {
    log.info("Got to secured controller")
    Ok("You got to a secured controller")
  }
}