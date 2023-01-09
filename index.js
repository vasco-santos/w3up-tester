import { connect } from '@ucanto/client'
import { CAR, CBOR, HTTP } from '@ucanto/transport'
import * as DID from '@ipld/dag-ucan/did'

import { create as createClient } from '@web3-storage/w3up-client'

export const accessServiceURL = new URL('https://w3access-staging.protocol-labs.workers.dev')
export const accessServicePrincipal = DID.parse('did:web:staging.web3.storage')

export const accessServiceConnection = connect({
  id: accessServicePrincipal,
  encoder: CAR,
  decoder: CBOR,
  channel: HTTP.open({
    url: accessServiceURL,
    method: 'POST'
  })
})

export const uploadServiceURL = new URL('https://staging.up.web3.storage')
export const uploadServicePrincipal = DID.parse('did:web:staging.web3.storage')

export const uploadServiceConnection = connect({
  id: uploadServicePrincipal,
  encoder: CAR,
  decoder: CBOR,
  channel: HTTP.open({
    url: uploadServiceURL,
    method: 'POST'
  })
})

async function main () {
  const client = await createClient({
    serviceConf: {
      upload: uploadServiceConnection,
      access: accessServiceConnection
    }
  })

  await register(client)

  const bytes = await randomBytes(128)
  const file = new Blob([bytes])

  try {
    const successMessage = await client.uploadFile(file)
    console.log(successMessage)
  } catch (err) {
    console.log('err', err)
  }
}

main()

/**
 * @param {import("@web3-storage/w3up-client").Client} client
 */
async function register (client) {
  const space = await client.createSpace('my-awesome-space')
  await client.setCurrentSpace(space.did())
  await client.registerSpace('vasko_10@hotmail.com')
}


/** @param {number} size */
async function randomBytes (size) {
  const bytes = new Uint8Array(size)
  while (size) {
    const chunk = new Uint8Array(Math.min(size, 65_536))
    if (!globalThis.crypto) {
      try {
        const { webcrypto } = await import('node:crypto')
        webcrypto.getRandomValues(chunk)
      } catch (err) {
        throw new Error(
          'unknown environment - no global crypto and not Node.js',
          { cause: err }
        )
      }
    } else {
      crypto.getRandomValues(chunk)
    }
    size -= bytes.length
    bytes.set(chunk, size)
  }
  return bytes
}
