// IPCalculator

const SzIpCalculator = require('../index.js').IPCalculator
const assert = require('assert')
const expect = require('expect.js')

describe('IPCalculator', function () {
  // 192.168.1.1
  describe('#isIPv4 - 192.168.1.1', function () {
    it('Should pass true to callback if 192.168.1.1 is a valid IP address', function () {
      SzIpCalculator.isIPv4('192.168.1.1', (err, res) => {
        if (err) return console.error(err)
        if (!res) return console.log('192.168.1.1 NÃO é um endereço IPv4')
        assert.equal(res, true)
      })
    })
  })
  // 192.168.1.1/24
  describe('#isIPv4 - 192.168.1.1/24', function () {
    it('Should pass true to callback if 192.168.1.1/24 is a valid IP address', function () {
      SzIpCalculator.isIPv4('192.168.1.1/24', (err, res) => {
        if (err) return console.error(err)
        if (!res) return console.log('192.168.1.1/24 NÃO é um endereço IPv4')
        assert.equal(res, true)
      })
    })
  })
  // 192.168.1.1/255.255.255.0
  describe('#isIPv4 - 192.168.1.1/255.255.255.0', function () {
    it('Should pass true to callback if 192.168.1.1/255.255.255.0 is a valid IP address', function () {
      SzIpCalculator.isIPv4('192.168.1.1/255.255.255.0', (err, res) => {
        if (err) return console.error(err)
        if (!res) return console.log('192.168.1.1/255.255.255.0 NÃO é um endereço IPv4')
        return assert.equal(res, true)
      })
    })
  })
  // 192.168.1.1
  describe('#getIpData - 192.168.1.1', function () {
    it('Should have contain decimal and private info of 192.168.1.1', function () {
      SzIpCalculator.getIpData('192.168.1.1', (err, res) => {
        if (err) return console.error(err)
        assert.equal(res.address.decimal, 3232235777)
        assert.equal(res.info.private, true)
      })
    })
  })
  // 192.168.1.1
  describe('#getIpData - 127.0.0.1', function () {
    it('Should have contain decimal and reserved info of 127.0.0.1', function () {
      SzIpCalculator.getIpData('127.0.0.1', (err, res) => {
        if (err) return console.error(err)
        assert.equal(res.address.decimal, 2130706433)
        assert.equal(res.info.reserved, true)
      })
    })
  })
  // 192.168.1.1/19
  describe('#getIpData - 192.168.1.1/19', function () {
    it('Should have contain data of 192.168.1.1/19 network and IP address', function () {
      SzIpCalculator.getIpData('192.168.1.1/19', (err, res) => {
        if (err) return console.error(err)
        assert.equal(res.info.haveNetmask, true)
        assert.equal(res.network.address, "192.168.0.0")
        assert.equal(res.network.broadcast, "192.168.31.255")
        assert.equal(res.network.hostsNumber, 8189)
        assert.equal(res.lower.string, "192.168.0.1")
        assert.equal(res.higher.string, "192.168.31.254")
      })
    })
  })
  // 192.168.1.1/19
  describe('#getIpData - 192.168.1.1/255.255.224.0', function () {
    it('Should have contain data of 192.168.1.1/255.255.224.0 network and IP address', function () {
      SzIpCalculator.getIpData('192.168.1.1/255.255.224.0', (err, res) => {
        if (err) return console.error(err)
        assert.equal(res.info.haveNetmask, true)
        assert.equal(res.network.address, "192.168.0.0")
        assert.equal(res.network.broadcast, "192.168.31.255")
        assert.equal(res.network.hostsNumber, 8189)
        assert.equal(res.lower.string, "192.168.0.1")
        assert.equal(res.higher.string, "192.168.31.254")
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
})
