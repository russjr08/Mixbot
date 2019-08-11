const Carina = require('carina').Carina;
const ws = require('ws');

const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config.json');
const Strings = require('./strings.json');

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
        message.channel.send(`This server's ID is ${self.servers[message.guild.id].id}, and data is \`${JSON.stringify(getServer(message.guild))}\``);
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

function getServer(guild) {
    return self.servers[guild.id];
}

function getServerById(id) {
    return self.servers[id];
}

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