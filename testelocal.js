const SzConnTester = require('./lib/ConnTester')

SzConnTester.test('8.8.8.8', 54, 10000, (err, res) => {
  if (err) return console.error(err)
  return console.log(res)
})