/*
    WSRadio official server code
*/

const { spawn } = require('child_process');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
const fs = require('fs');
let ffmpeg;



// CONFIG
const playlist = ['song1.mp3', 'song2.mp3', 'song3.mp3', 'song4.mp3']; // Playlist with files in the directory
const playlistRandom = Math.floor(Math.random() * playlist.length) // NOT a config. it's doing here to define a random song index from playlist.
let currentSongIndex = playlistRandom; // Start from (0 = from the start, playlistRandom = random song from the playlist)
const lowQuality = false // In case of too much cpu load or if the file is being interpreted glitchy. Or uncomment the 39th line.




function startFFMpeg(song) {
  if (lowQuality === true) {
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
      '-'
  ]);
  } else {
    ffmpeg = spawn('ffmpeg', [
      '-re',
      '-i', song,
//      '-ar', '8000', // Comment this for more quality
      '-f', 'mp3',
      '-'
  ]);
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