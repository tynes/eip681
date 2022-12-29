/**
 * Optimism Collective
 */

import { BigNumber } from '@ethersproject/bignumber'
import { defaultAbiCoder } from '@ethersproject/abi'
import { keccak256 } from '@ethersproject/keccak256'
import { hexConcat, hexDataSlice } from '@ethersproject/bytes'
import { toUtf8Bytes } from '@ethersproject/strings'


/* TODO: update for eip1159?
    maxPriorityFeePerGas?: BigNumberish;
    maxFeePerGas?: BigNumberish;
*/

export interface EIP681Params {
  pay: boolean
  target: string
  chainId: BigNumber
  function: string
  value: BigNumber
  gasLimit: BigNumber
  gasPrice: BigNumber
  calldata: string
  arguments: Array<AbiArgument>
}

export interface AbiArgument {
  type: string
  value: string
}

export const encode = (params: Partial<EIP681Params>): string => {
  let res = 'ethereum:'
  if (params.pay) {
    res += 'pay-'
  }
  if (!params.target) {
    return null
  }
  res += params.target

  if (params.chainId) {
    res += '@' + params.chainId.toString()
  }

  if (!params.function) {
    return null
  }

  const func = params.function.split('(')
  res += '/' + func[0]

  if (params.arguments.length > 0) {
    res += '?'
  }

  let args: Array<string> = []
  for (const arg of params.arguments) {
    args.push(arg.type + '=' + arg.value)
  }

  res += args.join('&')

  if (params.gasPrice) {
    res += '&gasPrice=' + params.gasPrice.toString()
  }

  if (params.gasLimit) {
    res += '&gasLimit=' + params.gasLimit.toString()
  }

  if (params.value) {
    res += '&value=' + params.value.toString()
  }

  return res
}

const isBuiltIn = (type: string) => {
  switch (type) {
    case 'value':
    case 'gasPrice':
    case 'gasLimit':
    case 'gas':
      return true
    default:
      return false
  }

}

export const decode = (uri: string): Partial<EIP681Params> => {
  // The URI must begin with `ethereum:`
  if (!uri.startsWith('ethereum:')) {
    return null
  }

  const params: Partial<EIP681Params> = {
    pay: false,
    chainId: null,
    value: null,
    gasLimit: null,
    gasPrice: null,
    calldata: '0x',
    arguments: []
  }

  // The URI may optionally include the `pay` keyword.
  // The EIP does not fully specify what this means,
  // but I assume it is meant for creating payment requests
  if (uri.startsWith('ethereum:pay-')) {
    params.pay = true
  }

  const split = uri.split(':')
  if (split.length !== 2) {
    return null
  }

  const data = split[1].split('/')
  let target = data[0]

  if (target.startsWith('pay-')) {
    target = target.slice(4)
  }

  const [, chainId] = target.split('@')
  if (typeof chainId === 'string') {
    params.chainId = BigNumber.from(chainId)
    target = target.split('@')[0]
  }

  const regex = /^0x[a-fA-F0-9]{40}$/g

  if (!regex.test(target)) {
    return null
  }

  params.target = target

  const method = data[1].split('?')

  const func = method[0]
  const input = method[1]

  const args = input.split('&')

  const types = []
  const values = []

  for (const arg of args) {
    let [type, value] = arg.split('=')

    if (type === '' || value === '') {
      return null
    }

    if (isBuiltIn(type)) {
      // Handle `gas` as an alias for `gasLimit`
      if (type === 'gas') {
        type = 'gasLimit'
      }
      // TODO: does this handle scientific notation?
      params[type] = BigNumber.from(value)
      continue
    }

    types.push(type)
    values.push(value)
  }

  const fn = func + '(' + types.join(',') + ')'
  params.function = fn

  const digest = keccak256(toUtf8Bytes(fn))
  const selector = hexDataSlice(digest, 0, 4)

  const encoded = defaultAbiCoder.encode(types, values)
  const calldata = hexConcat([selector, encoded])

  params.calldata = calldata

  for (let i = 0; i < types.length; i++) {
    params.arguments.push({
      type: types[i],
      value: values[i]
    })

  }

  return params
}

export const EIP681 = {
  encode,
  decode,
}
