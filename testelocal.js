// const SzIPCalculator = require('./lib/IPCalculator')
// const SzIFaceConfig = require('./lib/IFaceConfigurator')
const SzIPRouter = require('./lib/IPRouter')

SzIPRouter.getTables((err, data) => {
  if (err) return console.log(err)
  return console.log(data)
})
