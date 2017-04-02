#!/usr/bin/env node

const vorpal = require('vorpal')()
const request = require('request-promise')
const prettyjson = require('prettyjson')

// helper functions
const displayResponse = (response) => {
  console.log('HTTP/', response.httpVersion, response.statusCode, response.statusMessage)
  console.log(prettyjson.render(response.headers))
  console.log(response.body)
}

// input name=httpony output { name: 'httpony'}
const payloadDecorator = (payload) => {
  if (!Array.isArray(payload)) {
    return ''
  }
  return payload.reduce((final, current) => {
    const propertyName = current.split('=')[0]
    final[propertyName] = current.split('=')[1].replace(/\\'/g, '')
    return final
  }, {})
}

// vorpal commands
vorpal
  .history('httpony')
  .command('get [uri]', 'sends a get request')
  .action(function (args, callback) {
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
        console.log('errors found: ', error)
        callback()
      })
  })

vorpal
  .command('post <uri> [data...]', 'sends a post request')
  .action(function (args, callback) {
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
        console.log('errors found: ', error)
        callback()
      })
  })

vorpal
  .delimiter('httpony')
  .show()
