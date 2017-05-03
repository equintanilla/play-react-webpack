Play framework, ReactJs and webpack
===================================

This is a simple project to illustrate how to setup playframework to work with react js, es6 and webpack

Just checkout the project and do ```npm install```to install all dependencies or rebuild it step by step by following instructions below.

# Initialize npm project
```
npm init
```

# Install react
```
npm install react react-dom --save
```

# Install dependencies for dev
```
npm install webpack --save-dev
npm install babel-core babel-loader babel-preset-react babel-preset-es2015 babel-plugin-transform-react-jsx --save-dev
npm install babel-plugin-react-require --save-dev
```

# .babelrc content :

```
{
  "presets": ["es2015", "react"],
  "plugins": [
    "react-require"
  ]
}
``

## For linting

```
npm install eslint eslint-loader --save-dev
```
## For handling CSS and Sass
```
npm install node-sass css-loader sass-loader style-loader --save-dev
```
    "jsx-loader": "^0.13.2",
    "node-sass": "^3.4.2",
    "style-loader": "^0.13.0",
    "webpack": "^1.12.9",
    "webpack-dev-server": "^1.14
```

## Steps to create .dbe installable file and running it as a service
1. Clone the git repo
2. cd play-react-webpack

3. Edit build.sbt file to add below lines. Make sure to update maintainer value as per need.

	lazy val root = (project in file("."))
	  .enablePlugins(PlayScala, DebianPlugin)

	maintainer in Linux := "First Lastname <first.last@example.com>"
	
	packageSummary in Linux := "play-react-webpack"
	
	packageDescription := "play-react-webpack"

4. Start play using command sbt on Linux prompt

6. Execute below command on play prompt to generate new secret key and update same in application.conf file. 
	
	$ playGenerateSecret
	
	$ playUpdateSecret

6. run `debian:packageBin` on play prompt, it will create .deb file under play-react-webpack/target directory

7. to install app as package, run below command

	e.g. sudo dpkg -i play-react-webpack_1.0-SNAPSHOT_all.deb

8. Edit file /etc/init/play-react-webpack.conf by replacing line in between script .... end script i.e. "exec sudo -u play-react-webpack bin/play-react-webpack" with below lines

	```
	if [ -f /usr/share/play-react-webpack/RUNNING_PID ]
	then
	rm /usr/share/play-react-webpack/RUNNING_PID 1>/dev/null
	fi
	bin/play-react-webpack
	```

9. To start/stop application as service, run 

	sudo start play-react-webpack 
	
	sudo stop play-react-webpack

10. log locations -

	/usr/share/play-react-webpack/logs
	
	/var/log/upstart/play-react-webpack

