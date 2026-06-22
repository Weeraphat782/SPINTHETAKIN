import { useEffect, useState } from 'react'
import type { Settings } from '../../lib/supabase'
import { adminGetSettings, adminUpdateSettings, adminUploadAsset } from '../../lib/api'

export default function BrandingTab() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { adminGetSettings().then(setSettings) }, [])

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !settings) return
    const url = await adminUploadAsset('branding-assets', file)
    setSettings({ ...settings, logo_url: url })
  }

  async function handleMusicUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !settings) return
    const url = await adminUploadAsset('music', file)
    setSettings({ ...settings, music_url: url })
  }

  async function handleSave() {
    if (!settings) return
    setSaving(true); setMsg('')
    try { await adminUpdateSettings(settings); setMsg('Saved!') }
    catch (e) { setMsg('Error: ' + String(e)) }
    finally { setSaving(false) }
  }

  if (!settings) return <p style={{ color: '#5D3A1A' }}>Loading…</p>

  return (
    <div className="max-w-lg flex flex-col gap-6">
      <h2 className="text-xl font-bold" style={{ color: '#B22222' }}>Branding</h2>

      <Field label="Game Title">
        <input
          className="field-light"
          value={settings.game_title}
          onChange={(e) => setSettings({ ...settings, game_title: e.target.value })}
        />
      </Field>

      <Field label="Logo (SVG/PNG)">
        <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm" style={{ color: '#5D3A1A' }} />
        {settings.logo_url && (
          <img src={settings.logo_url} alt="Logo" className="h-14 mt-2 object-contain" />
        )}
      </Field>

      <Field label="Background Music (MP3)">
        <input type="file" accept="audio/*" onChange={handleMusicUpload} className="text-sm" style={{ color: '#5D3A1A' }} />
        {settings.music_url && (
          <audio controls className="mt-2 w-full">
            <source src={settings.music_url} />
          </audio>
        )}
      </Field>

      <Field label="Music Default">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className="relative w-12 h-6 rounded-full transition-colors cursor-pointer"
            style={{ background: settings.music_default_on ? '#D4940A' : 'rgba(44,24,16,0.2)' }}
            onClick={() => setSettings({ ...settings, music_default_on: !settings.music_default_on })}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
              style={{ left: settings.music_default_on ? 28 : 4 }}
            />
          </div>
          <span className="text-sm" style={{ color: '#5D3A1A' }}>
            {settings.music_default_on ? 'Music on by default' : 'Music off by default (muted)'}
          </span>
        </label>
      </Field>

      {msg && (
        <p className="text-sm font-semibold" style={{ color: msg.startsWith('Error') ? '#B22222' : '#2E7D32' }}>
          {msg}
        </p>
      )}

      <button onClick={handleSave} disabled={saving} className="btn-gold self-start" style={{ padding: '0.6rem 1.5rem', fontSize: '0.875rem' }}>
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col gap-2 p-4 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(212,148,10,0.25)' }}
    >
      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#5D3A1A' }}>{label}</label>
      {children}
    </div>
  )
}
