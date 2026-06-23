import { useEffect, useState } from 'react'
import type { Settings } from '../../lib/supabase'
import { adminGetSettings, adminUpdateSettings, adminResetDeviceLocks, adminResetEvent } from '../../lib/api'

export default function SettingsTab() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resettingEvent, setResettingEvent] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { adminGetSettings().then(setSettings) }, [])

  async function handleSave() {
    if (!settings) return
    setSaving(true); setMsg('')
    try { await adminUpdateSettings({ spin_duration_ms: settings.spin_duration_ms }); setMsg('Saved!') }
    catch (e) { setMsg('Error: ' + String(e)) }
    finally { setSaving(false) }
  }

  async function handleResetLocks() {
    if (!confirm('Reset all device locks? All players will be able to spin again.')) return
    setResetting(true); setMsg('')
    try { await adminResetDeviceLocks(); setMsg('Device locks cleared. All players can spin again.') }
    catch (e) { setMsg('Error: ' + String(e)) }
    finally { setResetting(false) }
  }

  async function handleResetEvent() {
    if (!confirm('Reset all stock quantities and pity counters to their starting values? Use this before a new event after testing.')) return
    setResettingEvent(true); setMsg('')
    try { await adminResetEvent(); setMsg('Done — all quantities and pity counters have been reset to their starting values.') }
    catch (e) { setMsg('Error: ' + String(e)) }
    finally { setResettingEvent(false) }
  }

  if (!settings) return <p style={{ color: '#5D3A1A' }}>Loading…</p>

  return (
    <div className="max-w-lg flex flex-col gap-6">
      <h2 className="text-xl font-bold" style={{ color: '#B22222' }}>Game Settings</h2>

      {/* Spin duration */}
      <div
        className="p-5 rounded-xl flex flex-col gap-3"
        style={{ background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(212,148,10,0.25)' }}
      >
        <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#5D3A1A' }}>
          Spin Duration: <span style={{ color: '#D4940A' }}>{(settings.spin_duration_ms / 1000).toFixed(1)}s</span>
        </label>
        <input
          type="range" min={2000} max={10000} step={500}
          value={settings.spin_duration_ms}
          onChange={(e) => setSettings({ ...settings, spin_duration_ms: Number(e.target.value) })}
          className="w-full accent-amber-600"
        />
        <div className="flex justify-between text-xs" style={{ color: '#5D3A1A', opacity: 0.6 }}>
          <span>2s (quick)</span>
          <span>10s (dramatic)</span>
        </div>
      </div>

      {msg && (
        <p className="text-sm font-semibold" style={{ color: msg.startsWith('Error') ? '#B22222' : '#2E7D32' }}>
          {msg}
        </p>
      )}

      <button onClick={handleSave} disabled={saving} className="btn-gold self-start" style={{ padding: '0.6rem 1.5rem', fontSize: '0.875rem' }}>
        {saving ? 'Saving…' : 'Save Settings'}
      </button>

      {/* Danger zone */}
      <div
        className="rounded-xl p-5 flex flex-col gap-4"
        style={{ border: '1.5px solid rgba(178,34,34,0.35)', background: 'rgba(178,34,34,0.06)' }}
      >
        <h3 className="font-bold text-sm" style={{ color: '#B22222' }}>⚠️ Danger Zone</h3>

        {/* Reset event counters */}
        <div className="flex flex-col gap-1 pb-4" style={{ borderBottom: '1px solid rgba(178,34,34,0.15)' }}>
          <p className="text-sm font-semibold" style={{ color: '#5D3A1A' }}>Reset Stock & Pity Counters</p>
          <p className="text-xs" style={{ color: '#5D3A1A', opacity: 0.75 }}>
            Restores all prize quantities back to their starting values and clears all pity counters. Use this after testing — before the real event starts.
          </p>
          <button
            onClick={handleResetEvent}
            disabled={resettingEvent}
            className="self-start mt-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-red-50"
            style={{ border: '1.5px solid #B22222', color: '#B22222', background: 'transparent' }}
          >
            {resettingEvent ? 'Resetting…' : 'Reset Stock & Pity Counters'}
          </button>
        </div>

        {/* Reset device locks */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold" style={{ color: '#5D3A1A' }}>Reset Device Locks</p>
          <p className="text-xs" style={{ color: '#5D3A1A', opacity: 0.75 }}>
            Clears all play records so every device can spin again. Use this at the start of a new event day.
          </p>
          <button
            onClick={handleResetLocks}
            disabled={resetting}
            className="self-start mt-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-red-50"
            style={{ border: '1.5px solid #B22222', color: '#B22222', background: 'transparent' }}
          >
            {resetting ? 'Resetting…' : 'Reset All Device Locks'}
          </button>
        </div>
      </div>
    </div>
  )
}
