const SzIPCalculator = require('./lib/IPCalculator')
const SzIFaceConfig = require('./lib/IFaceConfigurator')
const SzIPRouter = require('./lib/IPRouter')

let options = {
  getIpData: false,
  sudo: false,
  args: [],
  exclude: []
}
// SzIPCalculator.getIpData('0.0.0.0/0', (err, res) => {
//   if (err) return console.log(err)
//   return console.log(res)
// })
// let optionsRoutes = {
//   sudo: false,
//   getIpData: false
// }
// SzIPRouter.getRoutes(optionsRoutes, (err, routes) => {
//   if (err) return console.log(err)
//   return console.log(routes)
// })
// SzIPRouter.getDefaultGateway((err, gateway) => {
//   if (err) return console.log(err)
//   return console.log("Default gateway is "+gateway+".")
// })
let optionsAddInterface = {
  sudo: true,
  getIpData: false,
  args: []
}
// SzIFaceConfig.addAddress('192.168.25.1', "255.255.255.0", "eno1", optionsAddInterface, (err, res) => {
//   if (err) return console.log(err)
//   return console.log(res)
// })
setTimeout(() => {
  SzIFaceConfig.delAddress('192.168.25.1', "255.255.255.0", "eno1", optionsAddInterface, (err, res) => {
    if (err) return console.log(err)
    return console.log(res)
  })
}, 5000)