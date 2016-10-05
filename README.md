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

### What audio formats are accepted?
Most that I know of. But for file size reasons you can convert it into `.mp3` or `.mp4`. If you want to do so you could use https://cloudconvert.com/

## Contact
Please use any contact information you might find on the web (e-mail, Twitter, ...) or follow instructions on https://haim.it