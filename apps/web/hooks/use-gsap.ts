'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/** Fade up on mount — hero entrance */
export function useFadeUp(
  ref: RefObject<HTMLElement>,
  options?: { delay?: number; duration?: number; y?: number }
) {
  useEffect(() => {
    if (!ref.current) return
    const { delay = 0, duration = 0.7, y = 24 } = options ?? {}
    gsap.fromTo(
      ref.current,
      { opacity: 0, y },
      { opacity: 1, y: 0, duration, delay, ease: 'power3.out' }
    )
  }, [ref, options?.delay, options?.duration, options?.y])
}

/** Stagger children on mount */
export function useStagger(
  ref: RefObject<HTMLElement>,
  options?: { delay?: number; stagger?: number; y?: number }
) {
  useEffect(() => {
    if (!ref.current) return
    const { delay = 0, stagger = 0.1, y = 20 } = options ?? {}
    gsap.fromTo(
      ref.current.children,
      { opacity: 0, y },
      { opacity: 1, y: 0, duration: 0.6, delay, stagger, ease: 'power2.out' }
    )
  }, [ref])
}

/** Reveal on scroll — cards, sections */
export function useScrollReveal(
  ref: RefObject<HTMLElement>,
  options?: { y?: number; stagger?: number; threshold?: string }
) {
  useEffect(() => {
    if (!ref.current) return
    const { y = 32, stagger = 0.1, threshold = 'top 88%' } = options ?? {}
    const targets = ref.current.children.length > 0 ? ref.current.children : [ref.current]

    gsap.fromTo(
      targets,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: threshold,
          once: true,
        },
      }
    )

    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [ref])
}

/** Number counter on scroll */
export function useCountUp(
  ref: RefObject<HTMLElement>,
  target: number,
  options?: { prefix?: string; suffix?: string; duration?: number }
) {
  useEffect(() => {
    if (!ref.current) return
    const { prefix = '', suffix = '', duration = 1.5 } = options ?? {}
    const obj = { val: 0 }

    gsap.to(obj, {
      val: target,
      duration,
      ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      onUpdate() {
        if (ref.current) {
          ref.current.textContent = `${prefix}${Math.round(obj.val).toLocaleString('pt-BR')}${suffix}`
        }
      },
    })
  }, [ref, target])
}
