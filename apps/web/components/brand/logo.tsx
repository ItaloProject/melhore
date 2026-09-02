import Image from 'next/image'
import { cn } from '@/lib/utils'

export function BrandLogo({
  size = 32,
  showName = true,
  light = true,
  className,
}: {
  size?: number
  showName?: boolean
  light?: boolean
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 shrink-0', className)}>
      <Image
        src="/brand/melhore-mark.png"
        width={size}
        height={size}
        alt={showName ? '' : 'Melhore'}
        className="rounded-[22%] shrink-0"
        priority
      />
      {showName && (
        <span
          className={cn(
            'font-bold tracking-[0.08em]',
            light ? 'text-white' : 'text-gray-900',
          )}
        >
          MELHORE
        </span>
      )}
    </span>
  )
}
