import { useEffect, useState, useCallback } from 'react'
import type { Player } from '../../lib/supabase'
import { adminGetPlayers, exportPlayersCSV } from '../../lib/api'

export default function PlayersTab() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async (q?: string) => {
    setLoading(true)
    try { setPlayers(await adminGetPlayers(q)) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    load(search.trim() || undefined)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold" style={{ color: '#B22222' }}>
          Players ({players.length})
        </h2>
        <div className="flex gap-3 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="field-light"
              style={{ width: 160 }}
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold"
              style={{ border: '1.5px solid #D4940A', color: '#B22222', background: 'transparent' }}
            >
              Search
            </button>
          </form>
          <button
            onClick={() => exportPlayersCSV(players)}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold"
            style={{ border: '1.5px solid #D4940A', color: '#B22222', background: 'rgba(212,148,10,0.08)' }}
          >
            ↓ Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#5D3A1A' }}>Loading…</p>
      ) : players.length === 0 ? (
        <p className="text-center py-12" style={{ color: '#5D3A1A', opacity: 0.5 }}>No players yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: '1.5px solid rgba(212,148,10,0.25)', background: 'rgba(255,255,255,0.7)' }}>
          <table className="w-full text-sm min-w-[600px]">
            <thead style={{ background: 'rgba(212,148,10,0.12)' }}>
              <tr>
                {['Nickname', 'Company', 'Prize Won', 'Time', 'Device ID'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold uppercase tracking-wide text-xs" style={{ color: '#5D3A1A' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id} style={{ borderTop: '1px solid rgba(44,24,16,0.07)' }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: '#2C1810' }}>{p.nickname}</td>
                  <td className="px-4 py-3" style={{ color: '#5D3A1A' }}>{p.company}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: '#D4940A' }}>{p.prize_name}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#5D3A1A', opacity: 0.7 }}>
                    {new Date(p.played_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: '#5D3A1A', opacity: 0.45 }}>
                    {p.device_id.slice(0, 8)}…
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
