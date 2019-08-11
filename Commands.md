## Administrative Commands
_These commands can only be performed as a Server Administrator_

_(Replace ! with your custom prefix if you've set one)_

* !register `USERNAME` - Register a channel to monitor on this server.

* !deregister `USERNAME` - Stops monitoring a channel on this server.

* !announcement `TEMPLATE` - The template to use for stream announcements
  + _The text `%USERNAME%` will be replaced will the streamer's name_
  + The default is 
    > Hey @everyone, `%USERNAME%` is now live on Mixer! Check them out at https://mixer.com/%USERNAME%
  + _Tip:_ Change @everyone to a role that your server members can opt in and out of to prevent excessive notifications!

* !announceat - Sets the room that the bot will announce streamer notifications at (_don't include the #_!)

* !setprefix - Sets the prefix for commands to monitor

* !begone - Informs the bot to leave, and forget about this place... (deletes config from the server)

* !commands - Links to this document