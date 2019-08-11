# Welcome to Mixbot!

Hello! Welcome to my repository. Mixbot is designed to be a Discord bot that broadcasts whenever a Mixer streamer (registered with the server) goes live!

I've created it due to having issues using the presently available Mixer-Discord integrations, and to better learn both the Mixer and Discord APIs.

You are free to look through the source code, I do ask that you do not redistribute it however. If you have any suggestions, feel free to open an issue! Also, Discord's ToS state that you cannot run a fork/duplicate of a bot, so while I've provided everything that you need in order to get this bot running, I ask that you do not run an actual copy in production. 

For right now, usage is only allowed on whitelisted servers, while I make sure everything is in a "ready" state.

---

## Running Your Own Instance

As stated above, running a fork of a bot is against Discord's ToS, so please, don't actually do it! However, if you'd like to play around with it, you'll need to create a `config.json` file in the root directory of this project locally.

You'll need to obtain an API Token from Discord's [Developer Site](https://discordapp.com/developers/applications/), and insert it into the config file. It should look like this:

```
{
   "token": "YOUR TOKEN GOES HERE"
}
```

---

## Mixer Integration

Mixer Integration is currently under construction, and will be notated here when ready!