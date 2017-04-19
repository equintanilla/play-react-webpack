package auth

import com.mohiva.play.silhouette.impl.authenticators.CookieAuthenticator
import models.User
import com.mohiva.play.silhouette.api.Env

trait DefaultEnv extends Env {
    type I = User
    type A = CookieAuthenticator
}