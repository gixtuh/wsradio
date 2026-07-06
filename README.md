# WSRadio
WSRadio is a real-time audio streaming server built on WebSockets. Basically this uses WebSockets to constantly send chunks of audio bytes to every client on your front-end to then be converted into actual music that's getting constructed while you listen to it.

# Installation
To run this, you will need either Windows or Linux (haven't tried on Mac :P), Node.js and FFmpeg.

To set up WSRadio you'll have to go to the server directory (where the server.js file is located at), enter `npm i` and then `node server.js` to launch it. Fully it'll look something like this:

```
npm i
node server.js
```
Yeah it's THAT simple, just once again make sure to install FFmpeg.

But it's not really over yet. There is a `settings.json` file in the root directory. These are the settings for this. You are to change those settings.

The default `settings.json` file looks like this:

```json
{
    "grabFrom": "local or global",
    "chooserandom":true,
    "addFFmpegOptions":"",
    "globalPlaylistDB": "https://example.com/songs",
    "use":{
        "songfile.mp3": {
            "title": "title",
            "author": "author",
            "icon": "https://example.com/songicon.png"
        },
        "anothersongfile.mp3": {
            "title": "title",
            "author": "author",
            "icon": "https://example.com/anothersongicon.png"
        }
    }
}
```
`grabFrom` - Either grabs songs from a directory on the local drive (local) or fetches songs from a specific database (global)

`chooserandom` - If set to true, will choose songs randomly, if set to false then it'll select songs going from top to bottom of the array `use`

`addFFmpegOptions` - Additional FFmpeg options. Yeah that's it.

`globalPlaylistDB` - Database that includes the songs (if `grabFrom` is set to global). Can be deleted if `grabFrom` is set to "local"

`use` - Array with every used song

### About `use`
<hr/>

Every song file goes inside of the `songs` folder in the root directory

These song files are specified as a key in the `use` property, so for example if you have `song.mp3` in the `songs` directory and you wanted to use it as a song, let's say you named it "Hello World", the property would look something like:
```json
"song.mp3":{
    "title":"Hello World",
    "author":"You",
    "icon": "https://example.com/anothersongicon.png"
}
```

# Backwards compatibility
WSRadio once had a really old frontend. This version of WSRadio backend is **fully compatible** with that version

## DISCLAIMER
WSRadio itself does **NOT** come with preset songs, therefore if an owner is asked to take down a specific song from their library, it is to blame them, not us.