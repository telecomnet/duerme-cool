import { useEffect, useState, useCallback } from 'react'
import { Thermometer, Snowflake, Flame, RefreshCw, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

// ── Types ─────────────────────────────────────────────────────────────────────
interface DeviceRow { device_id: string; device_name: string | null; type: number | null; last_seen: string | null }
interface StateRow {
  captured_at: string
  power: number | null
  temperature_unit: number | null
  mode: number | null
  left_power: number | null;  left_temp_set: number | string | null;  left_temp_display: number | string | null
  right_power: number | null; right_temp_set: number | string | null; right_temp_display: number | string | null
}
const WINDOWS = [{ h: 6, k: '6h' }, { h: 24, k: '24h' }, { h: 72, k: '3d' }, { h: 168, k: '7d' }] as const

const num = (v: number | string | null | undefined): number | null =>
  v == null || v === '' ? null : Number(v)
const unitLabel = (u: number | null | undefined) => (u === 0 ? '°F' : '°C')

// ── Gap stats for one zone ──────────────────────────────────────────────────────
function gapStats(rows: StateRow[], side: 'left' | 'right', mode: number) {
  let gaps: number[] = [], worst: number | null = null, off = 0, on = 0
  for (const r of rows) {
    const p = num(r[`${side}_power`] as any), set = num(r[`${side}_temp_set`] as any), act = num(r[`${side}_temp_display`] as any)
    if (!p || (r.power ?? 0) === 0 || set == null || act == null) continue
    on++
    const g = mode === 1 ? set - act : act - set
    gaps.push(g); if (worst == null || g > worst) worst = g; if (g > 2) off++
  }
  if (!on) return null
  return { avg: gaps.reduce((a, b) => a + b, 0) / gaps.length, worst: worst!, pctOff: (100 * off) / on, n: on }
}

// ── Dependency-free SVG line chart ──────────────────────────────────────────────
function TempChart({ rows, unit, mode, dual, t }: { rows: StateRow[]; unit: number; mode: number; dual: boolean; t: (k: string) => string }) {
  const W = 720, H = 260, mL = 38, mR = 12, mT = 12, mB = 26
  const series = [
    { label: `${dual ? t('monitoring.zone.left') + ' ' : ''}${t('monitoring.target')}`, vals: rows.map(r => num(r.left_temp_set)),      color: mode === 1 ? '#E851B3' : '#3B7BE3', dash: '5 4' },
    { label: `${dual ? t('monitoring.zone.left') + ' ' : ''}${t('monitoring.actual')}`, vals: rows.map(r => num(r.left_temp_display)),  color: '#f59e0b', dash: '' },
  ]
  if (dual) {
    series.push({ label: `${t('monitoring.zone.right')} ${t('monitoring.target')}`, vals: rows.map(r => num(r.right_temp_set)),     color: '#7aa7ef', dash: '5 4' })
    series.push({ label: `${t('monitoring.zone.right')} ${t('monitoring.actual')}`, vals: rows.map(r => num(r.right_temp_display)), color: '#fbbf24', dash: '' })
  }
  const all = series.flatMap(s => s.vals).filter((v): v is number => v != null)
  const yMin = all.length ? Math.min(...all) - 2 : 0
  const yMax = all.length ? Math.max(...all) + 2 : 40
  const n = rows.length
  const px = (i: number) => mL + (n <= 1 ? 0 : (i * (W - mL - mR)) / (n - 1))
  const py = (v: number) => mT + (H - mT - mB) * (1 - (v - yMin) / (yMax - yMin || 1))
  const pathFor = (vals: (number | null)[]) => {
    let d = '', pen = false
    vals.forEach((v, i) => { if (v == null) { pen = false; return } d += `${pen ? 'L' : 'M'}${px(i).toFixed(1)},${py(v).toFixed(1)} `; pen = true })
    return d.trim()
  }
  const ticks = 4
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => yMin + ((yMax - yMin) * i) / ticks)
  const fmtTime = (s: string) => new Date(s).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  const xIdx = n <= 1 ? [0] : [0, Math.floor(n / 2), n - 1]

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[260px]">
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={mL} x2={W - mR} y1={py(v)} y2={py(v)} stroke="#eef1f5" strokeWidth={1} />
            <text x={mL - 6} y={py(v) + 3} textAnchor="end" fontSize={10} fill="#94a3b8">{v.toFixed(0)}</text>
          </g>
        ))}
        {xIdx.map((i) => (
          <text key={i} x={px(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontSize={10} fill="#94a3b8">
            {rows[i] ? fmtTime(rows[i].captured_at) : ''}
          </text>
        ))}
        {series.map((s, i) => (
          <path key={i} d={pathFor(s.vals)} fill="none" stroke={s.color} strokeWidth={2} strokeDasharray={s.dash} strokeLinejoin="round" strokeLinecap="round" />
        ))}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 px-1">
        {series.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="inline-block w-4 h-0.5 rounded" style={{ background: s.color, borderTop: s.dash ? `2px dashed ${s.color}` : undefined }} />
            {s.label}
          </span>
        ))}
        <span className="ml-auto text-[11px] text-gray-400">{t('monitoring.actual')} vs {t('monitoring.target')} · {unitLabel(unit)}</span>
      </div>
    </div>
  )
}

// ── Per-device card ─────────────────────────────────────────────────────────────
function DeviceCard({ device, rows, t, language }: { device: DeviceRow; rows: StateRow[]; t: (k: string) => string; language: string }) {
  const last = rows[rows.length - 1]
  const unit = last?.temperature_unit ?? 1
  const mode = last?.mode ?? 0
  const dual = device.type === 1
  const lg = gapStats(rows, 'left', mode)
  const rg = dual ? gapStats(rows, 'right', mode) : null
  const worstAvg = Math.max(lg ? lg.avg : -99, rg ? rg.avg : -99)
  const fmt = (s: string | null) => (s ? new Date(s).toLocaleString(language === 'es' ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')

  const Stat = ({ label, g }: { label: string; g: ReturnType<typeof gapStats> }) => !g ? null : (
    <div className="flex flex-col">
      <span className={`text-lg font-bold ${g.avg > 2 ? 'text-red-500' : 'text-emerald-500'}`}>{g.avg >= 0 ? '+' : ''}{g.avg.toFixed(1)}{unitLabel(unit)}</span>
      <span className="text-[10px] uppercase tracking-wide text-gray-400">{label} {t('monitoring.avgGap')}</span>
    </div>
  )

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-1">
        {mode === 1 ? <Flame className="h-5 w-5 text-pink-500" /> : <Snowflake className="h-5 w-5 text-blue-500" />}
        <h3 className="font-bold text-gray-900 text-base flex-1">{device.device_name || t('monitoring.zone.bed')}</h3>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        {mode === 1 ? t('monitoring.mode.heating') : t('monitoring.mode.cooling')} · {unitLabel(unit)} · {dual ? t('monitoring.dual') : t('monitoring.single')} · {rows.length} {t('monitoring.samples')} · {t('monitoring.lastSync')} {fmt(device.last_seen)}
      </p>

      <div className="flex gap-6 flex-wrap mb-4">
        <Stat label={dual ? t('monitoring.zone.left') : t('monitoring.zone.bed')} g={lg} />
        {dual && <Stat label={t('monitoring.zone.right')} g={rg} />}
      </div>

      {rows.length > 0
        ? <TempChart rows={rows} unit={unit} mode={mode} dual={dual} t={t} />
        : <div className="text-center text-sm text-gray-400 py-10">{t('monitoring.noWindowData')}</div>}

      {(lg || rg) && (
        <div className="mt-4">
          {worstAvg > 2
            ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100"><AlertTriangle className="h-3.5 w-3.5" />{t('monitoring.verdict.bad')} — {worstAvg.toFixed(1)}{unitLabel(unit)}</span>
            : <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100"><CheckCircle2 className="h-3.5 w-3.5" />{t('monitoring.verdict.ok')}</span>}
        </div>
      )}
    </div>
  )
}

// ── Main panel ──────────────────────────────────────────────────────────────────
export default function MonitoringPanel() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [hours, setHours] = useState(24)
  const [devices, setDevices] = useState<DeviceRow[]>([])
  const [statesByDevice, setStates] = useState<Record<string, StateRow[]>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data: devs } = await supabase
      .from('dc_devices')
      .select('device_id, device_name, type, last_seen')
      .eq('user_id', user.id)
      .order('device_name', { ascending: true })
    const list = (devs ?? []) as DeviceRow[]
    setDevices(list)
    const since = new Date(Date.now() - hours * 3600e3).toISOString()
    const map: Record<string, StateRow[]> = {}
    for (const d of list) {
      const { data: rows } = await supabase
        .from('dc_device_state')
        .select('captured_at, power, temperature_unit, mode, left_power, left_temp_set, left_temp_display, right_power, right_temp_set, right_temp_display')
        .eq('user_id', user.id)
        .eq('device_id', d.device_id)
        .gte('captured_at', since)
        .order('captured_at', { ascending: true })
        .limit(5000)
      map[d.device_id] = (rows ?? []) as StateRow[]
    }
    setStates(map)
    setLoading(false)
  }, [user, hours])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const id = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [load])

  // No linked device → opt-in prompt
  if (!loading && devices.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm px-6">
        <Thermometer className="h-12 w-12 text-blue-200 mx-auto mb-4" />
        <p className="font-bold text-gray-700 mb-2">{t('monitoring.notEnabled.title')}</p>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-5">{t('monitoring.notEnabled.desc')}</p>
        <a href="mailto:contacto@duerme.cool?subject=Activar%20monitoreo"
           className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Activity className="h-4 w-4" /> {t('monitoring.notEnabled.cta')}
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-xs text-gray-500 flex items-center gap-2">
          {t('monitoring.window')}
          <select value={hours} onChange={(e) => setHours(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {WINDOWS.map(w => <option key={w.h} value={w.h}>{t(`monitoring.win.${w.k}`)}</option>)}
          </select>
        </label>
        <div className="flex-1" />
        <button onClick={load} disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> {t('monitoring.refresh')}
        </button>
      </div>

      {loading && devices.length === 0 ? (
        <div className="flex justify-center py-20"><span className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : (
        devices.map(d => <DeviceCard key={d.device_id} device={d} rows={statesByDevice[d.device_id] ?? []} t={t} language={language} />)
      )}
    </div>
  )
}
