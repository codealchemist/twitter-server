#!/bin/env node

const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const errorhandler = require('errorhandler')
const http = require('http')
const cors = require('cors')
const app = express()
const argv = require('minimist')(process.argv.slice(2))
const fs = require('fs')
const path = require('path')

// print ascii art
var artFile = path.join(__dirname, '/ascii-art.txt')
var art = fs.readFileSync(artFile, 'utf8')
console.info(art)

// read config
var configFile = argv['c'] || argv['config']
var defaultConfigFile = './config'
if (!configFile) {
  configFile = defaultConfigFile
} else {
  if (!configFile.match('.json$')) {
    console.error('- ERROR: Config file must be a JSON file:', configFile)
    configFile = defaultConfigFile
  } else {
    try {
      fs.lstatSync(configFile)
      configFile = process.cwd() + '/' + configFile.replace('.json', '')
    } catch (e) {
      console.error('- ERROR: Unable to read config file:', configFile)
      configFile = defaultConfigFile
    }
  }
}

if (configFile === defaultConfigFile) {
  console.info('- Using default config, MOCKED MODE.')
  console.info('  Will return mocked responses, useful for integration testing.')
  console.info('  You will need to provide a config file to use the Twitter API.')
  console.info('  Copy the default config file and add your credentials there.')
  console.info('  Default config: "src/config.json".')
  console.info()
  console.info('  Using a config file:')
  console.info('  npm start -- --config my-config-file.json')
  console.info()
  console.info('  Or:')
  console.info('  node src/index.js --config my-config-file.json')
  console.info()
}
console.info('- Config file:', configFile)
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
  console.info()
  console.info('✔ Express server listening at http://%s:%d ', app.get('ip'), app.get('port'))
  console.info('-'.repeat(80))
})

module.exports = app
