# Easy Transcript
Load an audio file and start (manual) transcription.

## What does it do?
Easy Transcript is a very simple tool that helps you to manually (!) transcribe your audio files. I built it in order to most-comfortably transcribe recorded interviews that I conducted over the course of my research. However, it can also be used for transcribing any group discussions (e.g., from focus groups) or talks (e.g., from presentations).

## How does it help me?
It helps you by giving you easy-to-access shortcuts to pause or play, jump back a few seconds, or adjust the speed of the audio file. Moreover, it keeps track of the speakers in order to provide color and number codings to individual speakers. Easy Transcript also adds timestamps to your transcripts and saves everything on your server so that you can continue your work from anywhere (with internet access).

## Usage
Log in, upload an audio file (limited to 100 MByte per file) or choose a previously uploaded one, and start transcribing. While transcribing some shortcuts come in handy. Use them when your cursor is placed inside the textbox on the bottom:
- `F5` play/pause (just like the button on top)
- `F1` through `F4` jump back 1-4 seconds and play from there
- `Enter` submit/save a piece of transcript which gets a timestamp and is ascribed to the currently set speaker (indiciated by the little dropdown next to the textbox on the bottom)
- `Shift`+`Enter` add a line break into the textbox without submitting/saving
- `F6` through `F8` enter auto-play mode where Easy Transcript plays for 4 (`F6`), 5 (`F7`), or 6 (`F8`) seconds, then pauses for one second, jumps back 2 seconds, and ultimately restarts the same procedure (playing for 4/5/6 seconds, pausing, jumping back). According to your typing speed, the speed of the speaker(s), and a somewhat adjusted speed setting, this auto-play feature gives you the perfect setup for just transcribing while listening. If I set it up correctly (i.e., adjusted to me and the audio file) this allows me to straighly transcribe through the file without the necessity of much additional pausing or jumping. And the best thing about the that is that you can actually calculate the time necessary and thus plan ahead. That's because every 4 seconds will take you an additional 3 seconds (1 = pause, 2 = jumping back). For example, if your file is 32 minutes long and you can work well with the 4-second auto-play feature combined with a audio-play speed that is reduced by one point on the scale (i.e., 90%), the 32-minute file will take you `32min = 1920sec x 110% (speed) x 175% (auto-play feature using 7 for every 4 seconds) = 3696sec = 61.6min or 61min and 36sec`.

## Let's set it up.
You need to have a server (or a webserver provider) that includes PHP and MySQL (a database). Then, the steps are as follows:
- clone the repo
- set up the database using `easytranscript.sql` inside the repository's main directory
- create a random string, any random string (for security reasons), which is used as your "salt"
- come up with a password, append your salt, and generate the MD5 hash of this pairing
  - you could, for instance, visit http://www.md5generator.de/
  - there, enter your password and directly append your salt (if your password was `S3cur3P4ssw0rd!` and your salt was `5f98b0c449d5b`, then you calculate the MD5 hash of `S3cur3P4ssw0rd!5f98b0c449d5b` (which would be `4657ff663698595ff991d94446721682`)
- open `api/config.php` and change the settings according to your needs
  - find the database settings from your provider
  - use the hash here (not the salt!)
- open `js/app.js`, search for `SALT` (line 21, starting at position 74) and replace it with your salt
- use the command line, navigate into the easytranscript directory, and `npm install` and `bower install`
- if everything is set, run `gulp`
- now as we are ready to go, upload ...
  - everything inside the `dist/` directory
  - the complete `api` folder

Ultimately, your webserver's directory listing should look like this:
- api/
  - files/
    - .htaccess
	- index.php
  - config.php
  - index.php
  - UploadHandler.php
- fonts/
  - glyphicons-halflings-regular.eot
  - glyphicons-halflings-regular.svg
  - glyphicons-halflings-regular.ttf
  - glyphicons-halflings-regular.woff
  - glyphicons-halflings-regular.woff2
- app.js
- index.html
- main.css

## Can I just use your installation?
I can probably help you with that but I'd rather not want your data on my server.

## Frequently Asked Questions
### Is the data secure?
The audio files, once uploaded, are not accessible from outside except one knows the password. Moreover, the database itself is not encrypted (which is rather common, though) but protected against access from outside using your password (and the salted hashing mechanism).

### Does it automatically transcribe?
No, sorry.

### But I read something about an auto-play setting?
True, but it's auto-**play**, not auto-transcribe. This setting tells Easy Transcript to play a few seconds, then pause, jump back a little bit, and continue again. This should allow you to easily transcribe without the necessity of pausing or jumping all the time. Oh, and if it doesn't help you you can just ignore it.

### What audio formats are accepted?
Most that I know of. But for file size reasons you can convert it into `.mp3` or `.mp4`. If you want to do so you could use https://cloudconvert.com/

## Contact
Please use any contact information you might find on the web (e-mail, Twitter, ...) or follow instructions on https://haim.it