const vorpal = require('vorpal')()
const request = require('request-promise')
const prettyjson = require('prettyjson')

vorpal
  .command('get [uri]', 'sends a get request')
  .action(function (args, callback) {
    const options = {
      method: 'GET',
      uri: args.uri,
      resolveWithFullResponse: true
    }
    request(options)
      .then((response) => {
        console.log(prettyjson.render(response.headers))
        callback()
      })
      .catch((error) => {
        console.log('errors found: ', error)
        callback()
      })
  })

vorpal
  .delimiter('postcat')
  .show()
