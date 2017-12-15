# Sz-IPtools

!!! AT DEVELOPING STAGE !!!

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
 const SzIPCalculator = require('sz-iptools').IPCalculator
 ```

## API

### IPCalculator

#### SzIPCalculator.isIPv4(string, callback)
Evaluate if the string passed is a valid IPv4 address.

*string* (string) IP address to evaluate. Must to be a string, can contain netmask, cidr prefix or not.

*callback* (function) Function executed as callback. Arguments (err, boolean).

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
Gets IPv4 data based on address passed as string. If address contains netmask or cidr prefix, calculates information about network. Otherwise, gets address information.

*string* (string) IP address to evaluate. Must to be a string, can contain netmask, cidr prefix or not.

*callback* (function) Function executed as callback. Arguments (err, object).

```javascript
SzIPCalculator.getIpData('192.168.1.1/255.255.224.0', (err, res) => {
  if (err) return console.error(err)
  return console.log(res)
})

// it returns

{ 
  address: { 
    string: '192.168.1.1',
    decimal: 3232235777,
    binary: '11000000.10101000.00000001.00000001' 
  },
  netmask: { 
    string: '255.255.224.0',
    cidr: 19 
  },
  info: { 
    haveNetmask: true, 
    private: true, 
    reserved: false 
  },
  network: {
    address: '192.168.0.0',
    broadcast: '192.168.31.255',
    hostsNumber: 8189 
  },
  lower: { 
    string: '192.168.0.0',
    binary: '11000000.10101000.00000000.00000000',
    decimal: 3232235520 
  },
  higher: { 
    string: '192.168.31.255',
    binary: '11000000.10101000.00011111.11111111',
    decimal: 3232243711 
  } 
}
```

#### SzIPCalculator.onSameNetwork(ip1, ip2, netmask, callback)
Evaluate if ip1 and ip2 are on the same network, based on netmask.

*ip1* (string) First IP address for evaluation.

*ip2* (string) Second IP address for evaluation.

*netmask* (string) Subnet user for evaluation.

*callback* (function) Function executed as callback. Arguments (err, boolean).

```javascript
SzIPCalculator.onSameNetwork('192.168.1.1', '192.168.2.50', '255.255.255.0', (err, sameNetwork) => {
  if (err) return console.error(err)
  if (!sameNetwork) return console.log('192.168.1.1 and 192.168.2.50 are NOT on the same network.')
  return console.log('192.168.1.1 and 192.168.2.50 are on the same network.')
})
```
