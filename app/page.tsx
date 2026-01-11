'use client'

import { useEffect, useState } from 'react'
import { Bettor, Bet } from '@/lib/db-types'
import { BetResult } from '@/lib/types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type BettorWithBets = Bettor & {
  bets: Bet[]
}

export default function Home() {
  const [bettors, setBettors] = useState<Bettor[]>([])
  const [selectedBettorId, setSelectedBettorId] = useState<string | null>(null)
  const [bettor, setBettor] = useState<BettorWithBets | null>(null)
  const [showAddBettorModal, setShowAddBettorModal] = useState(false)
  const [showAddBetModal, setShowAddBetModal] = useState(false)
  const [resultFilter, setResultFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchBettors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedBettorId) {
      fetchBettor(selectedBettorId)
    } else {
      setBettor(null)
    }
  }, [selectedBettorId])

  const fetchBettors = async () => {
    const res = await fetch('/api/bettors')
    const data = await res.json()
    setBettors(data)
    if (data.length > 0 && !selectedBettorId) {
      setSelectedBettorId(data[0].id)
    }
  }

  const fetchBettor = async (id: string) => {
    const res = await fetch(`/api/bettors/${id}`)
    const data = await res.json()
    setBettor(data)
  }

  const handleAddBettor = async (name: string, profileUrl: string) => {
    try {
      const res = await fetch('/api/bettors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, profileUrl }),
      })
      if (res.ok) {
        await fetchBettors()
        setShowAddBettorModal(false)
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Failed to create bettor' }))
        console.error('Error creating bettor:', errorData)
        alert(`Error: ${errorData.error || 'Failed to create bettor'}`)
      }
    } catch (error) {
      console.error('Error creating bettor:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to create bettor'}`)
    }
  }

  const handleAddBet = async (betData: any) => {
    if (!selectedBettorId) return
    const res = await fetch(`/api/bettors/${selectedBettorId}/bets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(betData),
    })
    if (res.ok) {
      await fetchBettor(selectedBettorId)
      setShowAddBetModal(false)
    }
  }

  const handleUpdateBet = async (betId: string, updates: any) => {
    const res = await fetch(`/api/bets/${betId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      await fetchBettor(selectedBettorId!)
    }
  }

  const handleDeleteBet = async (betId: string) => {
    if (!confirm('Are you sure you want to delete this bet?')) return
    const res = await fetch(`/api/bets/${betId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      await fetchBettor(selectedBettorId!)
    }
  }

  const filteredBets = bettor?.bets.filter((bet: Bet) => {
    if (resultFilter === 'ALL') return true
    if (resultFilter === 'GRADED') return bet.result !== 'PENDING'
    return bet.result === resultFilter
  }) || []

  // Calculate summary stats (excluding PENDING bets)
  const gradedBets = bettor?.bets.filter((b: Bet) => b.result !== 'PENDING') || []
  const unitsWon = gradedBets.reduce((sum: number, bet: Bet) => sum + bet.profitUnits, 0)
  const totalStake = gradedBets.reduce((sum: number, bet: Bet) => sum + bet.stakeUnits, 0)
  const roi = totalStake > 0 ? (unitsWon / totalStake) * 100 : 0
  const wins = gradedBets.filter((b: Bet) => b.result === 'WIN').length
  const losses = gradedBets.filter((b: Bet) => b.result === 'LOSS').length
  const pushes = gradedBets.filter((b: Bet) => b.result === 'PUSH').length
  const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0

  // Calculate grade
  let grade = 'N/A'
  if (gradedBets.length > 0) {
    if (roi >= 10) grade = 'A'
    else if (roi >= 5) grade = 'B'
    else if (roi >= 0) grade = 'C'
    else if (roi >= -5) grade = 'D'
    else grade = 'F'
  }

  // Prepare chart data (cumulative profit over time)
  const sortedBetsForChart = [...(bettor?.bets || [])].sort(
    (a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime()
  )
  let cumulative = 0
  const chartData = sortedBetsForChart.map((bet: Bet) => {
    if (bet.result !== 'PENDING') {
      cumulative += bet.profitUnits
    }
    return {
      date: new Date(bet.placedAt).toLocaleDateString(),
      cumulative,
      placedAt: bet.placedAt,
    }
  })

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Basic Bettor</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <button
            onClick={() => setShowAddBettorModal(true)}
            className="w-full mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
          >
            + Add Bettor
          </button>
          <div className="space-y-1">
            {bettors.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBettorId(b.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  selectedBettorId === b.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 overflow-y-auto">
        {bettor ? (
          <div className="p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{bettor.name}</h1>
                <a
                  href={bettor.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Profile →
                </a>
              </div>
              <button
                onClick={() => setShowAddBetModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
              >
                + Add Bet
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <SummaryCard
                title="Units Won"
                value={unitsWon.toFixed(2)}
                color={unitsWon >= 0 ? 'text-green-600' : 'text-red-600'}
              />
              <SummaryCard
                title="ROI %"
                value={`${roi.toFixed(2)}%`}
                color={roi >= 0 ? 'text-green-600' : 'text-red-600'}
              />
              <SummaryCard
                title="Record"
                value={`${wins}-${losses}${pushes > 0 ? `-${pushes}` : ''}`}
              />
              <SummaryCard
                title="Win Rate %"
                value={`${winRate.toFixed(1)}%`}
              />
              <SummaryCard
                title="Grade"
                value={grade}
                subtitle={`${roi.toFixed(2)}% ROI`}
                color={
                  grade === 'A'
                    ? 'text-green-600'
                    : grade === 'B'
                    ? 'text-blue-600'
                    : grade === 'C'
                    ? 'text-yellow-600'
                    : grade === 'D'
                    ? 'text-orange-600'
                    : 'text-red-600'
                }
              />
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Cumulative Units Over Time</h2>
                <CumulativeChart data={chartData} />
              </div>
            )}

            {/* Bets Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">Bets</h2>
                <select
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="ALL">All Bets</option>
                  <option value="GRADED">Graded</option>
                  <option value="PENDING">Pending</option>
                  <option value="WIN">Win</option>
                  <option value="LOSS">Loss</option>
                  <option value="PUSH">Push</option>
                </select>
              </div>
              <BetsTable
                bets={filteredBets}
                onUpdate={handleUpdateBet}
                onDelete={handleDeleteBet}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {bettors.length === 0
              ? 'Add a bettor to get started'
              : 'Select a bettor from the sidebar'}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddBettorModal && (
        <AddBettorModal
          onClose={() => setShowAddBettorModal(false)}
          onSave={handleAddBettor}
        />
      )}
      {showAddBetModal && (
        <AddBetModal
          onClose={() => setShowAddBetModal(false)}
          onSave={handleAddBet}
        />
      )}
    </div>
  )
}

function SummaryCard({
  title,
  value,
  subtitle,
  color = 'text-gray-900',
}: {
  title: string
  value: string
  subtitle?: string
  color?: string
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  )
}

function CumulativeChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function BetsTable({
  bets,
  onUpdate,
  onDelete,
}: {
  bets: Bet[]
  onUpdate: (id: string, updates: any) => void
  onDelete: (id: string) => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>(null)

  const handleEdit = (bet: Bet) => {
    setEditingId(bet.id)
    setEditForm({
      result: bet.result,
      description: bet.description,
      oddsAmerican: bet.oddsAmerican,
      stakeUnits: bet.stakeUnits,
      notes: bet.notes || '',
    })
  }

  const handleSave = () => {
    if (editingId && editForm) {
      onUpdate(editingId, editForm)
      setEditingId(null)
      setEditForm(null)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`
  }

  const getResultColor = (result: BetResult) => {
    switch (result) {
      case 'WIN':
        return 'text-green-600 bg-green-50'
      case 'LOSS':
        return 'text-red-600 bg-red-50'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50'
      case 'PUSH':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (bets.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">No bets found</div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Bet
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Odds
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Stake
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Result
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Profit
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Notes
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {bets.map((bet) => (
            <tr key={bet.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">
                {new Date(bet.placedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-sm font-medium">{bet.description}</td>
              <td className="px-4 py-3 text-sm">{formatOdds(bet.oddsAmerican)}</td>
              <td className="px-4 py-3 text-sm">{bet.stakeUnits.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm">
                {editingId === bet.id ? (
                  <select
                    value={editForm.result}
                    onChange={(e) =>
                      setEditForm({ ...editForm, result: e.target.value })
                    }
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="WIN">Win</option>
                    <option value="LOSS">Loss</option>
                    <option value="PUSH">Push</option>
                    <option value="VOID">Void</option>
                  </select>
                ) : (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getResultColor(
                      bet.result as BetResult
                    )}`}
                  >
                    {bet.result}
                  </span>
                )}
              </td>
              <td
                className={`px-4 py-3 text-sm font-medium ${
                  bet.profitUnits >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {bet.profitUnits >= 0 ? '+' : ''}
                {bet.profitUnits.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {editingId === bet.id ? (
                  <input
                    type="text"
                    value={editForm.notes}
                    onChange={(e) =>
                      setEditForm({ ...editForm, notes: e.target.value })
                    }
                    className="px-2 py-1 border rounded text-sm w-full"
                    placeholder="Notes..."
                  />
                ) : (
                  bet.notes || '-'
                )}
              </td>
              <td className="px-4 py-3 text-sm">
                {editingId === bet.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-gray-600 hover:underline text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(bet)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(bet.id)}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AddBettorModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (name: string, profileUrl: string) => void
}) {
  const [name, setName] = useState('')
  const [profileUrl, setProfileUrl] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    if (!name.trim()) {
      setError('Name is required')
      setIsSubmitting(false)
      return
    }

    if (!profileUrl.trim()) {
      setError('Profile URL is required')
      setIsSubmitting(false)
      return
    }

    try {
      new URL(profileUrl.trim())
      try {
        await onSave(name.trim(), profileUrl.trim())
        // Success - modal will close automatically
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : 'Failed to save bettor')
        setIsSubmitting(false)
      }
    } catch (urlError) {
      setError('Please enter a valid URL (e.g., https://example.com)')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Bettor</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Profile URL *</label>
            <input
              type="url"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="https://..."
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddBetModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (betData: any) => void
}) {
  const [formData, setFormData] = useState({
    placedAt: new Date().toISOString().slice(0, 16),
    description: '',
    sport: '',
    oddsAmerican: -110,
    stakeUnits: 1,
    result: 'PENDING',
    notes: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.description.trim()) {
      setError('Description is required')
      return
    }

    const betData = {
      ...formData,
      placedAt: new Date(formData.placedAt).toISOString(),
      oddsAmerican: parseInt(formData.oddsAmerican.toString()),
      stakeUnits: parseFloat(formData.stakeUnits.toString()),
      sport: formData.sport || undefined,
      notes: formData.notes || undefined,
    }

    onSave(betData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add Bet</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Date & Time *</label>
            <input
              type="datetime-local"
              value={formData.placedAt}
              onChange={(e) =>
                setFormData({ ...formData, placedAt: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description *</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., Lakers ML, Over 214.5"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Sport</label>
            <input
              type="text"
              value={formData.sport}
              onChange={(e) =>
                setFormData({ ...formData, sport: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., NBA, NFL"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Odds (American) *</label>
            <input
              type="number"
              value={formData.oddsAmerican}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  oddsAmerican: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border rounded"
              placeholder="-110, +150"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Stake (Units) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.stakeUnits}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stakeUnits: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border rounded"
              min="0.01"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Result *</label>
            <select
              value={formData.result}
              onChange={(e) =>
                setFormData({ ...formData, result: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
            >
              <option value="PENDING">Pending</option>
              <option value="WIN">Win</option>
              <option value="LOSS">Loss</option>
              <option value="PUSH">Push</option>
              <option value="VOID">Void</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              rows={3}
              placeholder="Optional notes..."
            />
          </div>
          {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
