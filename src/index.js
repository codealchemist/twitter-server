#!/bin/env node

var express = require('express')
// var favicon = require('serve-favicon')
var bodyParser = require('body-parser')
var session = require('express-session')
var morgan = require('morgan')
var cookieParser = require('cookie-parser')
var errorhandler = require('errorhandler')
var http = require('http')
var cors = require('cors')
var app = express()
var argv = require('minimist')(process.argv.slice(2))

// read config
var fs = require('fs')
var configFile = argv['c'] || argv['config']
var defaultConfigFile = process.cwd() + '/src/config'
if (!configFile) {
	configFile = defaultConfigFile
} else {
	if (!configFile.match('.json$')) {
		console.error('- ERROR: config file must be a JSON file:', configFile)
		configFile = defaultConfigFile
	} else {
		try {
			var stats = fs.lstatSync(configFile)
			configFile = process.cwd() + '/' + configFile.replace('.json', '')
		} catch (e) {
			console.error('- ERROR: unable to read config file', configFile)
			configFile = defaultConfigFile
		}
	}
}

if (configFile === defaultConfigFile) {
	console.info('- using default config (you will need to add your twitter credentials)')
}
console.info('- config file:', configFile)
var config = require(configFile)

// set ip and port
var ip = config.ip || '127.0.0.1'
var port = config.port || process.env.port || 3080

// set port and ip
app.set('port', port)
app.set('ip', ip)

app.use(cors())
app.use(morgan('dev')) // logger
app.use(bodyParser.json())
app.use(cookieParser())
app.set('json spaces', 2)

// session
app.use(session({
  secret: 'sooo secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

// development only
if (app.get('env') === 'development') {
  app.use(errorhandler())
}

// set routes
require('./routes')(app, config)

// start server
http.createServer(app).listen(app.get('port'), app.get('ip'), function () {
  console.log('✔ Express server listening at http://%s:%d ', app.get('ip'), app.get('port'))
  console.log('-'.repeat(80))
})

module.exports = app
