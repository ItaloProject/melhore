import { DownloadThanks } from './thanks'
import { isSafeReleaseUrl, releaseAssetUrl } from '@/lib/download'

export const dynamic = 'force-dynamic'

type Search = {
  platform?: string
  url?: string
  tag?: string
  file?: string
}

function resolveDownload(searchParams: Search) {
  const fromParts = searchParams.tag && searchParams.file
    ? releaseAssetUrl(searchParams.tag, searchParams.file)
    : null
  const url = fromParts || searchParams.url || ''
  return {
    url,
    platform: searchParams.platform === 'android' ? 'android' as const : 'windows' as const,
    safe: isSafeReleaseUrl(url),
  }
}

export default function DownloadObrigadoPage({
  searchParams,
}: {
  searchParams: Search
}) {
  const { url, platform, safe } = resolveDownload(searchParams)
  return <DownloadThanks url={url} platform={platform} safe={safe} />
}
