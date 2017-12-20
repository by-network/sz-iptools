const exec = require('child_process').exec
const SzIPCalculator = require('../IPCalculator')

module.exports = {
  getRoutes: (options, callback) => {
    return getRoutes(options, callback)
  },
  getDefaultGateway: (callback) => {
    return getDefaultGateway(callback)
  }
}

// ===== PUBLIC METHODS =====

/**
 * @name getRoutes
 * @description Get network routes of linux server.
 * @param {object} options - optional - Object containing options for request
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor (options, callback)
 * @constructor (callback)
 */
function getRoutes (options, callback) {
  if (typeof options === 'function' && !callback) {
    callback = options
    options = {sudo: false}
  }
  mountCmd('ip route list', options, (err, cmd) => {
    if (err) return callback(err, null)
    exec(cmd, (err, stdout, stderr) => {
      if (err && (!stdout && !stderr)) return callback(null, [])
      if (err) return callback(err)
      parseRoutesFromCmd(stdout.trim(), options.getIpData || false, (err, routes) => {
        if (err) return callback(err, null)
        return callback(null, routes)
      })
    })
  })
}

/**
 * @name getDefaultGateway
 * @description Get the default gateway from main table as string
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor (callback)
 */
function getDefaultGateway (callback) {
  getRoutes((err, routes) => {
    if (err) return callback(err, null)
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].defaultGateway) return callback(null, routes[i].via)
    }
    return callback(null, null)
  })
}

// ===== PRIVATE METHODS =====

function parseRoutesFromCmd (string, getIpData, callback) {
  let routes = []
  let lines = string.split('\n')
  for (var i = 0; i < lines.length; i++) {
    lines[i] = lines[i].trim().split(/\s+/)
    let parsedRoute = {}
    // Parses destination and gateway
    parsedRoute.destination = lines[i][0].trim()
    if (parsedRoute.destination === "default") {
      parsedRoute.destination = "0.0.0.0/0"
      parsedRoute.defaultGateway = true
    }
    // Parses via
    if ((lines[i].indexOf('via') > -1)) parsedRoute.via = lines[i][lines[i].indexOf('via') + 1]
    // Parses dev
    if ((lines[i].indexOf('dev') > -1)) parsedRoute.dev = lines[i][lines[i].indexOf('dev') + 1]
    // Parses proto
    if ((lines[i].indexOf('proto') > -1)) parsedRoute.proto = lines[i][lines[i].indexOf('proto') + 1]
    // Parses scope
    if ((lines[i].indexOf('scope') > -1)) parsedRoute.scope = lines[i][lines[i].indexOf('scope') + 1]
    // Parses src
    if ((lines[i].indexOf('src') > -1)) parsedRoute.src = lines[i][lines[i].indexOf('src') + 1]
    // Parses metric
    if ((lines[i].indexOf('metric') > -1)) parsedRoute.metric = parseInt(lines[i][lines[i].indexOf('metric') + 1])
    // Get network data
    if (getIpData) {
      SzIPCalculator.getIpData(parsedRoute.destination, (err, ipData) => {
        if (err) return callback(err)
        parsedRoute.ipData = ipData
        routes.push(parsedRoute)
      })
    } else {
      // Pushes route
      routes.push(parsedRoute)
    }
  }
  return callback(null, routes)
}

function mountCmd (command, options, callback) {
  let finalCmd = command
  // Increment with arguments
  if (options.args && typeof (options.args) === 'object') {
    for (var i = 0; i < options.args.length; i++) {
      finalCmd = finalCmd + ' ' + options.args[i].trim()
    }
  }
  // Increment with sudo if necessary
  if (options.sudo && (options.sudo === 'true' || options.sudo === true)) finalCmd = 'sudo ' + finalCmd
  return callback(null, finalCmd)
}
