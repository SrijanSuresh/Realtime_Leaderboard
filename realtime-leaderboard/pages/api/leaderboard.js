import { createClient } from "redis";

const client = createClient();
await client.connect();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, score } = req.body;
    await client.zAdd("leaderboard", [{ score: Number(score), value: name }]);
    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    const data = await client.zRangeWithScores("leaderboard", 0, -1, { REV: true });
    console.log("Current leaderboard from Redis:");
    data.forEach((entry, idx) => {
      console.log(`${idx + 1}. ${entry.value} - ${entry.score}`);
    });
    return res.status(200).json(data);
  }

  if (req.method === "DELETE" && req.query.clear === 'true') {
    await client.del("leaderboard");
    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
