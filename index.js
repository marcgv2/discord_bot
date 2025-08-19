require("dotenv").config();
const { Client, GatewayIntentBits, Collection, ActivityType } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const fs = require("fs");
const EventEmitter = require('events');

// Initialize client with intents
const client = new Client({
  intents: [
    8,
  ],
});

// Event emitter configuration
const emitter = new EventEmitter();
EventEmitter.defaultMaxListeners = 100;

// Command handling
client.commands = new Collection();
const commands = [];

// Load commands
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
  console.log(`[SLASH CMD]: Command "${command.data.name}" has been loaded!`);
}

// Load events
const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, commands));
  } else {
    client.on(event.name, (...args) => event.execute(...args, commands));
  }
}

// Ready event
client.on("ready", async () => {
  console.log(`${client.user.tag} has logged in!`);
  
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  
  try {
    if (process.env.ENV === "production") {
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
      );
    } else {
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
        { body: commands }
      );
    }
    console.log("Successfully registered commands!");
  } catch (error) {
    console.error(error);
  }

  // Status update
  setInterval(() => {
    const memberCount = client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount, 0
    );
    client.user.setActivity({
      name: `Bot online | ${memberCount} members`,
      type: ActivityType.Watching
    });
  }, 10000);
  
  client.user.setStatus("online");
});

// Interaction handling
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error executing this command!",
      ephemeral: true
    });
  }
});


// Login
client.login(process.env.TOKEN);