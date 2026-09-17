'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'

export function StorefrontHeader({
  storeSlug,
  storeName,
  logoUrl,
}: {
  storeSlug: string
  storeName: string
  logoUrl: string | null
}) {
  const items = useCartStore((s) => s.items)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const count = mounted ? items.reduce((s, i) => s + i.qty, 0) : 0

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href={`/${storeSlug}`} className="flex items-center gap-3 min-w-0">
          {logoUrl ? (
            <Image src={logoUrl} alt={storeName} width={36} height={36} className="rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-brand-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
              {storeName.charAt(0)}
            </div>
          )}
          <span className="font-bold text-gray-900 truncate">{storeName}</span>
        </Link>

        <Link href={`/${storeSlug}/carrinho`} className="relative p-2 hover:bg-gray-50 rounded-lg shrink-0">
          <ShoppingBag className="w-6 h-6 text-gray-700" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
