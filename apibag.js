#!/usr/bin/env node
'use strict'

// packages
const ora = require('ora')
const spinner = ora({ spinner: 'hearts', color: 'red' })
const vorpal = require('vorpal')()
const request = require('request-promise')
const prettyjson = require('prettyjson')
const chalk = require('chalk')

// http request time out in milliseconds
const TIMEOUT = 1000 * 20

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

  // keep only data, they have =
  const hasEqual = (text) => text.indexOf('=') !== -1
  const onlyData = payload.filter(hasEqual)

  // make an object out of data
  return onlyData.reduce((final, current) => {
    const propertyName = current.split('=')[0]
    final[propertyName] = current.split('=')[1]
      .replace(/^\'/g, '') // eslint-disable-line
      .replace(/\'$/g, '') // eslint-disable-line
    return final
  }, {})
}

// input headername:someValue output { headername: 'someValue'}
const headerDecorator = (header) => {
  if (!Array.isArray(header)) {
    return
  }

  // keep only headers, they have :
  const hasColon = (text) => text.indexOf(':') !== -1
  const onlyHeaders = header.filter(hasColon)

  if (onlyHeaders.length < 1) {
    return
  }
  // make an object out of headers
  return onlyHeaders.reduce((final, current) => {
    const propertyName = current.split(':')[0]
    final[propertyName] = current.split(':')[1]
      .replace(/^\'/g, '') // eslint-disable-line
      .replace(/\'$/g, '') // eslint-disable-line
    return final
  }, {})
}

// add http if no protocol found in url
// credits: http://bit.ly/2nPIEr4
const addHttp = (url) => {
  if (!/^(?:f|ht)tps?:\/\//.test(url)) {
    url = 'http://' + url
  }
  return url
}

// vorpal commands
vorpal
  .history('apibag')
  .command('get <uri> [headers...]', 'sends a get request')
  .action(function (args, callback) {
    spinner.start()
    // console.log(args)
    const options = {
      method: 'GET',
      uri: addHttp(args.uri),
      resolveWithFullResponse: true,
      simple: false,
      timeout: TIMEOUT,
      headers: headerDecorator(args.headers)
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
      uri: addHttp(args.uri),
      body: payloadDecorator(args.data),
      json: true,
      resolveWithFullResponse: true,
      simple: false,
      timeout: TIMEOUT,
      headers: headerDecorator(args.data)
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
