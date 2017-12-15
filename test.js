const SzIpCalculator = require('./index.js').IPCalculator

console.log('===== ipValidation =====\n')

console.log('=== isIPv4 ===\n')
SzIpCalculator.isIPv4('192.168.1.1', (err, res) => {
  if (err) return console.error(err)
  if (!res) return console.log('192.168.1.1 NÃO é um endereço IPv4')
  return console.log('192.168.1.1 é um endereço IPv4')
})
SzIpCalculator.isIPv4('192.168.1.1/24', (err, res) => {
  if (err) return console.error(err)
  if (!res) return console.log('192.168.1.1/24 NÃO é um endereço IPv4')
  return console.log('192.168.1.1/24 é um endereço IPv4')
})
SzIpCalculator.isIPv4('192.168.1.1/255.255.255.0', (err, res) => {
  if (err) return console.error(err)
  if (!res) return console.log('192.168.1.1/255.255.255.0 NÃO é um endereço IPv4')
  return console.log('192.168.1.1/255.255.255.0 é um endereço IPv4')
})

console.log('\n=== getIpData ===\n')
SzIpCalculator.getIpData('192.168.1.1', (err, res) => {
  console.log('\nDADOS DE 192.168.1.1')
  if (err) return console.error(err)
  return console.log(res)
})
SzIpCalculator.getIpData('127.0.0.1', (err, res) => {
  console.log('\nDADOS DE 127.0.0.1')
  if (err) return console.error(err)
  return console.log(res)
})
SzIpCalculator.getIpData('192.168.1.1/19', (err, res) => {
  console.log('\nDADOS DE 192.168.1.1/19')
  if (err) return console.error(err)
  return console.log(res)
})
SzIpCalculator.getIpData('192.168.1.1/255.255.224.0', (err, res) => {
  console.log('\nDADOS DE 192.168.1.1/255.255.224.0')
  if (err) return console.error(err)
  return console.log(res)
})

console.log('\n=== onSameNetwork ===\n')
SzIpCalculator.onSameNetwork('192.168.1.1', '192.168.1.50', '255.255.255.0', (err, sameNetwork) => {
  if (err) return console.error(err)
  if (!sameNetwork) return console.log('192.168.1.1 and 192.168.1.50 are NOT on the same network.')
  return console.log('192.168.1.1 and 192.168.1.50 are on the same network.')
})
SzIpCalculator.onSameNetwork('192.168.1.1', '192.168.2.50', '255.255.255.0', (err, sameNetwork) => {
  if (err) return console.error(err)
  if (!sameNetwork) return console.log('192.168.1.1 and 192.168.2.50 are NOT on the same network.')
  return console.log('192.168.1.1 and 192.168.2.50 are on the same network.')
})
