'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap } from 'lucide-react'
import { useFadeUp } from '@/hooks/use-gsap'

const badges = ['Sem cartão de crédito', '5 min para configurar', 'Windows, Android e iOS']

const kpis = [
  { l: 'Vendas hoje',    id: 'hkv-vend', v: 'R$ 4.280', c: 'text-emerald-400' },
  { l: 'Pedidos online', id: 'hkv-onl',  v: '7 novos',  c: 'text-blue-400'   },
  { l: 'Em estoque',     id: '',          v: '342 itens', c: 'text-violet-400' },
  { l: 'Crítico',        id: '',          v: '5 SKUs',   c: 'text-rose-400'   },
]

const navItems = ['Dashboard', 'Produtos', 'Estoque', 'Vendas / PDV', 'Caixa', 'Relatórios']

export function HeroSection() {
  const leftRef    = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const frameRef   = useRef<HTMLDivElement>(null)

  useFadeUp(leftRef,    { delay: 0.1, y: 24 })
  useFadeUp(previewRef, { delay: 0.4, y: 32 })

  useEffect(() => {
    const maybeFrame = frameRef.current
    if (!maybeFrame) return
    const frame: HTMLDivElement = maybeFrame

    // ── helpers ────────────────────────────────────────────────────────────
    const cur = frame.querySelector<HTMLElement>('#hmock-cursor')!
    const navEls: Record<string, HTMLElement> = {}
    navItems.forEach((_, i) => {
      const el = frame.querySelector<HTMLElement>(`[data-nav="${i}"]`)
      if (el) navEls[i] = el
    })

    function moveTo(el: HTMLElement | null, dx = 0, dy = 0) {
      if (!el || !cur) return
      const fr = frame.getBoundingClientRect()
      const er = el.getBoundingClientRect()
      cur.style.left = (er.left - fr.left + er.width / 2 + dx - 7) + 'px'
      cur.style.top  = (er.top  - fr.top  + er.height / 2 + dy - 7) + 'px'
    }

    function click() {
      if (!cur) return
      cur.classList.remove('hmock-click')
      void cur.offsetWidth
      cur.classList.add('hmock-click')
      setTimeout(() => cur.classList.remove('hmock-click'), 250)
    }

    function setNav(idx: number) {
      Object.values(navEls).forEach(el => el.classList.remove('hmock-nav-active', 'hmock-nav-hover'))
      navEls[idx]?.classList.add('hmock-nav-active')
    }

    function hoverNav(idx: number) { navEls[idx]?.classList.add('hmock-nav-hover') }
    function unhoverNav(idx: number) { navEls[idx]?.classList.remove('hmock-nav-hover') }

    function setScreen(id: string) {
      frame.querySelectorAll<HTMLElement>('[data-screen]').forEach(el => {
        el.style.display = el.dataset.screen === id ? 'flex' : 'none'
      })
    }

    // ── Sales data ─────────────────────────────────────────────────────────
    const newSales = [
      { name: 'Bermuda Bege 42',    pill: 'Físico', green: true,  price: 'R$ 119,90', cents: 11990 },
      { name: 'Regata Listrada P',  pill: 'Online', green: false, price: 'R$ 59,90',  cents: 5990  },
      { name: 'Saia Midi Preta M',  pill: 'Online', green: false, price: 'R$ 229,90', cents: 22990 },
    ]
    let salesCents = 428000, onlineCnt = 7, saleIdx = 0

    function addSale() {
      const s = newSales[saleIdx++ % newSales.length]
      const rows = frame.querySelector<HTMLElement>('#hmock-rows')
      if (!rows) return
      if (rows.children.length >= 4) rows.removeChild(rows.lastElementChild!)
      const div = document.createElement('div')
      div.className = 'hmock-row hmock-row-new'
      div.innerHTML = `
        <span class="hmock-cell hmock-name">${s.name}</span>
        <span class="hmock-cell"><span class="hmock-pill ${s.green ? 'hmock-pill-green' : 'hmock-pill-blue'}">${s.pill}</span></span>
        <span class="hmock-cell hmock-price">${s.price}</span>`
      rows.insertBefore(div, rows.firstChild)
      setTimeout(() => div.classList.remove('hmock-row-new'), 400)

      salesCents += s.cents
      const venEl = frame.querySelector<HTMLElement>('#hkv-vend')
      if (venEl) {
        venEl.classList.add('hmock-bounce')
        setTimeout(() => {
          venEl.textContent = 'R$ ' + (salesCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })
          venEl.classList.remove('hmock-bounce')
        }, 150)
      }
      if (!s.green) {
        onlineCnt++
        const onlEl = frame.querySelector<HTMLElement>('#hkv-onl')
        if (onlEl) {
          onlEl.classList.add('hmock-bounce')
          setTimeout(() => {
            onlEl.textContent = onlineCnt + ' novos'
            onlEl.classList.remove('hmock-bounce')
          }, 200)
          const kpiEl = frame.querySelector<HTMLElement>('#hmock-kpi-onl')
          if (kpiEl) {
            const badge = document.createElement('div')
            badge.className = 'hmock-notif'
            kpiEl.appendChild(badge)
            setTimeout(() => badge.remove(), 1600)
          }
        }
      }
    }

    function hoverRow(idx: number) {
      const rows = frame.querySelectorAll('#hmock-rows .hmock-row')
      rows[idx]?.classList.add('hmock-row-hover')
    }
    function unhoverRow(idx: number) {
      const rows = frame.querySelectorAll('#hmock-rows .hmock-row')
      rows[idx]?.classList.remove('hmock-row-hover')
    }

    // ── Estoque adjust ──────────────────────────────────────────────────────
    const estOrig: Record<string, number> = { '1': 12, '2': 3, '3': 8, '4': 2 }
    function resetEst() {
      ;['1','2','3','4'].forEach(n => {
        const el = frame.querySelector<HTMLElement>(`#heq${n}`)
        if (!el) return
        el.textContent = String(estOrig[n])
        el.className = 'hmock-est-qty' + (estOrig[n] <= 3 ? ' hmock-est-crit' : '')
      })
    }
    function adjustEst(n: string) {
      const btn = frame.querySelector<HTMLElement>(`#heb${n}`)
      const qty = frame.querySelector<HTMLElement>(`#heq${n}`)
      if (!btn || !qty) return
      btn.classList.add('hmock-est-btn-active')
      setTimeout(() => {
        qty.textContent = String(parseInt(qty.textContent || '0') + 1)
        qty.classList.remove('hmock-est-crit')
        qty.classList.add('hmock-est-ok')
        btn.classList.remove('hmock-est-btn-active')
        setTimeout(() => qty.classList.remove('hmock-est-ok'), 700)
      }, 220)
    }

    // ── PDV typing ─────────────────────────────────────────────────────────
    let pdvTotal = 0
    const pdvProds = [
      { name: 'Camisa Preta M', price: 89.90 },
      { name: 'Calça Jeans 40', price: 189.90 },
    ]
    function resetPDV() {
      pdvTotal = 0
      const cart = frame.querySelector<HTMLElement>('#hmock-pdvcart')
      if (cart) cart.innerHTML = ''
      const tot = frame.querySelector<HTMLElement>('#hmock-pdvtotal')
      if (tot) tot.textContent = 'R$ 0,00'
      const txt = frame.querySelector<HTMLElement>('#hmock-pdvtxt')
      if (txt) txt.textContent = 'Buscar produto...'
      const caret = frame.querySelector<HTMLElement>('#hmock-pdvcaret')
      if (caret) caret.style.display = 'none'
    }
    function typeSearch(text: string, cb: () => void) {
      const el = frame.querySelector<HTMLElement>('#hmock-pdvtxt')
      const caret = frame.querySelector<HTMLElement>('#hmock-pdvcaret')
      if (!el) return
      if (caret) caret.style.display = 'inline-block'
      let i = 0, str = ''
      const iv = setInterval(() => {
        str += text[i++]
        el.textContent = str
        if (i >= text.length) { clearInterval(iv); setTimeout(cb, 350) }
      }, 75)
    }
    function addCartItem(prod: { name: string; price: number }) {
      const cart = frame.querySelector<HTMLElement>('#hmock-pdvcart')
      if (!cart) return
      const div = document.createElement('div')
      div.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.05);animation:hmockRowIn .25s ease'
      div.innerHTML = `<span style="font-size:10px;color:#A89E90">${prod.name}</span><span style="font-size:10px;color:#4ADE80;font-weight:600">${'R$ ' + prod.price.toFixed(2).replace('.', ',')}</span>`
      cart.appendChild(div)
      pdvTotal += prod.price
      const tot = frame.querySelector<HTMLElement>('#hmock-pdvtotal')
      if (tot) tot.textContent = 'R$ ' + pdvTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const txt = frame.querySelector<HTMLElement>('#hmock-pdvtxt')
      if (txt) txt.textContent = 'Buscar produto...'
    }

    // ── Phases ──────────────────────────────────────────────────────────────
    function phase1() {
      setNav(0); setScreen('dash')
      const rows = frame.querySelectorAll('#hmock-rows .hmock-row')
      if (rows[2]) moveTo(rows[2] as HTMLElement)
      setTimeout(() => { hoverRow(2); click(); setTimeout(() => unhoverRow(2), 500) }, 700)
      setTimeout(addSale, 1900)
    }

    function phase2() {
      resetEst()
      moveTo(navEls[2]); hoverNav(2)
      setTimeout(() => {
        click(); unhoverNav(2); setNav(2); setScreen('est')
      }, 700)
      setTimeout(() => moveTo(frame.querySelector<HTMLElement>('#heb2')), 1700)
      setTimeout(() => { click(); adjustEst('2') }, 2500)
      setTimeout(() => moveTo(frame.querySelector<HTMLElement>('#heb4')), 3500)
      setTimeout(() => { click(); adjustEst('4') }, 4200)
    }

    function phase3() {
      resetPDV()
      moveTo(navEls[3]); hoverNav(3)
      setTimeout(() => {
        click(); unhoverNav(3); setNav(3); setScreen('pdv')
      }, 700)
      const searchEl = frame.querySelector<HTMLElement>('#hmock-pdvsearch')
      setTimeout(() => { if (searchEl) moveTo(searchEl) }, 1600)
      setTimeout(() => {
        click()
        typeSearch('camisa preta', () => {
          addCartItem(pdvProds[0])
          setTimeout(() => {
            typeSearch('calça jeans', () => {
              addCartItem(pdvProds[1])
              const caret = frame.querySelector<HTMLElement>('#hmock-pdvcaret')
              if (caret) caret.style.display = 'none'
            })
          }, 900)
        })
      }, 2400)
    }

    function phase4() {
      moveTo(navEls[0]); hoverNav(0)
      setTimeout(() => {
        click(); unhoverNav(0); setNav(0); setScreen('dash')
      }, 700)
      setTimeout(addSale, 2100)
    }

    const CYCLE = 22000
    const timeouts: ReturnType<typeof setTimeout>[] = []

    function runCycle() {
      phase1()
      timeouts.push(setTimeout(phase2, 5000))
      timeouts.push(setTimeout(phase3, 10500))
      timeouts.push(setTimeout(phase4, 16500))
    }

    const startTimeout = setTimeout(runCycle, 1500)
    const interval = setInterval(runCycle, CYCLE)

    return () => {
      clearTimeout(startTimeout)
      clearInterval(interval)
      timeouts.forEach(clearTimeout)
    }
  }, [])

  return (
    <section className="relative min-h-[calc(100svh-64px)] flex items-center py-12 px-4 sm:px-6 overflow-hidden">
      {/* bg glows */}
      <div className="absolute inset-0 bg-mesh-brand opacity-70 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[min(700px,90vw)] h-80 bg-brand-700/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10 xl:gap-16 items-center">

          {/* ── Left: headline + CTA ── */}
          <div ref={leftRef} style={{ opacity: 0 }} className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300 mb-6">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              Físico e digital em tempo real
            </span>

            <h1
              className="font-bold leading-[1.05] tracking-tight mb-5"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }}
            >
              Gestão que
              <br />
              <span className="text-gradient">melhora</span> sua loja
            </h1>

            <p className="text-slate-400 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed"
              style={{ fontSize: 'clamp(1rem, 1.8vw, 1.125rem)' }}>
              PDV, estoque, caixa e vitrine online integrados.
              Venda no balcão ou pelo celular do cliente — o mesmo estoque, um único sistema.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8">
              <Link
                href="/cadastro"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-base transition-all shadow-xl shadow-brand-900/40 w-full sm:w-auto"
              >
                Criar minha loja
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="#download"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/10 hover:border-white/25 text-slate-300 hover:text-white rounded-xl font-medium text-base transition-all w-full sm:w-auto"
              >
                Baixar o app
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm text-slate-500 flex-wrap">
              {badges.map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-500 shrink-0" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: animated admin preview ── */}
          <div ref={previewRef} style={{ opacity: 0 }} className="hidden sm:block">
            <div
              ref={frameRef}
              className="relative rounded-2xl border border-white/8 overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.55)] bg-surface-800"
            >
              {/* cursor */}
              <div id="hmock-cursor" className="hmock-cursor" style={{ left: '170px', top: '90px' }} />

              {/* browser bar */}
              <div className="h-9 flex items-center gap-2 px-3 bg-surface-900 border-b border-white/5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                <div className="mx-auto px-3 py-0.5 rounded bg-white/5 text-[11px] text-slate-600 truncate max-w-[220px]">
                  app.melhore.com.br/admin
                </div>
              </div>

              {/* body */}
              <div className="flex" style={{ height: 'clamp(220px, 28vw, 320px)' }}>

                {/* sidebar */}
                <div className="hidden lg:flex w-40 xl:w-44 bg-surface-900 border-r border-white/5 p-2.5 flex-col gap-0.5 shrink-0">
                  <div className="px-2 py-1.5 mb-1">
                    <span className="text-xs font-bold tracking-[0.06em] text-white">
                      MELHOR<span className="text-brand-400" style={{ textShadow: '0 0 8px rgba(167,139,250,0.5)' }}>E</span>
                    </span>
                  </div>
                  {navItems.map((item, i) => (
                    <div
                      key={item}
                      data-nav={i}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors ${
                        i === 0 ? 'hmock-nav-active bg-brand-600/20 text-brand-300' : 'text-slate-500'
                      }`}
                    >
                      <div className={`hmock-nav-dot w-1.5 h-1.5 rounded-full shrink-0 ${i === 0 ? 'bg-brand-400' : 'bg-white/10'}`} />
                      {item}
                    </div>
                  ))}
                </div>

                {/* ── DASHBOARD ── */}
                <div data-screen="dash" className="flex-1 p-3 sm:p-4 flex flex-col gap-3 bg-slate-50/[0.02] overflow-hidden">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {kpis.map((s) => (
                      <div
                        key={s.l}
                        id={s.id === 'hkv-onl' ? 'hmock-kpi-onl' : undefined}
                        className="relative rounded-xl bg-white/[0.04] border border-white/5 p-2.5"
                      >
                        <p className="text-[9px] text-slate-500 mb-1 uppercase tracking-wider leading-tight">{s.l}</p>
                        <p id={s.id || undefined} className={`text-sm font-bold ${s.c}`}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 rounded-xl bg-white/[0.04] border border-white/5 overflow-hidden">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider px-3 pt-2.5 pb-1.5">Vendas Recentes</p>
                    <div id="hmock-rows">
                      <div className="hmock-row"><span className="hmock-cell hmock-name">Camisa Preta M</span><span className="hmock-cell"><span className="hmock-pill hmock-pill-green">Físico</span></span><span className="hmock-cell hmock-price">R$ 89,90</span></div>
                      <div className="hmock-row"><span className="hmock-cell hmock-name">Calça Jeans 40</span><span className="hmock-cell"><span className="hmock-pill hmock-pill-blue">Online</span></span><span className="hmock-cell hmock-price">R$ 189,90</span></div>
                      <div className="hmock-row"><span className="hmock-cell hmock-name">Vestido Floral M</span><span className="hmock-cell"><span className="hmock-pill hmock-pill-blue">Online</span></span><span className="hmock-cell hmock-price">R$ 229,90</span></div>
                      <div className="hmock-row"><span className="hmock-cell hmock-name">Blusa Branca G</span><span className="hmock-cell"><span className="hmock-pill hmock-pill-green">Físico</span></span><span className="hmock-cell hmock-price">R$ 79,90</span></div>
                    </div>
                  </div>
                </div>

                {/* ── ESTOQUE ── */}
                <div data-screen="est" className="flex-1 p-3 sm:p-4 flex-col gap-3 bg-slate-50/[0.02] overflow-hidden" style={{ display: 'none' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-white">Controle de Estoque</span>
                    <span className="text-[9px] bg-violet-500/15 text-violet-300 border border-violet-500/25 rounded px-1.5 py-0.5">5 críticos</span>
                  </div>
                  <div className="flex-1 rounded-xl bg-white/[0.04] border border-white/5 overflow-hidden">
                    <div className="grid text-[9px] text-slate-500 uppercase tracking-wider px-2.5 py-1.5 border-b border-white/5" style={{ gridTemplateColumns: '1fr 30px 26px 20px' }}>
                      <span>Produto</span><span>Tam.</span><span>Qtd</span><span></span>
                    </div>
                    <div className="hmock-est-row"><span className="hmock-cell hmock-name">Camisa Preta</span><span className="hmock-cell">M</span><span className="hmock-est-qty" id="heq1">12</span><span className="hmock-cell"><span className="hmock-est-btn" id="heb1">+</span></span></div>
                    <div className="hmock-est-row"><span className="hmock-cell hmock-name">Vestido Floral</span><span className="hmock-cell">P</span><span className="hmock-est-qty hmock-est-crit" id="heq2">3</span><span className="hmock-cell"><span className="hmock-est-btn" id="heb2">+</span></span></div>
                    <div className="hmock-est-row"><span className="hmock-cell hmock-name">Calça Jeans</span><span className="hmock-cell">40</span><span className="hmock-est-qty" id="heq3">8</span><span className="hmock-cell"><span className="hmock-est-btn" id="heb3">+</span></span></div>
                    <div className="hmock-est-row"><span className="hmock-cell hmock-name">Blusa Branca</span><span className="hmock-cell">G</span><span className="hmock-est-qty hmock-est-crit" id="heq4">2</span><span className="hmock-cell"><span className="hmock-est-btn" id="heb4">+</span></span></div>
                  </div>
                </div>

                {/* ── PDV ── */}
                <div data-screen="pdv" className="flex-1 p-3 sm:p-4 flex-col gap-3 bg-slate-50/[0.02] overflow-hidden" style={{ display: 'none' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-white">Nova Venda</span>
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 rounded px-1.5 py-0.5">Caixa aberto</span>
                  </div>
                  {/* search */}
                  <div id="hmock-pdvsearch" className="flex items-center gap-1.5 bg-white/[0.04] border border-white/8 rounded-lg px-2.5 py-1.5">
                    <svg className="w-2.5 h-2.5 text-slate-600 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="7" cy="7" r="4"/><path d="M12 12l-2-2"/></svg>
                    <span className="text-[10px] text-slate-500" id="hmock-pdvtxt">Buscar produto...</span>
                    <span className="hmock-pdvcaret" id="hmock-pdvcaret" style={{ display: 'none' }} />
                  </div>
                  {/* cart */}
                  <div id="hmock-pdvcart" className="flex-1 flex flex-col gap-1" />
                  {/* total */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-2">
                    <span className="text-[9px] text-slate-500 tracking-widest">TOTAL</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono" id="hmock-pdvtotal">R$ 0,00</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
