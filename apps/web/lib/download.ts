const RELEASE_PREFIX = '/ItaloProject/melhore/releases/download/'

export function isSafeReleaseUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
      && parsed.hostname === 'github.com'
      && parsed.pathname.startsWith(RELEASE_PREFIX)
  } catch {
    return false
  }
}

export function parseReleaseAsset(url: string) {
  if (!isSafeReleaseUrl(url)) return null
  const rest = new URL(url).pathname.slice(RELEASE_PREFIX.length)
  const slash = rest.indexOf('/')
  if (slash < 1) return null
  const tag = rest.slice(0, slash)
  const file = decodeURIComponent(rest.slice(slash + 1))
  if (!/^v?\d[\w.-]*$/.test(tag)) return null
  if (!/^[\w.-]+\.(exe|apk|dmg|zip|yml|blockmap)$/i.test(file)) return null
  return { tag, file }
}

export function releaseAssetUrl(tag: string, file: string) {
  if (!/^v?\d[\w.-]*$/.test(tag)) return null
  if (!/^[\w.-]+\.(exe|apk|dmg|zip|yml|blockmap)$/i.test(file)) return null
  return `https://github.com/ItaloProject/melhore/releases/download/${tag}/${file}`
}

export function downloadThanksHref(url: string, platform: 'windows' | 'android') {
  const parsed = parseReleaseAsset(url)
  if (!parsed) return '/#download'
  const q = new URLSearchParams({ platform, tag: parsed.tag, file: parsed.file })
  return `/download/obrigado?${q.toString()}`
}

export function startSilentDownload(url: string) {
  if (typeof document === 'undefined' || !isSafeReleaseUrl(url)) return
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.setAttribute('aria-hidden', 'true')
  iframe.src = url
  document.body.appendChild(iframe)
}
