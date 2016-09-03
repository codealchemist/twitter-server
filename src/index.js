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
var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.port || 8080
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

// set port and ip
app.set('port', port)
app.set('ip', ip)

app.use(cors())
// app.use(favicon()) // TODO: add favicon
app.use(morgan('dev')) // logger
app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: false }))
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
require('./routes')(app)

// start server
http.createServer(app).listen(app.get('port'), app.get('ip'), function () {
  console.log('✔ Express server listening at http://%s:%d ', app.get('ip'), app.get('port'))
})

module.exports = app
