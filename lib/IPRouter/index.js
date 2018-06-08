const fs = require('fs')
const exec = require('child_process').exec
const SzIPCalculator = require('../IPCalculator')

module.exports = {
  getRoutes: getRoutes,
  getDefaultGateway: getDefaultGateway,
  getIpForward: getIpForward,
  addTable: addTable,
  getTables: getTables,
  setIpForward: setIpForward
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
  if (!options) options = {}
  if (!options.args) options.args = []
  if (options && options.table) options.args.splice(0, 0, 'table ' + options.table)
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
 * @description Gets the default gateway from main table as string
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

/**
 * @name getIpForward
 * @description Determines whether IPv4 forwarding is enabled
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor (callback)
 */
function getIpForward (callback) {
  exec('which sysctl', (err, stdout, stderr) => {
    if (err) {
      fs.access('/proc/sys/net/ipv4/ip_forward', fs.constants.R_OK, (err) => {
        if (err) return callback(new Error('Unable to access /proc/sys/net/ipv4/ip_forward file.'), null)
        fs.readFile('/proc/sys/net/ipv4/ip_forward', {encoding: 'utf8'}, (err, data) => {
          if (err) return callback(err, null)
          if (data.trim() === '1') return callback(null, true)
          return callback(null, false)
        })
      })
    } else {
      if (stdout && stdout.length > 0) {
        exec(stdout.trim() + ' net.ipv4.ip_forward', (err, stdout, stderr) => {
          if (err) return callback(err, null)
          if (stdout.trim().substr(-1, 1) === '1') return callback(null, true)
          return callback(null, false)
        })
      }
    }
  })
}

/**
 * @name setIpForward
 * @description Enables or disables IPv4 forwarding
 * @param {boolean} enable Indicates whether routing should be enabled or disabled
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor (boolean, callback)
 */
function setIpForward (enable, callback) {
  if (typeof enable !== 'boolean') return new TypeError('First argument of setIpForward must to be a boolean value.', null)
  exec('which sysctl', (err, stdout, stderr) => {
    if (err) return callback(new Error('Error trying to execute sysctl. Command not found.'), null)
    // Checks if file is readable and writable
    fs.access('/etc/sysctl.conf', fs.constants.W_OK | fs.constants.W_OK, (err) => {
      if (err) {
        if (err.code === 'EACCES') return callback(new Error('Unable to access file /etc/sysctl.conf. Permission denied.'))
        return callback(err, null)
      }
      // Gets contents of file and separates lines into an array
      fs.readFile('/etc/sysctl.conf', {encoding: 'utf8'}, (err, data) => {
        if (err) return callback(err, null)
        data = data.split('\n')
        // Removes lines with ip_forward configuration
        for (let i = data.length - 1; i >= 0; i--) {
          if (data[i].length > 0 && data[i].trim().substr(0, 19) === 'net.ipv4.ip_forward') {
            data.splice(i, 1)
          }
        }
        // Adds new configuration to aray
        if (enable) data.push('net.ipv4.ip_forward = 1')
        if (!enable) data.push('net.ipv4.ip_forward = 0')
        data = data.join('\n')
        // Writes to the file
        fs.writeFile('/etc/sysctl.conf', data, {encoding: 'utf8'}, (err) => {
          if (err) return callback(err)
          exec('sysctl -p /etc/sysctl.conf', (err, stdout, stderr) => {
            if (err) return callback(err)
            getIpForward((err, status) => {
              if (err) return callback(err)
              return callback(null, status)
            })
          })
        })
      })
    })
  })
}

// TABLES

/**
 * @name getTables
 * @description Gets all route tables on iproute2/rt_tables file.
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor (callback)
 */
function getTables (callback) {
  fs.access('/etc/iproute2/rt_tables', fs.constants.R_OK, (err) => {
    if (err) return callback(new Error('Unable to access /etc/iproute2/rt_tables file.'), null)
    fs.readFile('/etc/iproute2/rt_tables', {encoding: 'utf8'}, (err, data) => {
      if (err) return callback(err, null)
      parseTablesFromCmd(data, (err, tables) => {
        if (err) return callback(err, null)
        return callback(null, tables)
      })
    })
  })
}

/**
 * @name addTable
 * @description Add a table specification to iproute2/rt_tables file.
 * @param {Number} id Number that identifies tables in iproute2/rt_tables file
 * @param {String} name Table's name
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor ([id ,] name, callback)
 */
function addTable (id, name, callback) {
  if (!callback && typeof name === 'function') {
    callback = name
    name = id
    id = null
  }
  if (id !== null && typeof id !== 'undefined' && isNaN(id)) {
    return callback(new TypeError('The ID must to be a valid integer number between 1 and 252. It can be ommited for auto generate.'))
  }
  if (typeof id === 'string' && !isNaN(id)) id = parseInt(id)
  if (id < 0 || id > 252) return callback(new Error('The ID must to be a valid integer number between 1 and 252. It can be ommited for auto generate.'))
  if (!name || !name.length) return callback(new Error('The name for new table must to be a valid string.'))
  getTables((err, tables) => {
    if (err) return callback(err, null)
    // Gets next valid ID and, if it was informed, verifies if it's valid.
    let nextValidId = 1
    let validId = true
    do {
      validId = true
      for (var i = 0; i < tables.length; i++) {
        if (name === tables[i].name) return callback(new Error('The name specified is already in use for another table.'))
        if (typeof id === 'number' && `${id}` === tables[i].id) return callback(new Error('The ID for the new table is already in use.'))
        if (`${nextValidId}` === tables[i].id) {
          validId = false
          nextValidId++
        }
      }
    } while (!validId)
    fs.access('/etc/iproute2/rt_tables', fs.constants.W_OK, (err) => {
      if (err) return callback(new Error('Access denied to write in iproute2/rt_tables.'))
      fs.appendFile('/etc/iproute2/rt_tables', `${(typeof id === 'number') ? id : nextValidId}\t${name}\n`, {encoding: 'utf8'}, (err) => {
        if (err) return callback(err)
        getTables((err, tables) => {
          if (err) return callback(err)
          return callback(null, tables)
        })
      })
    })
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
    if (parsedRoute.destination === 'default') {
      parsedRoute.destination = '0.0.0.0/0'
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
      if (parsedRoute.destination.length > 0) {
        routes.push(parsedRoute)
      }
    }
  }
  return callback(null, routes)
}

function parseTablesFromCmd (string, callback) {
  let tables = []
  let lines = string.trim().split('\n')
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim()[0] === '#') {
      lines.splice(i, 1)
    }
  }
  for (let k in lines) {
    let words = lines[k].trim().split(/\s+/)
    let obj = {
      id: words[0].trim(),
      name: words[1].trim(),
      systemTable: false
    }
    if (['0', '253', '254', '255', 0, 253, 254, 255].indexOf(obj.id) > -1) obj.systemTable = true
    tables.push(obj)
  }
  return callback(null, tables)
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
