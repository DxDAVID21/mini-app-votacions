const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const VOTOS_FILE = path.join(__dirname, 'votos.json');

const wss = new WebSocket.Server({ port: PORT });

function ensureVotesFile() {
  try {
    if (!fs.existsSync(VOTOS_FILE)) {
      fs.writeFileSync(VOTOS_FILE, JSON.stringify([0, 0, 0, 0]));
    }
  } catch (err) {
    // ignore
  }
}

function readVotes() {
  ensureVotesFile();
  try {
    const data = fs.readFileSync(VOTOS_FILE, 'utf8');
    const votes = JSON.parse(data);
    if (Array.isArray(votes) && votes.length === 4) {
      return votes;
    }
  } catch (err) {
    // ignore
  }
  const initial = [0, 0, 0, 0];
  try {
    fs.writeFileSync(VOTOS_FILE, JSON.stringify(initial));
  } catch (err) {
    // ignore
  }
  return initial;
}

function writeVotes(votes) {
  try {
    fs.writeFileSync(VOTOS_FILE, JSON.stringify(votes));
  } catch (err) {
    // ignore
  }
}

let votes = readVotes();

function broadcastVotes() {
  const message = JSON.stringify(votes);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  // Send current votes array directly on connection
  ws.send(JSON.stringify(votes));

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message.toString());
      let idx = -1;

      if (typeof msg.vote === 'number') {
        idx = msg.vote;
      } else if (typeof msg.option === 'number') {
        idx = msg.option;
      } else if (typeof msg.index === 'number') {
        idx = msg.index;
      }

      if (idx >= 0 && idx < 4) {
        votes[idx] = (votes[idx] || 0) + 1;
        writeVotes(votes);
        broadcastVotes();
      }
    } catch (err) {
      // ignore malformed messages
    }
  });
});

console.log(`WebSocket server running on port ${PORT}`);
