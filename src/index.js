'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const errorhandler = require('errorhandler')
const http = require('http')
const cors = require('cors')
const app = express()
const path = require('path')
const fs = require('fs')
const configService = require('./config')

// print ascii art
var artFile = path.join(__dirname, '/ascii-art.txt')
var art = fs.readFileSync(artFile, 'utf8')
console.info(art)

// load config
const config = configService.load()

if (config.cacheTtl) {
  console.info('- Cache TTL (minutes):', config.cacheTtl)
} else {
  console.info('- DEFAULT Cache TTL (minutes):', {users: 15, tweets: 2})
}

// set ip and port
var port = process.env.PORT || config.port || process.env.port || 3080

// set port
app.set('port', port)

// set cors options
var corsOptions = null
if (config.cors && config.cors.whitelist && config.cors.whitelist.length) {
  corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback('Origin Not Allowed', false)

      var isAllowed = config.cors.whitelist.some((allowedDomain) => {
        return origin.match('^' + allowedDomain)
      })

      // allowed domain
      if (isAllowed) return callback(null, true)

      // not allowed domain
      callback('Origin Not Allowed', false)
    }
  }
}

app.use(cors(corsOptions))
app.use(morgan('dev')) // logger
app.use(bodyParser.json())
app.set('json spaces', 2)

// set routes
require('./routes')(app, config)

// start server
http.createServer(app).listen(app.get('port'), function () {
  console.info()
  console.info(`✔ Express server listening at port ${port}`)
  console.info('-'.repeat(80))
})

module.exports = app
