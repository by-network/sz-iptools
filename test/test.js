// IPCalculator

const SzIpCalculator = require('../').IPCalculator
const SzConnTester = require('../').ConnTester
const SzIFaceConfig = require('../').IFaceConfigurator
const SzIPRouter = require('../').IPRouter

const assert = require('assert')
const expect = require('chai').expect

describe('ConnTester', function () {
  // www.google.com.br 443
  describe('#test - www.google.com.br:443', function () {
    it('Should return true to callback if www.google.com.br is listening on port 443.', function (done) {
      SzConnTester.test('www.google.com.br', 443, 1500, (err, res) => {
        if (err) console.error(err)
        if (res) {
          assert.equal(res, true)
          return done()
        }
      })
    })
  })
  // www.google.com.br 444
  describe('#test - www.google.com.br:444', function () {
    it('Should return false to callback if www.google.com.br is NOT listening on port 444.', function (done) {
      SzConnTester.test('www.google.com.br', 444, 1500, (err, res) => {
        if (err) console.error(err)
        if (!res) {
          assert.equal(res, false)
          return done()
        }
      })
    })
  })
})
describe('IPCalculator', function () {
  // 192.168.1.1
  describe('#isIPv4 - 192.168.1.1', function () {
    it('Should pass true to callback if 192.168.1.1 is a valid IP address.', function () {
      SzIpCalculator.isIPv4('192.168.1.1', (err, res) => {
        if (err) return console.error(err)
        if (!res) return console.log('192.168.1.1 NÃO é um endereço IPv4')
        assert.equal(res, true)
      })
    })
  })
  // 192.168.1.1/24
  describe('#isIPv4 - 192.168.1.1/24', function () {
    it('Should pass true to callback if 192.168.1.1/24 is a valid IP address.', function () {
      SzIpCalculator.isIPv4('192.168.1.1/24', (err, res) => {
        if (err) return console.error(err)
        if (!res) return console.log('192.168.1.1/24 NÃO é um endereço IPv4')
        assert.equal(res, true)
      })
    })
  })
  // 192.168.1.1/255.255.255.0
  describe('#isIPv4 - 192.168.1.1/255.255.255.0', function () {
    it('Should pass true to callback if 192.168.1.1/255.255.255.0 is a valid IP address.', function () {
      SzIpCalculator.isIPv4('192.168.1.1/255.255.255.0', (err, res) => {
        if (err) return console.error(err)
        if (!res) return console.log('192.168.1.1/255.255.255.0 NÃO é um endereço IPv4')
        return assert.equal(res, true)
      })
    })
  })
  // 192.168.1.1
  describe('#getIpData - 192.168.1.1', function () {
    it('Should have contain decimal and private info of 192.168.1.1.', function () {
      SzIpCalculator.getIpData('192.168.1.1', (err, res) => {
        if (err) return console.error(err)
        assert.equal(res.address.decimal, 3232235777)
        assert.equal(res.info.private, true)
      })
    })
  })
  // 192.168.1.1
  describe('#getIpData - 127.0.0.1', function () {
    it('Should have contain decimal and reserved info of 127.0.0.1.', function () {
      SzIpCalculator.getIpData('127.0.0.1', (err, res) => {
        if (err) return console.error(err)
        assert.equal(res.address.decimal, 2130706433)
        assert.equal(res.info.reserved, true)
      })
    })
  })
  // 192.168.1.1/19
  describe('#getIpData - 192.168.1.1/19', function () {
    it('Should have contain data of 192.168.1.1/19 network and IP address.', function () {
      SzIpCalculator.getIpData('192.168.1.1/19', (err, res) => {
        if (err) return console.error(err)
        assert.equal(res.info.haveNetmask, true)
        assert.equal(res.network.address, '192.168.0.0')
        assert.equal(res.network.broadcast, '192.168.31.255')
        assert.equal(res.network.hostsNumber, 8189)
        assert.equal(res.lower.string, '192.168.0.1')
        assert.equal(res.higher.string, '192.168.31.254')
      })
    })
  })
  // 192.168.1.1/19
  describe('#getIpData - 192.168.1.1/255.255.224.0', function () {
    it('Should have contain data of 192.168.1.1/255.255.224.0 network and IP address.', function () {
      SzIpCalculator.getIpData('192.168.1.1/255.255.224.0', (err, res) => {
        if (err) return console.error(err)
        assert.equal(res.info.haveNetmask, true)
        assert.equal(res.network.address, '192.168.0.0')
        assert.equal(res.network.broadcast, '192.168.31.255')
        assert.equal(res.network.hostsNumber, 8189)
        assert.equal(res.lower.string, '192.168.0.1')
        assert.equal(res.higher.string, '192.168.31.254')
      })
    })
  })
  // 192.168.1.1 and 192.168.1.50
  describe('#onSameNetwork - 192.168.1.1 and 192.168.1.50 mask 255.255.255.0', function () {
    it('Should pass true to callback if 192.168.1.1 and 192.168.1.50 are in same network.', function () {
      SzIpCalculator.onSameNetwork('192.168.1.1', '192.168.1.50', '255.255.255.0', (err, sameNetwork) => {
        if (err) return console.error(err)
        assert.equal(sameNetwork, true)
      })
    })
  })
  // 192.168.1.1 and 192.168.2.1
  describe('#onSameNetwork - 192.168.1.1 and 192.168.2.1 mask 255.255.255.0', function () {
    it('Should pass false to callback if 192.168.1.1 and 192.168.2.1 are NOT in same network.', function () {
      SzIpCalculator.onSameNetwork('192.168.1.1', '192.168.2.1', '255.255.255.0', (err, sameNetwork) => {
        if (err) return console.error(err)
        assert.equal(sameNetwork, false)
      })
    })
  })
  // 255.255.254.0 -> 23
  describe('#convertNetmaskToCidr - 255.255.254.0', function () {
    it('Should pass number 23 to callback after convert 255.255.254.0 to CIDR prefix.', function () {
      SzIpCalculator.convertNetmaskToCidr('255.255.254.0', (err, cidr) => {
        if (err) return console.error(err)
        assert.equal(cidr, 23)
      })
    })
  })
  // 23 -> 255.255.254.0
  describe('#convertCidrToNetmask - 23', function () {
    it('Should pass 255.255.254.0 to callback after convert 23 to netmask string.', function () {
      SzIpCalculator.convertCidrToNetmask('23', (err, netmask) => {
        if (err) return console.error(err)
        assert.equal(netmask, "255.255.254.0")
      })
    })
  })
})
describe('IFaceConfigurator', function () {
  // all
  describe('#getInterfaces - all', function () {
    it('Should return object with all network interfaces to callback.', function (done) {
      let options = {
        getIpData: false,
        sudo: false,
        args: [],
        exclude: []
      }
      SzIFaceConfig.getInterfaces('all', options, (err, res) => {
        if (err) console.error(err)
        if (res) {
          expect(res).to.be.a('array')
          expect(res).to.have.length.above(0)
          expect(res[0]).to.have.property('name')
          expect(res[0]).to.have.property('type')
          return done()
        }
      })
    })
  })
  // Without options
  describe('#getInterfaces - all without options', function () {
    it('Should return object with all network interfaces to callback.', function (done) {
      SzIFaceConfig.getInterfaces('all', (err, res) => {
        if (err) console.error(err)
        if (res) {
          expect(res).to.be.a('array')
          expect(res).to.have.length.above(0)
          expect(res[0]).to.have.property('name')
          expect(res[0]).to.have.property('type')
          return done()
        }
      })
    })
  })
  // Just callback
  describe('#getInterfaces - all just callback', function () {
    it('Should return object with all network interfaces to callback.', function (done) {
      SzIFaceConfig.getInterfaces((err, res) => {
        if (err) console.error(err)
        if (res) {
          expect(res).to.be.a('array')
          expect(res).to.have.length.above(0)
          expect(res[0]).to.have.property('name')
          expect(res[0]).to.have.property('type')
          return done()
        }
      })
    })
  })
  // getAddresses
  describe('#getAddresses - first interface founded', function () {
    it('Should return object with all IPv4 addresses for the first interfaces to callback.', function (done) {
      SzIFaceConfig.getInterfaces("all", {sudo: true}, (err, ifaces) => {
        if (err) console.error(err)
        SzIFaceConfig.getAddresses(ifaces[0].name, {}, (err, addresses) => {
          if (err) console.error(err)
          if (addresses) {
            expect(addresses).to.be.a('array')
            expect(addresses).to.have.length.above(0)
            expect(addresses[0]).to.be.a('string')
            return done()
          }
        })
      })
    })
  })
  // addAddress
  describe('#addAddress - 192.168.88.1/24 to first interface founded and not loopback', function () {
    it('Should add 192.168.88.1/24 to the first interface founded (not loopback).', function (done) {
      SzIFaceConfig.getInterfaces({type: "ether"}, {sudo: true}, (err, ifaces) => {
        if (err) console.error(err)
        SzIFaceConfig.addAddress("192.168.88.1", "255.255.255.0", ifaces[0].name, {sudo: true}, (err, addresses) => {
          if (err) console.error(err)
          if (addresses) {
            expect(addresses).to.be.a('array')
            expect(addresses).to.have.length.above(0)
            expect(addresses).to.contain.members(["192.168.88.1/24"])
            return done()
          }
        })
      })
    })
  })
  describe('#delAddress - 192.168.88.1/24 to first interface founded and not loopback', function () {
    it('Should add and after remove 192.168.88.1/24 to the first interface founded (not loopback).', function (done) {
      SzIFaceConfig.getInterfaces({type: "ether"}, {sudo: true}, (err, ifaces) => {
        if (err) console.error(err)
        SzIFaceConfig.addAddress("192.168.88.1", "255.255.255.0", ifaces[0].name, {sudo: true}, (err, addresses) => {
          if (err) console.error(err)
          SzIFaceConfig.delAddress("192.168.88.1", "255.255.255.0", ifaces[0].name, {sudo: true}, (err, addresses) => {
            if (err) console.error(err)
            if (addresses) {
              expect(addresses).to.be.a('array')
              expect(addresses).to.have.length.above(0)
              expect(addresses).to.not.contain.members(["192.168.88.1/24"])
              return done()
            }
          })
        })
      })
    })
  })
})
describe('IPRouter', function () {
  // getDefaultGateway
  describe('#getDefaultGateway', function () {
    it('Should return default gateway as string.', function (done) {
      SzIPRouter.getDefaultGateway((err, res) => {
        if (err) console.error(err)
        expect(isNaN(res[0])).to.be.equal(false)
        expect(res.indexOf('.')).to.be.greaterThan(-1)
        done()
      })
    })
  })
  // getIpForward
  describe('#getIpForward', function () {
    it('Should return true or false whether IPv4 forwarding is enabled or not.', () => {
      SzIPRouter.getIpForward((err, res) => {
        if (err) console.error(err)
        expect(res).to.be('boolean')
      })
    })
  })
  // setItForward
  describe('#setIpForward - true', function () {
    it('Should return true whether IPv4 forwarding is enabled after command.', () => {
      SzIPRouter.setIpForward(true, (err, res) => {
        if (err) console.error(err)
        assert.equal(res, true)
      })
    })
  })
})