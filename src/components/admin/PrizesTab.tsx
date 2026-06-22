import { useEffect, useState, useCallback } from 'react'
import type { Prize } from '../../lib/supabase'
import {
  adminGetPrizes,
  adminCreatePrize,
  adminUpdatePrize,
  adminDeletePrize,
  adminUploadAsset,
} from '../../lib/api'

const COLORS = ['#E07B39','#C9A84C','#8B1A1A','#1a2a4a','#2d6a4f','#6b6375','#5b4fcf','#1a6b8b']

function isEligible(p: Prize): boolean {
  return p.active && (p.quantity_remaining === null || p.quantity_remaining > 0)
}

function calcEffectivePct(prizes: Prize[], prize: Prize): string {
  if (!prize.active) return '—'
  if (!isEligible(prize)) return '0.0'
  const total = prizes.filter(isEligible).reduce((a, p) => a + Number(p.weight), 0)
  if (total === 0) return '0'
  return ((Number(prize.weight) / total) * 100).toFixed(1)
}

function hasDuplicateSortOrder(prizes: Prize[], sortOrder: number, excludeId?: string): boolean {
  return prizes.some(
    (p) => p.active && p.sort_order === sortOrder && p.id !== excludeId
  )
}

function findDuplicateSortOrders(prizes: Prize[]): number[] {
  const seen = new Map<number, number>()
  for (const p of prizes) {
    if (!p.active) continue
    seen.set(p.sort_order, (seen.get(p.sort_order) ?? 0) + 1)
  }
  return [...seen.entries()].filter(([, count]) => count > 1).map(([order]) => order)
}

type FormData = Omit<Prize, 'id'>
const emptyForm = (): FormData => ({
  name: '', description: '', image_url: '', color: '#C9A84C',
  weight: 10, quantity_total: null, quantity_remaining: null,
  active: true, sort_order: 0, is_no_prize: false,
})

export default function PrizesTab() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Prize | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm())
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try { setPrizes(await adminGetPrizes()) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const duplicateSortOrders = findDuplicateSortOrders(prizes)

  function openAdd() {
    setEditing(null)
    setForm({ ...emptyForm(), sort_order: prizes.length })
    setError('')
    setModal('add')
  }

  function openEdit(p: Prize) {
    setEditing(p)
    setForm({
      name: p.name, description: p.description, image_url: p.image_url,
      color: p.color, weight: p.weight, quantity_total: p.quantity_total,
      quantity_remaining: p.quantity_remaining, active: p.active, sort_order: p.sort_order,
      is_no_prize: p.is_no_prize ?? false,
    })
    setError('')
    setModal('edit')
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required.'); return }
    if (form.active && hasDuplicateSortOrder(prizes, form.sort_order, editing?.id)) {
      setError(`Sort order ${form.sort_order} is already used by another active prize. Each active prize needs a unique sort order.`)
      return
    }
    setSaving(true)
    setError('')
    try {
      if (modal === 'edit' && editing) {
        const updated = await adminUpdatePrize(editing.id, form)
        setPrizes((ps) => ps.map((p) => p.id === updated.id ? updated : p))
      } else {
        const created = await adminCreatePrize(form)
        setPrizes((ps) => [...ps, created])
      }
      setModal(null)
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this prize?')) return
    setDeleteError('')
    try {
      await adminDeletePrize(id)
      setPrizes((ps) => ps.filter((p) => p.id !== id))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('foreign key') || msg.includes('violates') || msg.includes('23503')) {
        setDeleteError('Cannot delete — this prize has already been awarded to players. Disable it instead.')
      } else {
        setDeleteError(`Delete failed: ${msg}`)
      }
    }
  }

  async function toggleActive(p: Prize) {
    const updated = await adminUpdatePrize(p.id, { active: !p.active })
    setPrizes((ps) => ps.map((x) => x.id === updated.id ? updated : x))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await adminUploadAsset('prize-images', file)
      setForm((f) => ({ ...f, image_url: url }))
    } catch (err) {
      setError('Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={{ color: '#B22222' }}>Prize Configuration</h2>
        <button onClick={openAdd} className="btn-gold" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
          + Add Prize
        </button>
      </div>

      {deleteError && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-2"
          style={{ background: 'rgba(178,34,34,0.08)', border: '1.5px solid rgba(178,34,34,0.3)', color: '#B22222' }}>
          <span>⚠️</span>
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError('')} className="ml-auto font-bold opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {duplicateSortOrders.length > 0 && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: 'rgba(212,148,10,0.12)', border: '1.5px solid rgba(212,148,10,0.4)', color: '#5D3A1A' }}>
          ⚠️ Duplicate sort orders detected ({duplicateSortOrders.join(', ')}). The wheel may stop on the wrong segment until each active prize has a unique sort order.
        </div>
      )}

      <p className="text-xs mb-4" style={{ color: '#5D3A1A', opacity: 0.75 }}>
        Win % reflects effective odds from weight among prizes with stock. Wheel segments are equal size; weight controls win probability only.
      </p>

      {loading ? (
        <p style={{ color: '#5D3A1A' }}>Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: '1.5px solid rgba(212,148,10,0.25)', background: 'rgba(255,255,255,0.7)' }}>
          <table className="w-full text-sm">
            <thead style={{ background: 'rgba(212,148,10,0.12)' }}>
              <tr>
                {['Prize', 'Win % (effective)', 'Image', 'Enabled', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold uppercase tracking-wide text-xs" style={{ color: '#5D3A1A' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prizes.map((p) => (
                <tr key={p.id} style={{ borderTop: '1px solid rgba(44,24,16,0.07)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
                      <div>
                        <p className="font-semibold" style={{ color: '#2C1810' }}>{p.name}</p>
                        {p.is_no_prize && (
                          <p className="text-xs font-semibold" style={{ color: '#6b6375' }}>No prize</p>
                        )}
                        {p.quantity_total !== null && (
                          <p className="text-xs" style={{ color: '#5D3A1A', opacity: 0.6 }}>
                            {p.quantity_remaining ?? 0}/{p.quantity_total} remaining
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ color: p.active ? '#D4940A' : '#aaa', fontWeight: 600 }}>
                      {p.active
                        ? isEligible(p)
                          ? `${calcEffectivePct(prizes, p)}%`
                          : '0% (out of stock)'
                        : '—'}
                    </span>
                    <span className="text-xs ml-1" style={{ color: '#5D3A1A', opacity: 0.5 }}>(w:{p.weight})</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <span style={{ color: '#aaa' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p)} className="text-lg" title={p.active ? 'Disable' : 'Enable'}>
                      {p.active ? '✅' : '⭕'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold"
                        style={{ border: '1.5px solid #D4940A', color: '#B22222', background: 'transparent' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold"
                        style={{ border: '1.5px solid rgba(178,34,34,0.5)', color: '#B22222', background: 'transparent' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(44,24,16,0.55)' }}>
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ background: '#FFF8E7', boxShadow: '0 8px 40px rgba(44,24,16,0.2)' }}
          >
            {/* Modal header */}
            <div className="px-6 py-4" style={{ background: 'linear-gradient(135deg, #B22222 0%, #8B1A1A 100%)' }}>
              <h3 className="text-lg font-bold text-white">
                {modal === 'add' ? 'Add Prize' : 'Edit Prize'}
              </h3>
            </div>
            <div className="p-6">

            <div className="flex flex-col gap-3">
              <Field label="Name *">
                <input className="field-light" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} maxLength={60} />
              </Field>

              <Field label="Description">
                <textarea className="field-light" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </Field>

              <Field label="Probability Weight">
                <input className="field-light" type="number" min={0} value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: Number(e.target.value) }))} />
              </Field>

              <Field label="Segment Color">
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm((f) => ({ ...f, color: c }))}
                      className="w-7 h-7 rounded-full border-2 transition-all"
                      style={{
                        background: c,
                        borderColor: form.color === c ? '#fff' : 'transparent',
                        transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                  ))}
                  <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="w-7 h-7 rounded cursor-pointer" />
                </div>
              </Field>

              <Field label="Prize Image">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" style={{ color: '#5D3A1A' }} />
                {uploading && <p className="text-xs mt-1" style={{ color: '#D4940A' }}>Uploading…</p>}
                {form.image_url && (
                  <img src={form.image_url} alt="" className="w-16 h-16 rounded-lg object-cover mt-2" />
                )}
              </Field>

              <Field label="Limited Quantity (leave blank for unlimited)">
                <input
                  className="field-light"
                  type="number"
                  min={0}
                  placeholder="Unlimited"
                  value={form.quantity_total ?? ''}
                  onChange={(e) => {
                    const v = e.target.value === '' ? null : Number(e.target.value)
                    setForm((f) => ({ ...f, quantity_total: v, quantity_remaining: v }))
                  }}
                />
              </Field>

              <Field label="Sort Order">
                <input className="field-light" type="number" min={0} value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} />
              </Field>

              <label className="flex items-start gap-3 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={form.is_no_prize}
                  onChange={(e) => setForm((f) => ({ ...f, is_no_prize: e.target.checked }))}
                  className="mt-1"
                />
                <span>
                  <span className="text-sm font-semibold block" style={{ color: '#2C1810' }}>No prize / Try again</span>
                  <span className="text-xs block mt-0.5" style={{ color: '#5D3A1A', opacity: 0.75 }}>
                    Skips Congratulations and staff redemption message. Still appears on the wheel and can be won.
                  </span>
                </span>
              </label>
            </div>

            {error && <p className="text-sm mt-3" style={{ color: '#B22222' }}>{error}</p>}

            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} disabled={saving} className="btn-gold flex-1" style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2 rounded-full text-sm font-semibold"
                style={{ border: '1.5px solid rgba(44,24,16,0.2)', color: '#5D3A1A' }}
              >
                Cancel
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#5D3A1A' }}>{label}</label>
      {children}
    </div>
  )
}
