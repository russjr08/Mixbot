const Carina = require('carina').Carina;
const ws = require('ws');

const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config.json');

const fs = require('fs');

Carina.WebSocket = ws;

const CHANNEL_LOOKUP_TEMPLATE = "https://mixer.com/api/v1/channels/username?fields=id"

var self = this;
this.servers = {};

// Mixer Integration

// Discord Integration

client.on('ready', () => {
    console.log(`Mixbot is up and running as ${client.user.tag}!`);
    initBot();
});

client.on('message', message => {
    if(message.content === '!debug') {
        message.channel.send(`This server's ID is ${self.servers[message.guild.id].id}`);
    }
});

client.on('guildCreate', (guild) => {
    initializeServer(guild);
});

client.login(config.token);

function initBot() {
    client.user.setActivity('Mixer', { type: 'WATCHING' });

    client.guilds.forEach(guild => {
        initializeServer(guild);
    })
}

function initializeServer(guild) {
    fs.access(`./servers/${guild.id}.json`, (err) => {
        if(!err) {
            console.log(`Config file for ${guild.id} (${guild.name}) already exists!`);
            fs.readFile(`./servers/${guild.id}.json`, (err, data) => {
                if(!err) {
                    var server = JSON.parse(data);
                    self.servers[server.id] = server;
                    console.log(self.servers[server.id]);
                }
            })
        } else {
            console.log(`Config file for ${guild.id} (${guild.name}) does NOT exist. Creating...`);
            fs.writeFileSync(`./servers/${guild.id}.json`, JSON.stringify({ id: guild.id}));
        }
    });
}