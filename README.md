# WSRadio
WSRadio is a real-time audio streaming server built on WebSockets. So basically this uses WebSockets to constantly send chunks of data URI audio to clients on your front-end to then be converted into actual music that's getting constructed while you listen to it.

 # Installation
To run this, you will need either Windows or Linux (haven't tried on Mac :P), Node.js and FFmpeg.

To set up WSRadio you'll have to go to the server directory (where the server.js file is located at), enter `npm i` and then `node server.js` to launch it. So fully it'll look something like this:

```
npm i
node server.js
```
Yeah it's THAT simple, just once again make sure to install FFmpeg.

You can then drop song files into the server directory (and make sure YOU own them or YOU have the PERMISSION to use them) and head over to [my finished front-end](https://gixtuh.vercel.app/wsradio), hit "S" and enter `ws://localhost:8080` or self-host the URL and have ANYONE be able to listen to your WebSocket.

## DISCLAIMER
This project is ONLY meant to be a music hosting server, so if you are asked to take down a specific song from your WSRadio server (most likely due to copyright infringement) then it is YOUR responsibility to do so, not mine.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

tbh idk what else to say
