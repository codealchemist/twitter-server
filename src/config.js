'use strict'

const fs = require('fs')
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))

module.exports = (() => {
  const defaultConfigFile = path.join(__dirname, '/config.json')
  let configFile = argv['c'] || argv['config']

  function load () {
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
    let config
    try {
      config = require(configFile)
    } catch (e) {
      // default config fallback, when there's no default config file
      config = {
        'cors': {
          'whitelist': []
        },
        'twitter': {
          'key': null,
          'secret': null
        },
        'tweetsPerRequest': 70,
        'ip': '127.0.0.1',
        'port': '3080',
        'cacheTtl': {
          'users': 15,
          'tweets': 2
        }
      }
    }

    return config
  }

  return {load}
})()
