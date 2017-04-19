package modules

import com.google.inject.AbstractModule
import net.codingwell.scalaguice.ScalaModule
import com.mohiva.play.silhouette.api.SilhouetteProvider
import auth.DefaultEnv
import com.mohiva.play.silhouette.api.Silhouette
import com.google.inject.Provides
import services.UserService
import com.mohiva.play.silhouette.api.services.AuthenticatorService
import com.mohiva.play.silhouette.api.Environment
import com.mohiva.play.silhouette.impl.authenticators.CookieAuthenticator
import com.mohiva.play.silhouette.api.EventBus
import play.api.libs.concurrent.Execution.Implicits._
import javax.inject.Named
import com.mohiva.play.silhouette.api.crypto.CookieSigner
import com.mohiva.play.silhouette.api.crypto.Crypter
import com.mohiva.play.silhouette.api.util.FingerprintGenerator
import com.mohiva.play.silhouette.api.util.IDGenerator

import com.mohiva.play.silhouette.api.util.Clock
import com.mohiva.play.silhouette.impl.authenticators.CookieAuthenticatorService
import play.api.Configuration
import com.mohiva.play.silhouette.impl.authenticators.CookieAuthenticatorSettings
import com.mohiva.play.silhouette.crypto.{ JcaCookieSigner, JcaCookieSignerSettings, JcaCrypter, JcaCrypterSettings }
import com.mohiva.play.silhouette.api.crypto.CrypterAuthenticatorEncoder
//this is a Typesafe config reader that provides as method
import net.ceedubs.ficus.Ficus._
import net.ceedubs.ficus.readers.ArbitraryTypeReader._
import com.mohiva.play.silhouette.impl.util.{SecureRandomIDGenerator,DefaultFingerprintGenerator }

class SilhModule extends AbstractModule with ScalaModule {
  def configure() {
    bind[Silhouette[DefaultEnv]].to[SilhouetteProvider[DefaultEnv]]
    bind[IDGenerator].toInstance(new SecureRandomIDGenerator())
    bind[FingerprintGenerator].toInstance(new DefaultFingerprintGenerator(false))
    bind[EventBus].toInstance(EventBus())
    bind[Clock].toInstance(Clock())
  }

  /**
   * Provides the Silhouette environment.
   *
   * @param userService The user service implementation.
   * @param authenticatorService The authentication service implementation.
   * @param eventBus The event bus instance.
   * @return The Silhouette environment.
   */
  @Provides
  def provideEnvironment(
    userService: UserService,
    authenticatorService: AuthenticatorService[CookieAuthenticator],
    eventBus: EventBus): Environment[DefaultEnv] = {

    Environment[DefaultEnv](
      userService,
      authenticatorService,
      Seq(),
      eventBus)
  }

  /**
   * Provides the cookie signer for the authenticator.
   *
   * @param configuration The Play configuration.
   * @return The cookie signer for the authenticator.
   */
  @Provides @Named("authenticator-cookie-signer")
  def provideAuthenticatorCookieSigner(configuration: Configuration): CookieSigner = {
    val config = configuration.underlying.as[JcaCookieSignerSettings]("silhouette.authenticator.cookie.signer")

    new JcaCookieSigner(config)
  }

  /**
   * Provides the crypter for the authenticator.
   *
   * @param configuration The Play configuration.
   * @return The crypter for the authenticator.
   */
  @Provides @Named("authenticator-crypter")
  def provideAuthenticatorCrypter(configuration: Configuration): Crypter = {
    val config = configuration.underlying.as[JcaCrypterSettings]("silhouette.authenticator.crypter")

    new JcaCrypter(config)
  }

  @Provides
  def provideAuthenticatorService(
    @Named("authenticator-cookie-signer") cookieSigner: CookieSigner,
    @Named("authenticator-crypter") crypter: Crypter,
    fingerprintGenerator: FingerprintGenerator,
    idGenerator: IDGenerator,
    configuration: Configuration,
    clock: Clock): AuthenticatorService[CookieAuthenticator] = {
    
    val config = configuration.underlying.as[CookieAuthenticatorSettings]("silhouette.authenticator")
    val encoder = new CrypterAuthenticatorEncoder(crypter)

    new CookieAuthenticatorService(config, None, cookieSigner, encoder, fingerprintGenerator, idGenerator, clock)
  }

}