const SzIpValidation = require('./index.js').ipCalculator

console.log('===== ipValidation =====\n')

console.log('=== isIPv4 ===\n')
SzIpValidation.isIPv4('asdsad', (err, res) => {
  if (err) return console.error(err)
  if (!res) return console.log('asdsad NÃO é um endereço IPv4')
  return console.log('asdsad é um endereço IPv4.')
})
SzIpValidation.isIPv4('192.168.1.1', (err, res) => {
  if (err) return console.error(err)
  if (!res) return console.log('192.168.1.1 NÃO é um endereço IPv4')
  return console.log('192.168.1.1 é um endereço IPv4')
})
SzIpValidation.isIPv4('192.168.1.1/24', (err, res) => {
  if (err) return console.error(err)
  if (!res) return console.log('192.168.1.1/24 NÃO é um endereço IPv4')
  return console.log('192.168.1.1/24 é um endereço IPv4')
})
SzIpValidation.isIPv4('1aaa92.168.1.1/255.255.255.0', (err, res) => {
  if (err) return console.error(err)
  if (!res) return console.log('1aaa92.168.1.1/255.255.255.0 NÃO é um endereço IPv4')
  return console.log('1aaa92.168.1.1/255.255.255.0 é um endereço IPv4')
})
SzIpValidation.isIPv4('192.168.1.1/255.255.255.0', (err, res) => {
  if (err) return console.error(err)
  if (!res) return console.log('192.168.1.1/255.255.255.0 NÃO é um endereço IPv4')
  return console.log('192.168.1.1/255.255.255.0 é um endereço IPv4')
})

console.log('=== getIpData ===\n')
SzIpValidation.getIpData('asdsad', (err, res) => {
  console.log('DADOS DE asdsad')
  if (err) return console.error(err)
  return console.log(res)
})
SzIpValidation.getIpData('192.168.1.1', (err, res) => {
  console.log('\nDADOS DE 192.168.1.1')
  if (err) return console.error(err)
  return console.log(res)
})
SzIpValidation.getIpData('127.0.0.1', (err, res) => {
  console.log('\nDADOS DE 127.0.0.1')
  if (err) return console.error(err)
  return console.log(res)
})
SzIpValidation.getIpData('192.168.1.1/24', (err, res) => {
  console.log('\nDADOS DE 192.168.1.1/24')
  if (err) return console.error(err)
  return console.log(res)
})
SzIpValidation.getIpData('192.168.1.1/19', (err, res) => {
  console.log('\nDADOS DE 192.168.1.1/19')
  if (err) return console.error(err)
  return console.log(res)
})
SzIpValidation.getIpData('192.168.1.1/255.255.255.0', (err, res) => {
  console.log('\nDADOS DE 192.168.1.1/255.255.255.0')
  if (err) return console.error(err)
  return console.log(res)
})
SzIpValidation.getIpData('192.168.1.1/255.255.224.0', (err, res) => {
  console.log('\nDADOS DE 192.168.1.1/255.255.224.0')
  if (err) return console.error(err)
  return console.log(res)
})
