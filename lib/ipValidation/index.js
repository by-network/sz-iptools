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
  let obj = {havemask: true, string: str.split('/')[0], lower: {}, higher: {}}
  let netmask = str.split('/')[1]
  // Get Netmask
  convertCidrToNetmask(netmask, (err, validNetmask) => {
    if (err) return callback(err)
    obj.netmask = validNetmask
    // Get CIDR prefix
    convertNetmaskToCidr(netmask, (err, validCidr) => {
      if (err) return callback(err)
      obj.cidr = validCidr
      // Get decimal value
      convertIpToDecimal(str, (err, ipDecimal) => {
        if (err) return callback(err)
        obj.decimal = ipDecimal
        // Get binary ip
        convertIpToBinary(str, (err, ipBinary) => {
          if (err) return callback(err)
          obj.binary = ipBinary
          // Get lower ip
          getLowerIp(str.split('/')[0], str.split('/')[1], (err, lowerIp) => {
            if (err) return callback(err)
            obj.lower = lowerIp
            // Get higher ip
            getHigherIp(str.split('/')[0], str.split('/')[1], (err, higherIp) => {
              if (err) return callback(err)
              obj.higher = higherIp
              // Get if is private
              isPrivateIp(str, (err, privateAddress) => {
                if (err) return callback(err)
                obj.private = privateAddress
                // Get if is reserved
                isReserverIp(str, (err, reservedAddress) => {
                  if (err) return callback(err)
                  obj.reserved = reservedAddress
                  return callback(null, obj)
                })
              })
            })
          })
        })
      })
    })
  })
}

function getLowerIp (ip, mask, callback) {
  isValidOctetString(ip, (err, isValidIp) => {
    if (err) return callback(err)
    if (!isValidIp) return callback(new TypeError('First argument of getLowerIp must to be a valid IP address.'), null)
    convertNetmaskToCidr(mask, (err, validCidr) => {
      if (err) return callback(err)
      let lowerIp = {
        string: "",
        binary: "",
        decimal: 0
      }
      convertIpToBinary(ip, (err, ipBinary) => {
        if (err) return callback(err)
        let binWithoutDots = ipBinary.split('.').join("")
        for (var i = 0; i < binWithoutDots.length; i ++) {
          if (i < validCidr) {
            lowerIp.binary = lowerIp.binary+binWithoutDots[i]
          } else {
            lowerIp.binary = lowerIp.binary+"0"
          }
        }
        lowerIp.string = parseInt(lowerIp.binary.substr(0, 8), 2)+"."+parseInt(lowerIp.binary.substr(8, 8), 2)+"."+parseInt(lowerIp.binary.substr(16, 8), 2)+"."+parseInt(lowerIp.binary.substr(24, 8), 2)
        lowerIp.binary = lowerIp.binary.substr(0, 8)+"."+lowerIp.binary.substr(8, 8)+"."+lowerIp.binary.substr(16, 8)+"."+lowerIp.binary.substr(24, 8)
        convertIpToDecimal(lowerIp.string, (err, ipDecimal) => {
          if (err) return callback(err)
          lowerIp.decimal = ipDecimal
          return callback(null, lowerIp)
        })
      })
    })
  })
}

function getHigherIp (ip, mask, callback) {
  isValidOctetString(ip, (err, isValidIp) => {
    if (err) return callback(err)
    if (!isValidIp) return callback(new TypeError('First argument of getHigherIp must to be a valid IP address.'), null)
    convertNetmaskToCidr(mask, (err, validCidr) => {
      if (err) return callback(err)
      let higherIp = {
        string: "",
        binary: "",
        decimal: 0
      }
      convertIpToBinary(ip, (err, ipBinary) => {
        if (err) return callback(err)
        let binWithoutDots = ipBinary.split('.').join("")
        for (var i = 0; i < binWithoutDots.length; i ++) {
          if (i < validCidr) {
            higherIp.binary = higherIp.binary+binWithoutDots[i]
          } else {
            higherIp.binary = higherIp.binary+"1"
          }
        }
        higherIp.string = parseInt(higherIp.binary.substr(0, 8), 2)+"."+parseInt(higherIp.binary.substr(8, 8), 2)+"."+parseInt(higherIp.binary.substr(16, 8), 2)+"."+parseInt(higherIp.binary.substr(24, 8), 2)
        higherIp.binary = higherIp.binary.substr(0, 8)+"."+higherIp.binary.substr(8, 8)+"."+higherIp.binary.substr(16, 8)+"."+higherIp.binary.substr(24, 8)
        convertIpToDecimal(higherIp.string, (err, ipDecimal) => {
          if (err) return callback(err)
          higherIp.decimal = ipDecimal
          return callback(null, higherIp)
        })
      })
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
      convertIpToDecimal(str, (err, ipDecimal) => {
        if (err) return callback(err)
        if (ipDecimal > 2130706432 && ipDecimal < 2147483647) return callback(null, true)
        if (ipDecimal > 0 && ipDecimal < 16777215) return callback(null, true)
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
      convertIpToDecimal(str, (err, ipDecimal) => {
        if (err) return callback(err)
        if (ipDecimal > 3232235520 && ipDecimal < 3232301055) return callback(null, true)
        if (ipDecimal > 2886729728 && ipDecimal < 2887778303) return callback(null, true)
        if (ipDecimal > 167772160 && ipDecimal < 184549375) return callback(null, true)
        return callback(null, false)
      })
    })
  })
}

function convertNetmaskToCidr (str, callback) {
  isValidCidr(str, (err, validCidr) => {
    if (err) return callback(err)
    if (validCidr) return callback(null, parseInt(str))
    isValidNetmask(str, (err, validNetmask) => {
      if (err) return callback(err)
      if (!validNetmask) return callback(new TypeError('First argument of convertNetmaskToCidr must to be a valid netmask.'), null)
      let octets = str.split('.')
      for (var i = 0; i < octets.length; i++) {
        octets[i] = parseInt(octets[i]).toString(2)
      }
      return callback(null, (octets.join('').match(/1/g) || []).length)
    })
  })
}

function convertCidrToNetmask (str, callback) {
  isValidNetmask(str, (err, validNetmask) => {
    if (err) return callback(err)
    if (validNetmask) return callback(null, str)
    isValidCidr(str, (err, validCidr) => {
      if (err) return callback(err)
      if (!validCidr) return callback(new TypeError('First argument of convertCidrToNetmask must to be a valid CIDR.'), null)
      let fullOctets = Math.floor(parseInt(str) / 8)
      let modOctet = parseInt(str) % 8
      let convertedNetmask = []
      // Concatenate full octets
      for (fullOctets; fullOctets > 0; fullOctets--) {
        convertedNetmask.push('255')
      }
      // Concatenate mod octet
      if (modOctet > 0) {
        let binary = ''
        for (var i = 0; i < 8; i++) {
          if (i < modOctet) {
            binary = binary + '1'
          } else {
            binary = binary + '0'
          }
        }
        convertedNetmask.push(parseInt(binary, 2))
      }
      // Concatenate zero to compete netmask
      while (convertedNetmask.length < 4) {
        convertedNetmask.push('0')
      }
      return callback(null, convertedNetmask.join('.'))
    })
  })
}

function convertIpToDecimal (str, callback) {
  if (!isNaN(str) && parseInt(str) > 0 && parseInt(str) < 4294967295) return callback(null, parseInt(str))
  haveNetmask(str, (err, ipWithNetmask) => {
    if (err) return callback(err)
    if (ipWithNetmask) str = str.split('/')[0]
    isValidOctetString(str, (err, isValidIp) => {
      if (err) return callback(err)
      if (!isValidIp) return callback(new TypeError('First argument of converIpTodecimal must to be a string.'), null)
      let octets = str.split('.')
      return callback(null, ((((((+octets[0]) * 256) + (+octets[1])) * 256) + (+octets[2])) * 256) + (+octets[3]))
    })
  })
}

function convertIpToBinary (str, callback) {
  haveNetmask(str, (err, ipWithNetmask) => {
    if (err) return callback(err)
    if (ipWithNetmask) str = str.split('/')[0]
    isValidOctetString(str, (err, isValidIp) => {
      if (err) return callback(err)
      if (!isValidIp) return callback(new TypeError('First argument of convertIpToBinary must to be a string.'), null)
      let octets = str.split('.')
      let binaryIp = []
      for (var i = 0; i < octets.length; i++) {
        let binaryString = parseInt(octets[i]).toString(2)
        while (binaryString.length < 8) {
          binaryString = "0"+binaryString
        }
        binaryIp.push(binaryString)
      }
      return callback(null, binaryIp.join('.'))
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
    if (i > 0 && parseInt(octets[i]) > parseInt(octets[i - 1])) return callback(null, false)
    if (isNaN(octets[i])) return callback(null, false)
    if (!isNaN(octets[i]) && (valid.indexOf(parseInt(octets[i])) === -1)) return callback(null, false)
  }
  return callback(null, true)
}
