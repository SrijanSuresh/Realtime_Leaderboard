'use client'
import { useState, useEffect } from 'react'

export default function Leaderboard() {
  const [playerName, setPlayerName] = useState('')
  const [playerScore, setPlayerScore] = useState('')
  const [localPlayers, setLocalPlayers] = useState([])
  const [leaderboardData, setLeaderboardData] = useState([])

  const fetchLeaderboard = async () => {
    const res = await fetch('/api/leaderboard')
    const data = await res.json()
    setLeaderboardData(data)
  }

  const handleAddPlayer = async () => {
    if (!playerName || !playerScore || localPlayers.length >= 10) return

    const newPlayer = { name: playerName, score: Number(playerScore) }

    await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlayer),
    })

    setLocalPlayers([...localPlayers, newPlayer])
    setPlayerName('')
    setPlayerScore('')
    fetchLeaderboard()
  }

  const handleRemovePlayer = (index) => {
    const updated = [...localPlayers]
    updated.splice(index, 1)
    setLocalPlayers(updated)
  }

  const handleClearAll = async () => {
    setLocalPlayers([])
    await fetch('/api/leaderboard?clear=true', { method: 'DELETE' })
    fetchLeaderboard()
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">🏆 Real-time Leaderboard</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          name="playerName"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Player Name"
          className="w-1/2 p-2 rounded bg-gray-800 text-white placeholder-gray-400"
        />
        <input
          type="number"
          name="playerScore"
          value={playerScore}
          onChange={(e) => setPlayerScore(e.target.value)}
          placeholder="Score"
          className="w-1/3 p-2 rounded bg-gray-800 text-white placeholder-gray-400"
        />
        <button
          onClick={handleAddPlayer}
          disabled={localPlayers.length >= 10}
          className={`px-4 py-2 rounded ${
            localPlayers.length >= 10 ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Add
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-sm text-gray-400 mb-1">🧍 Added Players ({localPlayers.length}/10):</h3>
        <ul className="text-sm space-y-1">
          {localPlayers.map((player, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-gray-800 p-2 rounded"
            >
              <span>{player.name} — {player.score}</span>
              <button
                onClick={() => handleRemovePlayer(index)}
                className="text-red-400 hover:underline text-xs"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleClearAll}
        className="bg-red-600 hover:bg-red-700 w-full py-2 rounded mb-4"
      >
        Clear All
      </button>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2 text-center">🌐 Leaderboard</h3>
        <ul className="space-y-2">
          {leaderboardData.map((player, index) => (
            <li
              key={index}
              className="bg-gray-800 p-2 rounded flex justify-between"
            >
              <span>{player.value}</span>
              <span>{player.score}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
