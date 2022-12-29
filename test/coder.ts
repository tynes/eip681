import { encode, decode, EIP681Params } from '../src'
import { BigNumber } from '@ethersproject/bignumber'
import assert from 'assert'

describe('decode', () => {
  it('erc20 transfer', () => {
    const uri = 'ethereum:0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7/transfer?address=0x8e23ee67d1332ad560396262c48ffbb01f93d052&uint256=1'
    const decoded = decode(uri)

    assert.deepEqual(decoded.pay, false)
    assert.deepEqual(decoded.chainId, null)
    assert.deepEqual(decoded.gasLimit, null)
    assert.deepEqual(decoded.gasPrice, null)

    // generated with cast
    const calldata = '0xa9059cbb0000000000000000000000008e23ee67d1332ad560396262c48ffbb01f93d0520000000000000000000000000000000000000000000000000000000000000001'
    assert.deepEqual(decoded.calldata, calldata)

    assert.deepEqual(decoded.target, '0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7')
    assert.deepEqual(decoded.function, 'transfer(address,uint256)')
  })

  it('includes builtin methods', () => {
    const uri = 'ethereum:0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7/transfer?address=0x8e23ee67d1332ad560396262c48ffbb01f93d052&uint256=1&gasPrice=10&gasLimit=100&value=32'
    const decoded = decode(uri)

    assert.deepEqual(decoded.gasPrice.toNumber(), 10)
    assert.deepEqual(decoded.gasLimit.toNumber(), 100)
    assert.deepEqual(decoded.value.toNumber(), 32)
  })

  it('works with a chainid', () => {
    const uri = 'ethereum:0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7@10/transfer?address=0x8e23ee67d1332ad560396262c48ffbb01f93d052&uint256=1'
    const decoded = decode(uri)

    assert.deepEqual(decoded.chainId.toNumber(), 10)
  })

  it('works with -pay', () => {
    const uri = 'ethereum:pay-0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7/transfer?address=0x8e23ee67d1332ad560396262c48ffbb01f93d052&uint256=1'
    const decoded = decode(uri)

    assert.deepEqual(decoded.pay, true)
  })
})

describe('encode', () => {
  it('erc20 transfer', () => {
    const params: Partial<EIP681Params> = {
      arguments: [
        { type: 'address', value: '0x8e23ee67d1332ad560396262c48ffbb01f93d052' },
        { type: 'uint256', value: '1' },
      ],
      target: '0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7',
      function: 'transfer(address,uint256)',
    }

    const encoded = encode(params)
    const uri = 'ethereum:0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7/transfer?address=0x8e23ee67d1332ad560396262c48ffbb01f93d052&uint256=1'
    assert.deepEqual(encoded, uri)
  })

  it('includes builtin methods', () => {
    const params: Partial<EIP681Params> = {
      arguments: [
        { type: 'address', value: '0x8e23ee67d1332ad560396262c48ffbb01f93d052' },
        { type: 'uint256', value: '1' },
      ],
      target: '0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7',
      function: 'transfer(address,uint256)',
      gasPrice: BigNumber.from(10),
      gasLimit: BigNumber.from(100),
      value: BigNumber.from(32)
    }

    const uri = 'ethereum:0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7/transfer?address=0x8e23ee67d1332ad560396262c48ffbb01f93d052&uint256=1&gasPrice=10&gasLimit=100&value=32'
    const encoded = encode(params)

    assert.deepEqual(encoded, uri)
  })

  it('works with a chainid', () => {
    const params: Partial<EIP681Params> = {
      arguments: [
        { type: 'address', value: '0x8e23ee67d1332ad560396262c48ffbb01f93d052' },
        { type: 'uint256', value: '1' },
      ],
      target: '0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7',
      function: 'transfer(address,uint256)',
      chainId: BigNumber.from(10)
    }

    const uri = 'ethereum:0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7@10/transfer?address=0x8e23ee67d1332ad560396262c48ffbb01f93d052&uint256=1'
    const encoded = encode(params)
    assert.deepEqual(encoded, uri)
  })

  it('works with -pay', () => {
    const params: Partial<EIP681Params> = {
      arguments: [
        { type: 'address', value: '0x8e23ee67d1332ad560396262c48ffbb01f93d052' },
        { type: 'uint256', value: '1' },
      ],
      target: '0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7',
      function: 'transfer(address,uint256)',
      pay: true
    }

    const uri = 'ethereum:pay-0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7/transfer?address=0x8e23ee67d1332ad560396262c48ffbb01f93d052&uint256=1'
    const encoded = encode(params)
    assert.deepEqual(encoded, uri)
  })
})
