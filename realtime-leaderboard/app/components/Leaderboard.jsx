'use client'
import useSWR from 'swr'
import { useState } from 'react'

const Leaderboard = () => {
  const [name, setName] = useState('')
  const [score, setScore] = useState('')
  
  const fetcher = (...args) => fetch(...args).then(res => res.json())
  const { data, mutate, isLoading } = useSWR('/api/leaderboard', fetcher, {
    refreshInterval: 1000
  })

  const addPlayer = async (e) => {
    e.preventDefault()
    if (!name || !score) return
    
    await fetch('/api/leaderboard', {
      method: 'POST',
      body: JSON.stringify({ name, score: parseFloat(score) })
    })
    setName('')
    setScore('')
    mutate()
  }

  const removePlayer = async (name) => {
    await fetch('/api/leaderboard', {
      method: 'DELETE',
      body: JSON.stringify({ name })
    })
    mutate()
  }

  const clearAll = async () => {
    await fetch('/api/leaderboard', {
      method: 'DELETE',
      body: JSON.stringify({ clearAll: true })
    })
    mutate()
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Realtime Leaderboard</h1>
      
      <form onSubmit={addPlayer} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Player name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Score"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="w-24 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Player
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear All
        </button>
      </form>

      <div className="border rounded overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : (
          data?.map((player, index) => (
            <div
              key={player.name}
              className="flex items-center justify-between p-3 even:bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex items-center gap-4">
                <span className="font-bold w-6">{index + 1}.</span>
                <span className="font-medium">{player.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">{player.score}</span>
                <button
                  onClick={() => removePlayer(player.name)}
                  className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Leaderboard