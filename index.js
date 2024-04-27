require('@dotenvx/dotenvx').config();

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, EmbedBuilder, Events, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: `There was an error while executing this command !`, ephemeral: true});
        } else {
            await interaction.reply({ content: `There was an error while executing this command !`, ephemeral: true});
        }
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isModalSubmit()) return;

    const modalId = interaction.customId;
    const sender = client.users.cache.get(interaction.user.id);
    const guild = client.guilds.cache.get(process.env.DISCORD_SERVER_ID);

    switch(modalId) {
        case 'announcementModal':

            const title = interaction.fields.getTextInputValue('announcementModal_title');
            let url = interaction.fields.getTextInputValue('announcementModal_url');
            if (url === '' || url !== '' && !url.match(/\b(https?:\/\/\S*\b)/g)) {
                url = undefined;
            }
            const content = interaction.fields.getTextInputValue('announcementModal_content');
            
            const channel = client.channels.cache.get(process.env.DISCORD_ANNOUNCEMENT_CHANNEL_ID);
            
            const announcementEmbed = new EmbedBuilder()
                .setColor(`#CC0000`)
                .setTitle(title)
                .setURL(url??null)
                .setDescription(content)
                .setAuthor({
                    name: process.env.DISCORD_ANNOUNCEMENT_NAME,
                    iconURL: guild.iconURL()
                })
                .setFooter({
                    text: interaction.user.globalName,
                    iconURL: sender.displayAvatarURL({ format: 'png'})
                })
                .setTimestamp();
            
            channel.send(`@everyone`);
            channel.send({
                embeds: [announcementEmbed]
            });

            await interaction.reply({
                content: `Annonce publiée.`,
                ephemeral: true
            });

            setTimeout(async () => {
                await interaction.deleteReply()
            }, 5000);
            break;
        default:
            return;
    }
});

client.once(Events.ClientReady, readyClient => {
    console.log(`Discord bot started. Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);