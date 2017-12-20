const SzIFaceConfig = require('./lib/IFaceConfigurator')

let options = {
  getIpData: false, 
  sudo: false, 
  args: [], 
  exclude: []
}
SzIFaceConfig.getInterfaces('all', options, (err, interfaces) => {
  if (err) return console.log(err)
  return console.log(JSON.stringify(interfaces))
})
SzIFaceConfig.getAddresses('eno1', options, (err, addresses) => {
 if (err) return console.log(err)
 return console.log(addresses)
})
