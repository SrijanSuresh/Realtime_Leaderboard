import { createClient } from "redis";

// Singleton Redis client
let client = null;

// Connection function with error handling
async function getClient() {
  if (!client) {
    try {
      client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      
      // Listen for connection errors
      client.on('error', (err) => {
        console.error('Redis connection error:', err);
        client = null; // Reset client on error
      });
      
      console.log('Connecting to Redis...');
      await client.connect();
      console.log('Redis connected successfully');
    } catch (err) {
      console.error('Failed to connect to Redis:', err);
      client = null; // Reset on connection failure
      throw new Error(`Redis connection failed: ${err.message}`);
    }
  }
  return client;
}

// GET - Fetch the leaderboard
export async function GET() {
  try {
    const redis = await getClient();
    
    // Get top scores in descending order (highest first)
    const leaderboard = await redis.zRangeWithScores("leaderboard", 0, -1, { REV: true });
    
    console.log("Fetched leaderboard:", leaderboard);
    return Response.json(leaderboard || []);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return Response.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}

// POST - Add a new player score
export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { name, score } = body;
    
    // Validate input
    if (!name || score === undefined) {
      return Response.json(
        { error: "Name and score are required" },
        { status: 400 }
      );
    }
    
    console.log(`Adding player ${name} with score ${score}`);
    
    // Get Redis client and add score
    const redis = await getClient();
    const result = await redis.zAdd("leaderboard", [{ 
      score: Number(score), 
      value: String(name) 
    }]);
    
    console.log(`Added to leaderboard, result: ${result}`);
    
    // Get updated leaderboard
    const updatedLeaderboard = await redis.zRangeWithScores("leaderboard", 0, -1, { REV: true });
    
    return Response.json({ 
      success: true,
      added: { name, score },
      leaderboard: updatedLeaderboard
    });
  } catch (error) {
    console.error("Error adding player:", error);
    return Response.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}

// DELETE - Clear the leaderboard
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    
    // Only process with clear=true parameter
    if (url.searchParams.get('clear') === 'true') {
      const redis = await getClient();
      await redis.del("leaderboard");
      console.log("Leaderboard cleared");
      return Response.json({ success: true });
    } else {
      return Response.json(
        { error: "Invalid delete request. Use ?clear=true to clear the leaderboard" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error clearing leaderboard:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}