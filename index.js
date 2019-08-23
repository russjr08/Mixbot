const Carina = require('carina').Carina;
const ws = require('ws');

const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config.json');
const Strings = require('./strings.json');

const fs = require('fs');

const axios = require('axios');

Carina.WebSocket = ws;
const ca = new Carina({ isBot: true }).open();

const CHANNEL_LOOKUP_TEMPLATE = "https://mixer.com/api/v1/channels/username?fields=id"
const ID_TO_CHANNEL_TEMPLATE = "https://mixer.com/api/v1/channels/id?fields=token"

var self = this;
this.servers = {};

// Mixer Integration

function startListening(id) { 
    ca.subscribe(`channel:${id}:update`, data => {
        if(data.online != undefined && data.online) {
            console.log(`Live Event for ${id} is inbound!`);
            announceStreamer(id);
        }
    });

    console.log(`Subscribed to ${id}'s Mixer channel events.`);
}

// Discord Integration

client.on('ready', () => {
    console.log(`Mixbot is up and running as ${client.user.tag}!`);
    initBot();
});

client.on('message', message => {
    if(message.content === '!debug') {
        var server = getServer(message.guild);
        server.wumbo = true;
        message.channel.send(`This server's ID is ${self.servers[message.guild.id].id}, and data is \`${JSON.stringify(server)}\``);
    }

    if(!message.member.hasPermission("ADMINISTRATOR")) {
        return;
    }

    var server = getServer(message.guild);
    var prefix = server.prefix || "!"
    if(message.content.startsWith(prefix)) {
        var command = message.content.replace(prefix, "").split(" ")[0] || "";
        if(command === "commands") {
            message.channel.send("You can get a list of my commands at https://github.com/russjr08/Mixbot/blob/master/Commands.md");
        }

        if(command === "setprefix") {
            var new_prefix = message.content.split(" ")[1] || "!";
            server.prefix = new_prefix;
            message.channel.send(`I will look for \`${new_prefix}\` to detect commands on this server.`);
        }

        if(command === "announceat") {
            var announce_channel = message.content.split(" ")[1];
            if(!(announce_channel == undefined || announce_channel == null)) {
                server.announce_channel = announce_channel;

                message.channel.send(`I will broadcast stream announcements at #${announce_channel}.`);
            }
        }

        if(command === "announcement") {
            if(message.content.split(" ")[1] === "default") {
                message.channel.send(`Reverting to the default announcement template (Refer to ${prefix}commands) for this server.`);
                delete server.announcement_template;
            } else {
                var announcement_template = message.content.replace(`${prefix}${command}`, "");
                server.announcement_template = announcement_template;
                message.channel.send(`I will now use the following template: \`${announcement_template}\` for this server.`);
            }
        }

        if(command === "register") {
            var name = message.content.split(" ")[1];
            
            axios.get(CHANNEL_LOOKUP_TEMPLATE.replace("username", name))
                .then((response) => {
                    message.channel.send(`Registered ${name} (${response.data.id}) for stream notifications on this server.`);
                    if(server.streamers == null) {
                        server.streamers = []
                    }

                    server.streamers.push(response.data.id)
                    startListening(response.data.id)
                })
                .catch((err) => {
                    message.channel.send(`Failed to register ${name}.`);

                })
            
        }
    }
});

client.on('guildCreate', (guild) => {
    initializeServer(guild);

    let channelID;
    let channels = guild.channels;
    channelLoop:
    for (let c of channels) {
        let channelType = c[1].type;
        if (channelType === "text") {
            channelID = c[0];
            break channelLoop;
        }
    }

    let channel = client.channels.get(guild.systemChannelID || channelID);
    channel.send(Strings.SERVER_JOIN).catch(console.error);

    self.servers[guild.id] = {id: guild.id};
});

client.login(config.token);

function initBot() {
    client.user.setActivity('Mixer', { type: 'WATCHING' });

    client.guilds.forEach(guild => {
        initializeServer(guild);
    })
}

function announceStreamer(id) {
    Object.keys(self.servers).forEach((serverID) => {
        var server = self.servers[serverID];
        if(server.streamers != undefined && server.announce_channel != undefined && server.streamers.includes(id)) {
            axios.get(ID_TO_CHANNEL_TEMPLATE.replace('id', id))
                .then((response) => {
                    var message = server.announcement_template || Strings.DEFAULT_ANNOUNCEMENT;
                    message = message.replace(/%USERNAME%/g, response.data.token);

                    var guild = client.guilds.get(serverID);

                    guild.channels.forEach((channel) => {
                        if(channel.name === server.announce_channel && channel.type === "text") {
                            channel.send(message);
                        }
                    })
                });
            
        }
    });
    
}

function initializeServer(guild) {
    fs.access(`./servers/${guild.id}.json`, (err) => {
        if(!err) {
            console.log(`Config file for ${guild.id} (${guild.name}) already exists!`);
            fs.readFile(`./servers/${guild.id}.json`, (err, data) => {
                if(!err) {
                    var server = JSON.parse(data);
                    self.servers[server.id] = server;

                    if(server.streamers != undefined) {
                        server.streamers.forEach((streamId) => {
                            startListening(streamId);
                        });
                    }
                    
                }
            })
        } else {
            console.log(`Config file for ${guild.id} (${guild.name}) does NOT exist. Creating...`);
            fs.writeFileSync(`./servers/${guild.id}.json`, JSON.stringify({ id: guild.id}));
        }
    });
}

function getServer(guild) {
    return self.servers[guild.id];
}

function getServerById(id) {
    return self.servers[id];
}

// Set the server to Wumbo
function saveServer(server) {
    fs.writeFileSync(`./servers/${server.id}.json`, JSON.stringify(server));
}


// Node Process Deconstruction
process.on('SIGINT', () => {
    console.log("Closing connections, and saving data.");
    Object.keys(self.servers).forEach(async id => {
        console.log(`Persisting Server ID: ${id}`);
        await saveServer(getServerById(id));
    });

    process.exit();
})