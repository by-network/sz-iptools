const SzIPCalculator = require('./lib/IPCalculator')
// const SzIFaceConfig = require('./lib/IFaceConfigurator')
// const SzIpCalculator = require('./lib/IPRouter')

SzIPCalculator.getNextIp('192.168.2.1/16', (err, nextIp) => {
  if (err) console.error(err)
  console.log(nextIp)
})

SzIPCalculator.getPreviousIp('192.168.2.0/16', (err, previousIp) => {
  if (err) console.error(err)
  console.log(previousIp)
})
