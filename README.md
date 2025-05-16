# Realtime_Leaderboard
My practice project for demonstrating skillset in redis, node and next js

## Project Status

So far, the initial project setup has been completed. No additional features or functionality have been implemented yet.

## Project Overview

This project utilizes Redis, running via Docker, to implement a real-time leaderboard. Redis sets are used to achieve operations in O(log n) time complexity, ensuring efficient updates and retrievals for the leaderboard data. The frontend is built using Next.js, providing a seamless user experience for displaying the leaderboard in real-time.

## How to Access and Run the Project

### Prerequisites

- Docker installed on your machine
- Node.js and npm installed

### Steps to Run the Project

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/Realtime_Leaderboard.git
   cd Realtime_Leaderboard
   ```

2. **Start Redis with Docker**
   - use define REDIS_URL=redis://localhost:6379 in local environment
   ```bash
   docker run --name any_name_you_want -p 6379:6379 -d redis
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Run the Frontend**

   ```bash
   npm run dev
   ```

5. **Access the Application**

   Open your browser and navigate to `http://localhost:3000` to view the real-time leaderboard.

---

*This README will be updated as development progresses.*
