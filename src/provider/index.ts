/**
 * Optimism Collective
 */

import { EIP681 } from '../coder'

// abstract provider?
// which has the call functionality?

import { Provider } from '@ethersproject/abstract-provider'

// Simple provider using the http request module from ethersjs
// Methods:
// - render: uri that includes ens names to uri with addys
// - call: accepts uri and makes an eth call

export class EIP681Provider {
  provider: Provider

  constructor(provider: Provider) {
    this.provider = provider
  }

  async render(_uri: string): Promise<string> {
    throw new Error('unimplemented')
  }

  async call(uri: string): Promise<string> {
    const decoded = EIP681.decode(uri)

    if (decoded === null) {
      return null
    }

    const result = await this.provider.call({
      to: decoded.target,
      data: decoded.calldata,
      gasLimit: decoded.gasLimit ? decoded.gasLimit : undefined,
      gasPrice: decoded.gasPrice ? decoded.gasPrice : undefined,
      value: decoded.value ? decoded.value : undefined,
    })

    return result
  }
}
