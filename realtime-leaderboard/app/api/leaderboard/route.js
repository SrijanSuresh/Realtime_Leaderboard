import { createClient } from 'redis'

// Create a Redis client with configuration that works with Docker
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

redis.on('error', err => console.log('Redis Client Error', err))

// Connect to Redis only when needed
let connected = false
async function getRedisClient() {
  if (!connected) {
    await redis.connect()
    connected = true
  }
  return redis
}

export async function GET(request) {
  try {
    const client = await getRedisClient()
    // Get capacity from query params, default to 10
    let capacity = 10
    if (request && request.nextUrl) {
      const url = new URL(request.nextUrl)
      const capParam = url.searchParams.get('capacity')
      if (capParam && !isNaN(parseInt(capParam))) {
        capacity = parseInt(capParam)
      }
    }
    // Using zRangeWithScores which is the updated API method
    // Note: We use REV and specify the range from highest to lowest score
    const leaderboard = await client.zRange('leaderboard', 0, capacity - 1, {
      REV: true,
      WITHSCORES: true
    })
    // Format the results
    const formattedLeaderboard = []
    for (let i = 0; i < leaderboard.length; i += 2) {
      formattedLeaderboard.push({
        name: leaderboard[i],
        score: parseFloat(leaderboard[i + 1])
      })
    }
    return Response.json(formattedLeaderboard)
  } catch (error) {
    console.error('GET Error:', error)
    return Response.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { name, score } = await request.json()
    
    if (!name || typeof score !== 'number') {
      return Response.json(
        { error: 'Invalid player data' },
        { status: 400 }
      )
    }

    const client = await getRedisClient()
    await client.zAdd('leaderboard', {
      value: name,
      score: score
    })
    return Response.json({ success: true })
  } catch (error) {
    console.error('POST Error:', error)
    return Response.json(
      { error: 'Failed to add player' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const { name, clearAll } = await request.json()
    const client = await getRedisClient()

    if (clearAll) {
      await client.del('leaderboard')
    } else if (name) {
      await client.zRem('leaderboard', name)
    }
    return Response.json({ success: true })
  } catch (error) {
    console.error('DELETE Error:', error)
    return Response.json(
      { error: 'Failed to remove player(s)' },
      { status: 500 }
    )
  }
}
