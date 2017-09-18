import java.net.InetSocketAddress
import play.sbt.PlayRunHook
import sbt._

object Webpack {
  def apply(base: File): PlayRunHook = {
    object WebpackHook extends PlayRunHook {
      var process: Option[Process] = None

      override def beforeStarted() = {
        
/*        println("Starting webpack")
        process = Option(
          Process("webpack", base).run
        )*/
      }

      /*override def afterStarted(addr: InetSocketAddress) = {
        process = Some(
          Process("webpack.cmd --watch", base).run
        )
        println("Started webpack --watch for "+base)
      }

      override def afterStopped() = {
        process.map(p =>{
                        println("killing "+p)
                        p.destroy()
                        var x = p.exitValue()
                        println("Exited with value "+x)
            })
      }*/
    
    }
    WebpackHook
  }
}
