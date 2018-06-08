// const SzIPCalculator = require('./lib/IPCalculator')
// const SzIFaceConfig = require('./lib/IFaceConfigurator')
const SzIPRouter = require('./lib/IPRouter')

SzIPRouter.addTable(4, 'gsomenzi2222', (err, data) => {
  if (err) return console.log(err)
  return console.log(data)
})
