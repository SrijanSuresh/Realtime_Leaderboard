"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trophy, Trash2, Zap, Users, Crown, Medal, Shield, Star, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Function to generate random players
const generateRandomPlayers = (capacity) => {
  return Array.from({ length: capacity }, (_, i) => ({
    name: `Player#${i + 1}`,
    score: Math.floor(Math.random() * 10000) / 100,
  }))
}

export default function LeaderboardPage() {
  const [showCapacityDialog, setShowCapacityDialog] = useState(true)
  const [capacity, setCapacity] = useState(10)
  const [entryMode, setEntryMode] = useState("manual")
  const [players, setPlayers] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Fetch leaderboard with capacity param
  const fetcher = (...args) => fetch(...args).then((res) => res.json())
  const { data, mutate, isLoading } = useSWR(`/api/leaderboard?capacity=${capacity}`, fetcher, {
    refreshInterval: 5000,
  })

  // Initialize players array when capacity changes
  useEffect(() => {
    if (entryMode === "manual") {
      setPlayers(Array(capacity).fill({ name: "", score: "" }))
    } else {
      setPlayers(generateRandomPlayers(capacity))
    }
  }, [capacity, entryMode])

  // Update player input fields
  const handlePlayerChange = (idx, field, value) => {
    setPlayers((prev) => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], [field]: value }
      return updated
    })
  }

  // Submit all players at once
  const submitAll = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const validPlayers = players.filter((p) => entryMode === "auto" || (p.name && p.score !== ""))

      for (const p of validPlayers) {
        await fetch("/api/leaderboard", {
          method: "POST",
          body: JSON.stringify({
            name: p.name,
            score: typeof p.score === "string" ? Number.parseFloat(p.score) : p.score,
          }),
        })
      }

      await mutate()

      if (entryMode === "manual") {
        setPlayers(Array(capacity).fill({ name: "", score: "" }))
      }
    } catch (error) {
      console.error("Error submitting players:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const removePlayer = async (name) => {
    await fetch("/api/leaderboard", {
      method: "DELETE",
      body: JSON.stringify({ name }),
    })
    mutate()
  }

  const clearAll = async () => {
    setIsClearing(true)
    try {
      await fetch("/api/leaderboard", {
        method: "DELETE",
        body: JSON.stringify({ clearAll: true }),
      })
      await mutate()
    } finally {
      setIsClearing(false)
    }
  }

  const generateAndSubmitRandom = async () => {
    setIsGenerating(true)
    try {
      const randomPlayers = generateRandomPlayers(capacity)
      setPlayers(randomPlayers)

      // Submit after a brief delay to show the generated players
      setTimeout(async () => {
        for (const p of randomPlayers) {
          await fetch("/api/leaderboard", {
            method: "POST",
            body: JSON.stringify({ name: p.name, score: p.score }),
          })
        }
        await mutate()
        setIsGenerating(false)
      }, 500)
    } catch (error) {
      console.error("Error generating random players:", error)
      setIsGenerating(false)
    }
  }

  // Get rank icon based on position
  const getRankIcon = (position) => {
    switch (position) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-400" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-300" />
      case 2:
        return <Shield className="h-5 w-5 text-amber-600" />
      default:
        return <Star className="h-5 w-5 text-blue-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 md:p-8">
      {/* Capacity Selection Dialog */}
      <Dialog open={showCapacityDialog} onOpenChange={setShowCapacityDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">LEADERBOARD SETUP</DialogTitle>
            <DialogDescription className="text-gray-300 text-center">
              Choose your preferred leaderboard capacity
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Capacity: {capacity}</span>
              <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-700">
                {capacity} Players
              </Badge>
            </div>

            <Slider
              defaultValue={[10]}
              max={50}
              min={1}
              step={1}
              value={[capacity]}
              onValueChange={(value) => setCapacity(value[0])}
              className="[&>span:first-child]:h-2 [&>span:first-child]:bg-blue-900"
            />

            <div className="flex gap-2 mt-2">
              {[5, 10, 20, 30].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  size="sm"
                  onClick={() => setCapacity(num)}
                  className={cn(
                    "flex-1 border-gray-700 bg-gray-800 hover:bg-gray-700",
                    capacity === num && "bg-blue-900 border-blue-700 hover:bg-blue-800",
                  )}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowCapacityDialog(false)}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white border-0"
            >
              CONFIRM
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold tracking-tight">COMBAT LEADERBOARD</h1>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCapacityDialog(true)}
              className="border-gray-700 bg-gray-800 hover:bg-gray-700"
            >
              <Users className="h-4 w-4 mr-2" />
              {capacity}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={clearAll}
              disabled={isClearing}
              className="bg-red-900 hover:bg-red-800 text-white border-0"
            >
              {isClearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Entry Form */}
          <div className="md:col-span-1">
            <Card className="bg-gray-800 border-gray-700 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-700 pb-4">
                <CardTitle className="text-xl font-bold">PLAYER ENTRY</CardTitle>
                <CardDescription className="text-gray-400">Add players to the leaderboard</CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <Tabs defaultValue="manual" value={entryMode} onValueChange={(v) => setEntryMode(v)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-900">
                    <TabsTrigger value="manual" className="data-[state=active]:bg-blue-900">
                      Manual
                    </TabsTrigger>
                    <TabsTrigger value="auto" className="data-[state=active]:bg-blue-900">
                      Auto
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual" className="mt-4">
                    <form onSubmit={submitAll} className="space-y-3">
                      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                        {players.map((p, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <Badge className="min-w-[24px] h-6 flex items-center justify-center bg-gray-700">
                              {idx + 1}
                            </Badge>
                            <Input
                              type="text"
                              placeholder="Player name"
                              value={p.name}
                              onChange={(e) => handlePlayerChange(idx, "name", e.target.value)}
                              className="flex-1 bg-gray-900 border-gray-700"
                            />
                            <Input
                              type="number"
                              placeholder="Score"
                              value={p.score}
                              onChange={(e) => handlePlayerChange(idx, "score", e.target.value)}
                              className="w-24 bg-gray-900 border-gray-700"
                            />
                          </div>
                        ))}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border-0"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4 mr-2" />
                        )}
                        SUBMIT ALL
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="auto" className="mt-4">
                    <div className="space-y-4">
                      <div className="bg-gray-900 p-3 rounded-md border border-gray-700">
                        <p className="text-sm text-gray-300 mb-2">Generate {capacity} random players with scores</p>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>Format:</span>
                            <code className="bg-gray-800 px-1 rounded">Player#1</code>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>Scores:</span>
                            <code className="bg-gray-800 px-1 rounded">0-100</code>
                          </div>
                        </div>
                        <Button
                          onClick={generateAndSubmitRandom}
                          className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 border-0"
                          disabled={isGenerating}
                        >
                          {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                          )}
                          GENERATE & SUBMIT
                        </Button>
                      </div>

                      {players.length > 0 && (
                        <div className="max-h-[250px] overflow-y-auto pr-2">
                          {players.map((player, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center py-1 px-2 text-sm border-b border-gray-700"
                            >
                              <div>{player.name}</div>
                              <div className="font-mono">{player.score}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div className="md:col-span-2">
            <Card className="bg-gray-800 border-gray-700 overflow-hidden h-full">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-700 pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold">TOP {capacity} PLAYERS</CardTitle>
                  <Badge className="bg-blue-900 text-blue-100">
                    {data?.length || 0}/{capacity}
                  </Badge>
                </div>
                <CardDescription className="text-gray-400">Ranked by highest score</CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : Array.isArray(data) && data.length > 0 ? (
                  <div className="divide-y divide-gray-700">
                    {data.map((player, index) => (
                      <div
                        key={player.name}
                        className={cn(
                          "flex items-center justify-between p-4 transition-colors",
                          index === 0
                            ? "bg-gradient-to-r from-yellow-900/20 to-transparent"
                            : index === 1
                              ? "bg-gradient-to-r from-gray-500/10 to-transparent"
                              : index === 2
                                ? "bg-gradient-to-r from-amber-800/10 to-transparent"
                                : index % 2 === 0
                                  ? "bg-gray-800"
                                  : "bg-gray-750",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8">{getRankIcon(index)}</div>
                          <div className="font-medium text-lg">{player.name}</div>
                          {index < 3 && (
                            <Badge
                              className={cn(
                                "ml-2",
                                index === 0
                                  ? "bg-yellow-900/50 text-yellow-300 border-yellow-700"
                                  : index === 1
                                    ? "bg-gray-700/50 text-gray-300 border-gray-600"
                                    : "bg-amber-900/50 text-amber-300 border-amber-700",
                              )}
                            >
                              {index === 0 ? "GOLD" : index === 1 ? "SILVER" : "BRONZE"}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-mono font-semibold">
                            {typeof player.score === "number" ? player.score.toFixed(2) : player.score}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePlayer(player.name)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Trophy className="h-12 w-12 mb-4 text-gray-600" />
                    <p className="text-lg">No players on the leaderboard yet.</p>
                    <p className="text-sm">Add players to see them ranked here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
