const SzIFaceConfig = require('./lib/IFaceConfigurator')

let options = {
  getIpData: false,
  sudo: false,
  args: [],
  exclude: []
}
SzIFaceConfig.getInterfaces({type: 'ether'}, options, (err, interfaces) => {
  if (err) return console.log(err)
  return console.log(JSON.stringify(interfaces))
})
SzIFaceConfig.getAddresses('eth0', options, (err, addresses) => {
  if (err) return console.log(err)
  return console.log(addresses)
})
