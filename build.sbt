name := """play-react-webpack"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala,DebianPlugin)


maintainer in Linux := "Mahesh Sawaiker <maheshsa@us.ibm.com>"

packageSummary in Linux := "Dashboard to show performance benchmark numbers"

packageDescription := "This is a web application, UI dashboard that pulls data from mongo db and shows fancy graphs"

scalaVersion := "2.11.8"

libraryDependencies ++= Seq(
  jdbc,
  cache,
  ws,
  specs2 % Test,
  "com.codeborne" % "phantomjsdriver" % "1.2.1"
)

libraryDependencies ++= Seq(
  "com.mohiva" %% "play-silhouette" % "4.0.0",
  "com.mohiva" %% "play-silhouette-password-bcrypt" % "4.0.0",
  "net.codingwell" %% "scala-guice" % "4.0.1",
  "com.mohiva" %% "play-silhouette-crypto-jca" % "4.0.0",
  "com.iheart" %% "ficus" % "1.2.6",
  "org.reactivemongo" %% "play2-reactivemongo" % "0.12.1",
  "org.scalatestplus.play" %% "scalatestplus-play" % "2.0.1" % "test"
)

//PlayKeys.playRunHooks += Webpack(baseDirectory.value)

routesGenerator := InjectedRoutesGenerator

excludeFilter in (Assets, JshintKeys.jshint) := "*.js"

watchSources ~= { (ws: Seq[File]) =>
  ws filterNot { path =>
    path.getName.endsWith(".js") || path.getName == ("build")
  }
}

pipelineStages := Seq(digest, gzip)

resolvers += "scalaz-bintray" at "http://dl.bintray.com/scalaz/releases"
resolvers += "Atlassian Releases" at "https://maven.atlassian.com/public/"
resolvers += "jcenter" at "https://jcenter.bintray.com/"
