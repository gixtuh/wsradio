const { spawn } = require("child_process");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

const wss = new WebSocket.Server({ port: 8080 });

let ffmpeg;
let settings = loadSettings();

let currentIndex = 0;
let songKeys = [];
let currentMeta = null;
let playbackTimer = null;

function loadSettings() {
  const raw = fs.readFileSync("./settings.json", "utf-8");
  return JSON.parse(raw);
}

function rebuildPlaylist() {
  settings = loadSettings();
  
  songKeys = Object.keys(settings.use);
  
  if (settings.chooserandom) {
    currentIndex = Math.floor(Math.random() * songKeys.length);
  } else {
    currentIndex = 0;
  }
}

let shuffledQueue = [];

function rebuildShuffle() {
  songKeys = Object.keys(settings.use);
  
  shuffledQueue = [...songKeys];
  
  for (let i = shuffledQueue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledQueue[i], shuffledQueue[j]] = [shuffledQueue[j], shuffledQueue[i]];
  }
}

function getNextSongKey() {
  if (settings.chooserandom) {
    if (shuffledQueue.length === 0) {
      rebuildShuffle();
    }
    return shuffledQueue.shift();
  }
  
  const next = songKeys[currentIndex];
  currentIndex = (currentIndex + 1) % songKeys.length;
  return next;
}

function resolveInput(file) {
  if (settings.grabFrom === "local") {
    return path.join(__dirname, "songs", file);
  }
  
  if (settings.grabFrom === "global") {
    return `${settings.globalPlaylistDB}/${file}`;
  }
  
  throw new Error("grabFrom must be 'local' or 'global'");
}

function getMeta(fileKey) {
  return settings.use[fileKey] || {
    title: fileKey,
    author: "Unknown",
    icon: ""
  };
}
const { spawnSync } = require("child_process");

function getDuration(file) {
  const result = spawnSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    file
  ], {
    encoding: "utf8"
  });
  
  return parseFloat(result.stdout) || 0;
}

function startFFmpeg(songKey) {
  const file = resolveInput(songKey);
  const meta = getMeta(songKey);
  const duration = getDuration(file);
  
  console.log(`now playing: ${meta.title} (${meta.author})`);
  
  currentMeta = {
    title: meta.title,
    author: meta.author,
    icon: meta.icon,
    duration
  };
  
  ffmpeg = spawn("ffmpeg", [
    "-re",
    "-i", file,
    "-f", "mp3",
    "-vn",
    ...parseExtraFFmpeg(settings.addFFmpegOptions),
    "-"
  ]);
  
  const startTime = Date.now();
  
  broadcastJSON({
    type: "meta",
    information: currentMeta
  });
  
  broadcastJSON({
    type: "time",
    currentTime: (Date.now() - startTime) / 1000
  });
  
  playbackTimer = setInterval(() => {
    
    broadcastJSON({
      type: "time",
      currentTime: (Date.now() - startTime) / 1000
    });
    
  }, 1000);
  
  
  ffmpeg.stdout.on("data", (chunk) => {
    broadcastBinary(chunk);
  });
  
  ffmpeg.stderr.on("data", (d) => {
    console.log(d.toString());
  });
  
  ffmpeg.on("close", () => {
    
    setTimeout(() => {
      clearInterval(playbackTimer);
      
      nextSong();
    }, 1000)
    
  });
}

function parseExtraFFmpeg(str) {
  if (!str || typeof str !== "string") return [];
  return str.split(" ").filter(Boolean);
}

function broadcastJSON(data) {
  const payload = JSON.stringify(data);
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function broadcastBinary(buffer) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(buffer, { binary: true });
    }
  });
}

function nextSong() {
  settings = loadSettings();
  songKeys = Object.keys(settings.use);
  
  if (settings.chooserandom) {
    if (shuffledQueue.length === 0) {
      rebuildShuffle();
    }
  } else {
    currentIndex = currentIndex % songKeys.length;
  }
  
  const nextKey = getNextSongKey();
  startFFmpeg(nextKey);
}

settings = loadSettings();
songKeys = Object.keys(settings.use);

if (settings.chooserandom) {
  rebuildShuffle();
} else {
  currentIndex = 0;
}

const firstKey = getNextSongKey();
startFFmpeg(firstKey);

wss.on("connection", (ws) => {
  console.log("client connected");
  
  if (currentMeta) {
    ws.send(JSON.stringify({
      type: "meta",
      information: currentMeta
    }));
  }
  
  ws.on("close", () => {
    console.log("client disconnected");
  });
});