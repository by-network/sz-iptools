const SzIPCalculator = require('./lib/IPCalculator')
const SzIFaceConfig = require('./lib/IFaceConfigurator')
const SzIPRouter = require('./lib/IPRouter')

// let options = {
//   getIpData: false,
//   sudo: false,
//   args: [],
//   exclude: []
// }
// SzIFaceConfig.getInterfaces((err, interfaces) => {
//   if (err) return console.log(err)
//   return console.log(interfaces)
// })
// SzIPCalculator.getIpData('0.0.0.0/0', (err, res) => {
//   if (err) return console.log(err)
//   return console.log(res)
// })
// SzIFaceConfig.getAddresses('eno1', (err, addresses) => {
//   if (err) return console.log(err)
//   return console.log(addresses)
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
// let optionsAddInterface = {
//   sudo: true,
//   getIpData: false,
//   args: []
// }
// let optionsRoutes = {
//   table: 'main', // specify table used
//   getIpData: false, // gets data for all addresses - see IPCalculator.getIpData()
//   sudo: true, // executes command with sudo
//   args: [] // extra arguments to ip route commands - be careful
// }
// SzIPRouter.getIpForward((err, res) => {
//   if (err) return console.error(err)
//   return console.log(res)
// })
// SzIPRouter.setIpForward(true, (err, res) => {
//   if (err) return console.error(err)
//   return console.log(res)
// })
// SzIFaceConfig.getDnsServers((err, servers) => {
//   if (err) return console.log(err)
//   return console.log(servers) //must log array with IP of DNS servers
// })
// SzIFaceConfig.getDhclientProcs((err, procs) => {
//   if (err) return console.error(err)
//   return console.log(procs)
// })
let options = {
  sudo: true
}
// Tip: "all" kills dhclient for all interfaces.
SzIFaceConfig.killDhclientProcs('all', options, (err, procs) => {
  if (err) return console.log(err)
  return console.log(procs) //must log array with dhclient processes. Empty array if OK.
})