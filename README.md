# Sz-IPtools

[![Build Status](https://travis-ci.org/gsomenzi/sz-iptools.svg?branch=master)](https://travis-ci.org/gsomenzi/sz-iptools) 
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![NPM version](https://img.shields.io/npm/v/sz-iptools.svg)](https://www.npmjs.com/package/sz-iptools) 

!!! AT DEVELOPING STAGE !!!

Sz-IPtools is a set of tools to validate, calculate and manage IP address configuration of a Linux server. It is write to use as a Node.js module. The tools are separate by modules, that can be invoked separately. The modules are:

 * <b>IPCalculator</b>: Some methods to help with IP address validation, get address details and calculate with subnet mask.

 * <b>ConnTester</b>: Test TCP connections to remote hosts.

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
 ### Loading ConnTester module
 ```javascript
 const SzConnTester = require('sz-iptools').ConnTester
 ```
 ### Loading IFaceConfigurator module
 ```javascript
 const SzIFaceConfig = require('sz-iptools').IFaceConfigurator
 ```

## API

### IPCalculator

#### SzIPCalculator.isIPv4(string, callback)
Evaluate if the string passed is a valid IPv4 address.

*string* (string) IP address to evaluate. Must to be a string, can contain netmask, cidr prefix or not.

*callback* (function) Function executed as callback. Arguments (err, boolean).

```javascript
// Checks if 192.168.1.1 is a valid IPv4 address.
SzIPCalculator.isIPv4('192.168.1.1', (err, isValidIp) => {
  if (err) return console.error(err)
  if (!isValidIp) return console.log('192.168.1.1 NOT an valid IPv4 address')
  return console.log('192.168.1.1 Valid IPv4 address')
})
// Checks if 192.168.1.1/24 is a valid IPv4 address.
SzIPCalculator.isIPv4('192.168.1.1/24', (err, res) => {
  if (err) return console.error(err)
  if (!isValidIp) return console.log('192.168.1.1/24 NOT an valid IPv4 address')
  return console.log('192.168.1.1/24 Valid IPv4 address')
})
// Checks if 192.168.1.1/255.255.255.0 is a valid IPv4 address.
SzIPCalculator.isIPv4('192.168.1.1/255.255.255.0', (err, res) => {
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
// Gets all possible data for 192.168.1.1 with netmask 255.255.224.0
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
// Checks if 192.168.1.1 and 192.168.2.50 are on the same network if using 255.255.255.0 netmask.
SzIPCalculator.onSameNetwork('192.168.1.1', '192.168.2.50', '255.255.255.0', (err, sameNetwork) => {
  if (err) return console.error(err)
  if (!sameNetwork) return console.log('192.168.1.1 and 192.168.2.50 are NOT on the same network.')
  return console.log('192.168.1.1 and 192.168.2.50 are on the same network.')
})
```

### ConnTester

#### SzConnTester.test(host, port, timeout, callback)
Try to connect to TCP port. Pass true to callback if can connect, otherwise, false is passed.

*host* (string) Host or IP to connect.

*port* (number) TCP port to be tested on host.

*timeout* (number) - optional - Timeout to wait for connection in milliseconds. After that, false is passed to callback. default is 10000.

*callback* (function) Function executed as callback. Arguments (err, boolean).

```javascript
// Test port TCP 443 of www.google.com.br address with timeout 5000 milliseconds.
SzConnTester.test('www.google.com.br', 443, 5000, (err, connStatus) => {
  if (err) return console.error(err)
  if (!connStatus) return console.log('Connection failiure.')
  return console.log('Successful connection.')
})
```

### IFaceConfigurator
IFaceConfigurator module executes commands related to network and network interfaces. In some cases, may to need root or sudo access. Furthermore, almost all commands depends from iproute2.

#### SzIFaceConfig.getInterfaces(filter, options, callback)
Gets server's network interfaces with respective addresses.

*filter* (object|string) - optional - Filter to return just some network interfaces.

*options* (object) - optional - Object to manipulate de search and results from command.

*callback* (function) Function executed as callback. Arguments (err, object).

```javascript
  // Filter example - filter uses "LIKE" and "AND" condition, so the filter above returns just interfaces with eth0 in name, ether in type and mtu 1500
  let filter = {
    name: "eth0",
    type: "ether",
    mtu: 1500
  }
  // Options example
  let options = {
    getIpData: false, // gets data for all addresses
    sudo: false, // executes command with sudo
    args: [], // extra arguments to ip route commands - be careful
    exclude: [] // array of interfaces name to exclude from search
  }
  // Gets all network interfaces - tip: {}, "", "all" or omiting filter returns all interfaces
  SzIFaceConfig.getInterfaces('all', options, (err, interfaces) => {
    if (err) return console.log(err)
    return console.log(JSON.stringify(interfaces))
  })
  // Tip: {name: "eth0"} and "eth0" are the same thing.
  SzIFaceConfig.getInterfaces({name: 'eth0'}, (err, interfaces) => {
    if (err) return console.log(err)
    return console.log(JSON.stringify(interfaces))
  })
  SzIFaceConfig.getInterfaces((err, interfaces) => {
    if (err) return console.log(err)
    return console.log(JSON.stringify(interfaces))
  })
```