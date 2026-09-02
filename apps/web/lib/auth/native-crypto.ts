const encoder = new TextEncoder()
const decoder = new TextDecoder()

function toBase64Url(bytes: Uint8Array) {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

async function secretDigest(secret: string) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(secret)))
}

async function encryptionKey(secret: string) {
  return crypto.subtle.importKey('raw', await secretDigest(secret), 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ])
}

export async function nativeRequestId(secret: string) {
  return toBase64Url((await secretDigest(secret)).slice(0, 16))
}

export async function encryptNativeCredential(
  secret: string,
  credential: { idToken: string; nonce: string },
) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      await encryptionKey(secret),
      encoder.encode(JSON.stringify(credential)),
    ),
  )
  const payload = new Uint8Array(iv.length + encrypted.length)
  payload.set(iv)
  payload.set(encrypted, iv.length)

  return {
    request: await nativeRequestId(secret),
    payload: toBase64Url(payload),
  }
}

export async function decryptNativeCredential(secret: string, payload: string) {
  const bytes = fromBase64Url(payload)
  if (bytes.length < 29) throw new Error('invalid credential')

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: bytes.slice(0, 12) },
    await encryptionKey(secret),
    bytes.slice(12),
  )
  const credential = JSON.parse(decoder.decode(decrypted)) as {
    idToken?: string
    nonce?: string
  }

  if (!credential.idToken || !credential.nonce) throw new Error('invalid credential')
  return { idToken: credential.idToken, nonce: credential.nonce }
}
