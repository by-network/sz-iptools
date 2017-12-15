# Sz-IPtools

Sz-IPtools is a set of tools to validate, calculate and manage IP address configuration of a Linux server. It is write to use as a Node.js module. The tools are separate by modules, that can be invoked separately. The modules are:

 * <b>IPCalculator</b>: Some methods to help with IP address validation, get address details and calculate with subnet mask.

 * <b>IFaceConfigurator</b>: (NOT implemented yet)

 * <b>IPRouter</b>: (NOT implemented yet)

## Support

 * Node.js
 
## Installation

```sh
> npm install sz-tools --save
```

## Node.js

 ### Loading IPCalculator module
 ```javascript
 const SzIPCalculator = require('sz-iptools').ipCalculator
 ```

## API

### IPCalculator

#### SzIPCalculator.isIPv4(string, callback)
Evaluate if the string passed is a valid IPv4 address.

 *string* (string) IP address to evaluate. Must to be a string, can contain netmask, cidr prefix or not.
 
 *callback* (function) Function executed as callback. Arguments (err, boolean)

Examples:
```javascript
SzIpValidation.isIPv4('192.168.1.1', (err, isValidIp) => {
  if (err) return console.error(err)
  if (!isValidIp) return console.log('192.168.1.1 NOT an valid IPv4 address')
  return console.log('192.168.1.1 Valid IPv4 address')
})
//or
SzIpValidation.isIPv4('192.168.1.1/24', (err, res) => {
  if (err) return console.error(err)
  if (!isValidIp) return console.log('192.168.1.1/24 NOT an valid IPv4 address')
  return console.log('192.168.1.1/24 Valid IPv4 address')
})
//or
SzIpValidation.isIPv4('192.168.1.1/255.255.255.0', (err, res) => {
  if (err) return console.error(err)
  if (!isValidIp) return console.log('192.168.1.1/255.255.255.0 NOT an valid IPv4 address')
  return console.log('192.168.1.1/255.255.255.0 Valid IPv4 address')
})
```

#### SzIPCalculator.getIpData(string, callback)
