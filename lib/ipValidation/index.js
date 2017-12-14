module.exports = {
  isIPv4: (str, callback) => {
    return isIPv4(str, callback)
  },
  getIpData: (str, callback) => {
    return getIpData(str, callback)
  }
}

// ===== PUBLIC METHODS =====

/**
 * @name isIPv4
 * @description Validate if the string passed at the first argument is a valid IPv4 address.
 * @param {string} str String for test
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 */
function isIPv4 (str, callback) {
  // Validate method requirements
  if (typeof str !== 'string') return callback(new TypeError('First argument of isIPv4 must to be a string.'), null)
  str = str.trim()
  if (callback && typeof callback !== 'function') return callback(new TypeError('Second argument of isIPv4 must to be a function.'), null)
  // Basic validation - if have dots
  if (str.indexOf('.') === -1) return callback(null, false)
  // Separate and validate netmask
  haveNetmask(str, (err, ipAddressWithNetmask) => {
    if (err) return callback(err)
    if (!ipAddressWithNetmask) {
      // if dont have netmask
      isValidOctetString(str, (err, ipAddressValid) => {
        if (err) return callback(err)
        if (!ipAddressValid) return callback(null, false)
        return callback(null, true)
      })
    } else {
      let ipAndMask = str.split('/')
      if (ipAndMask.length > 2) return callback(null, false)
      // Validate ip address
      isValidOctetString(ipAndMask[0], (err, ipAddressValid) => {
        if (err) return callback(err)
        if (!ipAddressValid) return callback(null, false)
        // Validate netmask cidr
        isValidCidr(ipAndMask[1], (err, netmaskValidCidr) => {
          if (err) return callback(err)
          if (netmaskValidCidr) return callback(null, true)
          // Validate netmask octet string
          isValidNetmask(ipAndMask[1], (err, netmaskValidOctetString) => {
            if (err) return callback(err)
            if (netmaskValidOctetString) return callback(null, true)
            return callback(null, false)
          })
        })
      })
    }
  })
}

/**
 * @name isIPv6
 * @description Validate if the string passed at the first argument is a valid IPv6 address.
 * NOT IMPLEMENTED YET
 * @param {string} str String for test
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 */
// function isIPv6 (str, callback) {
//   return callback(null, false)
// }

/**
 * @name getIpData
 * @description Get IP address data having netmask or not.
 * @param {string} str IP address
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 */
function getIpData (str, callback) {
  // Validate IPv4
  isIPv4(str, (err, validIpAddress) => {
    if (err) return callback(err)
    if (!validIpAddress) return callback(null, new TypeError('First argument of getIPData must to be a valid IP address.'))
    // Validate if have netmask
    haveNetmask(str, (err, ipWithNetmask) => {
      if (err) return callback(err)
      if (!ipWithNetmask) {
        getIPDataWithoutNetmask(str, (err, ipData) => {
          if (err) return callback(err)
          return callback(null, ipData)
        })
      } else {
        getIPDataWithNetmask(str, (err, ipData) => {
          if (err) return callback(err)
          return callback(null, ipData)
        })
      }
    })
  })
}

// ===== PRIVATE METHODS =====

function getIPDataWithoutNetmask (str, callback) {
  let obj = {havemask: false, string: str}
  // Get decimal value
  convertIpToDecimal(str, (err, ipDecimal) => {
    if (err) return callback(err)
    obj.decimal = ipDecimal
    // Get if is private
    isPrivateIp(str, (err, privateAddress) => {
      if (err) return callback(err)
      obj.private = privateAddress
      isReserverIp(str, (err, reservedAddress) => {
        if (err) return callback(err)
        obj.reserved = reservedAddress
        return callback(null, obj)
      })
    })
  })
}

function getIPDataWithNetmask (str, callback) {
  let obj = {havemask: true, string: str, lower: {}, higher: {}}
  // Get decimal value
  convertIpToDecimal(str, (err, ipDecimal) => {
    if (err) return callback(err)
    obj.decimal = ipDecimal
    // Get if is private
    isPrivateIp(str, (err, privateAddress) => {
      if (err) return callback(err)
      obj.private = privateAddress
      isReserverIp(str, (err, reservedAddress) => {
        if (err) return callback(err)
        obj.reserved = reservedAddress
        return callback(null, obj)
      })
    })
  })
}

function getLowerIp (ip, mask, callback) {
  isIPv4(ip, (err, validIpAddress) => {
    if (err) return callback(err)
    if (!validIpAddress) return callback(null, new TypeError('First argument of getLowerIp must to be a valid IP address.'))
    haveNetmask(ip, (err, ipWithNetmask) => {
      if (err) return callback(err)
      if (ipWithNetmask) ip = ip.split('/')[0]
      convertNetmaskToCidr(mask, (err, cidr) => {
        return callback(null, {cidr: cidr})
      })
      // ( ipNum & prefixMask ) >>> 0
    })
  })
}

function isReserverIp (str, callback) {
  haveNetmask(str, (err, ipWithNetmask) => {
    if (err) return callback(err)
    if (ipWithNetmask) str = str.split('/')[0]
    isValidOctetString(str, (err, isValidIp) => {
      if (err) return callback(err)
      if (!isValidIp) return callback(new TypeError('First argument of isReserverIp must to be a string.'), null)
      convertIpToDecimal (str, (err, ipDecimal) => {
        if (err) return callback(err)
        if (ipDecimal > 2130706432 && ipDecimal < 2147483647) return callback (null, true)
        if (ipDecimal > 0 && ipDecimal < 16777215) return callback (null, true)
        return callback(null, false)
      })
    })
  })
}

function isPrivateIp (str, callback) {
  haveNetmask(str, (err, ipWithNetmask) => {
    if (err) return callback(err)
    if (ipWithNetmask) str = str.split('/')[0]
    isValidOctetString(str, (err, isValidIp) => {
      if (err) return callback(err)
      if (!isValidIp) return callback(new TypeError('First argument of converIpTodecimal must to be a string.'), null)
      convertIpToDecimal (str, (err, ipDecimal) => {
        if (err) return callback(err)
        if (ipDecimal > 3232235520 && ipDecimal < 3232301055) return callback (null, true)
        if (ipDecimal > 2886729728 && ipDecimal < 2887778303) return callback (null, true)
        if (ipDecimal > 167772160 && ipDecimal < 184549375) return callback (null, true)
        return callback(null, false)
      })
    })
  })
}

function convertNetmaskToCidr (str, callback) {
  isValidNetmask(str, (err, validNetmask) => {
    if (err) return callback(err)
    if (!validNetmask) return callback(new TypeError('First argument of convertNetmaskToCidr must to be a valid netmask.'), null)
    return callback(null, parseInt(str).toString(2))
  })
}

function convertIpToDecimal (str, callback) {
  haveNetmask(str, (err, ipWithNetmask) => {
    if (err) return callback(err)
    if (ipWithNetmask) str = str.split('/')[0]
    isValidOctetString(str, (err, isValidIp) => {
      if (err) return callback(err)
      if (!isValidIp) return callback(new TypeError('First argument of converIpTodecimal must to be a string.'), null)
      let octets = str.split('.')
      return callback(null, ((((((+octets[0])*256)+(+octets[1]))*256)+(+octets[2]))*256)+(+octets[3]))
    })
  })
}

function haveNetmask (str, callback) {
  if (typeof str !== 'string') return callback(new TypeError('First argument of haveNetmask must to be a string.'), null)
  if (str.indexOf('/') === -1) return callback(null, false)
  return callback(null, true)
}

function isValidCidr (cidr, callback) {
  if (isNaN(cidr)) return callback(null, false)
  if (!isNaN(cidr) && (cidr > 32 || cidr < 0)) return callback(null, false)
  return callback(null, true)
}

function isValidOctetString (str, callback) {
  if (str.indexOf('.') < 0) return callback(null, false)
  let octets = str.split('.')
  if (octets.length !== 4) return callback(null, false)
  for (var i = 0; i < octets.length; i++) {
    if (isNaN(octets[i])) return callback(null, false)
    if (!isNaN(octets[i]) && (octets[i] > 255 || octets[i] < 0)) return (null, false)
  }
  return callback(null, true)
}

function isValidNetmask (str, callback) {
  let valid = [0, 128, 192, 224, 240, 248, 252, 254, 255]
  if (str.indexOf('.') < 0) return callback(null, false)
  let octets = str.split('.')
  if (octets.length !== 4) return callback(null, false)
  for (var i = 0; i < octets.length; i++) {
    if (i > 0 && parseInt(octets[i]) > parseInt(octets[i-1])) return callback(null, false)
    if (isNaN(octets[i])) return callback(null, false)
    if (!isNaN(octets[i]) && (valid.indexOf(parseInt(octets[i])) === -1))  return (null, false)
  }
  return callback(null, true)
}
