#!/usr/bin/env node
'use strict'
const ora = require('ora')
const spinner = ora({ spinner: 'hearts', color: 'red' })
const vorpal = require('vorpal')()
const request = require('request-promise')
const prettyjson = require('prettyjson')
const chalk = require('chalk')

// helper functions
const displayResponse = (response) => {
  spinner.succeed()
  console.log(
    'HTTP/',
    response.httpVersion,
    chalk.blue.bold(response.statusCode),
    response.statusMessage
  )
  console.log(prettyjson.render(response.headers))
  console.log(response.body)
}

// input name=apibag output { name: 'apibag'}
const payloadDecorator = (payload) => {
  if (!Array.isArray(payload)) {
    return
  }
  return payload.reduce((final, current) => {
    const propertyName = current.split('=')[0]
    final[propertyName] = current.split('=')[1]
      .replace(/^\'/g, '') // eslint-disable-line
      .replace(/\'$/g, '') // eslint-disable-line
    return final
  }, {})
}

// vorpal commands
vorpal
  .history('apibag')
  .command('get <uri>', 'sends a get request')
  .action(function (args, callback) {
    spinner.start()
    const options = {
      method: 'GET',
      uri: args.uri,
      resolveWithFullResponse: true
    }
    request(options)
      .then((response) => {
        displayResponse(response)
        callback()
      })
      .catch((error) => {
        spinner.fail()
        if (error.StatusCodeError) {
          console.log('HTTP ', error.StatusCodeError)
        } else {
          console.log('HTTP ', error)
        }
        callback()
      })
  })
//
// ///
// post
// //////
//
vorpal
  .command('post <uri> [data...]', 'sends a post request')
  .action(function (args, callback) {
    spinner.start()
    const options = {
      method: 'POST',
      uri: args.uri,
      body: payloadDecorator(args.data),
      json: true,
      resolveWithFullResponse: true
    }
    request(options)
      .then((response) => {
        displayResponse(response)
        callback()
      })
      .catch((error) => {
        spinner.fail()
        if (error.statusCode) {
          console.log('HTTP ', error.statusCode)
        } else {
          console.log('HTTP ', error)
        }
        callback()
      })
  })
//
// ///
// clear screen
// //////
//
vorpal
  .command('clear', 'clear screen, not the history, just the screen')
  .action(function (args, cb) {
    process.stdout.write('\u001B[2J\u001B[0;0f')
    cb()
  })

vorpal
  .delimiter('apibag')
  .show()
