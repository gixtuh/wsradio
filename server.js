/*
    WSRadio official server code
*/

const { spawn } = require('child_process');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
const fs = require('fs');
let ffmpeg;



// CONFIG
const playlist = ['song1.mp3', 'song2.mp3', 'song3.mp3', 'song4.mp3', 'song5.mp3', 'song6.mp3']; // Playlist with files in the directory
const playlistRandom = Math.floor(Math.random() * playlist.length) // NOT a config. it's doing here to define a random song index from playlist.
let currentSongIndex = playlistRandom; // Start from (0 = from the start, playlistRandom = random song from the playlist)
const mode = 'global'
const urlStart = "https://cdn.glitch.global/4453073f-02f0-437a-a9e2-cf0ac7dee63d" // Song library URL
/* supported items for const mode: 
normal - No effects, grabs sounds from local storage
global - No effects, grabs sounds from a server (urlStart combined with playlist
normal,low-quality - Low quality audio, grabs sounds from local storage
normal,low-bitrate - Low bitrate audio, grabs sounds from local storage
global,low-quality - Low quality audio, grabs sounds from a server (urlStart combined with playlist)
global,low-bitrate - Low bitrate audio, grabs sounds from a server (urlStart combined with playlist)
*/




function startFFMpeg(song) {
  let currentUrl = urlStart + '/' + song
  if (mode === "normal,low-quality") {
    ffmpeg = spawn('ffmpeg', [
      '-re',
      '-i', song,
      '-f', 'lavfi',
      '-i', 'anoisesrc=c=pink:d=0.0',
      '-filter_complex', "[0][1]amix=inputs=2:duration=shortest:weights='1 0.5'",
      '-ar', '8000',
      '-ac', '1',
      '-ab', '32k',
      '-f', 'mp3',
      '-vn',
      '-'
  ]);
  } else if (mode === 'normal,low-bitrate') {
    ffmpeg = spawn('ffmpeg', [
      '-re',
      '-i', song,
      '-f', 'mp3',
      '-ar', '8000',
      '-vn',
      '-'
    ])
  } else if (mode === "normal") {
    ffmpeg = spawn('ffmpeg', [
      '-re',
      '-i', song,
      '-f', 'mp3',
      '-vn',
      '-'
  ]);
  } else if (mode === 'global,low-quality') {
    ffmpeg = spawn('ffmpeg', [
      '-re',
      '-i', currentUrl,
      '-f', 'lavfi',
      '-i', 'anoisesrc=c=pink:d=0.0',
      '-filter_complex', "[0][1]amix=inputs=2:duration=shortest:weights='1 0.5'",
      '-ar', '8000',
      '-ac', '1',
      '-ab', '32k',
      '-f', 'mp3',
      '-vn',
      '-'
  ]);
  } else if (mode === 'global,low-bitrate') {
    ffmpeg = spawn('ffmpeg', [
      '-re',
      '-i', currentUrl,
      '-f', 'mp3',
      '-ar', '8000',
      '-vn',
      '-'
  ]);
  } else if (mode === 'global') {
    ffmpeg = spawn('ffmpeg', [
      '-re',
      '-i', currentUrl,
      '-f', 'mp3',
      '-vn',
      '-'
  ]);
  } else {
    throw 'Mode is not recognized.'
  }

  ffmpeg.on('exit', (code, signal) => {
    if (code === 0) {
      console.log(`${song} finish`);
      nextSong();
    } else {
      console.log(`${song}/FFmpeg error: ${code}, sig: ${signal}.`);
    }
  });

  ffmpeg.stdout.on('data', (chunk) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(chunk);
      }
    });
  });

  ffmpeg.stderr.on('data', (data) => {
    console.log(`${data}`);
  });
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % playlist.length;
  const nextSong = playlist[currentSongIndex];
  console.log(nextSong);
  startFFMpeg(nextSong);
}

startFFMpeg(playlist[currentSongIndex]);

wss.on('connection', (ws) => {
  console.log('client connected');
  ws.on('close', () => {
      console.log('client closed')
  })
});