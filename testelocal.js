const SzIFaceConfigurator = require('./lib/IFaceConfigurator')

SzIFaceConfigurator.getInterfaces({}, (err, interfaces) => {
  if (err) return console.log(err)
  console.log(interfaces)
})
