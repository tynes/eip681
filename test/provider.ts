import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { EIP681Provider } from '../src'
import assert from 'assert'

// TODO
// MultiEIP681Provider

const zero = '0x0000000000000000000000000000000000000000000000000000000000000000'

describe.skip('call', () => {
  const url = process.env.RPC_URL || 'http://127.0.0.1:8545'

  let provider: EIP681Provider

  before(() => {
    const rpc = new StaticJsonRpcProvider(url)
    provider = new EIP681Provider(rpc)
  })

  // There is no concept of abi decoding. Not ideal.
  it('should call', async () => {
    const uri = 'ethereum:0x4200000000000000000000000000000000000042/balanceOf?address=0x2a82ae142b2e62cb7d10b55e323acb1cab663a26'

    const res = await provider.call(uri)
    assert.notDeepEqual(res, zero)
  })
})
