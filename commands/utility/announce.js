require('@dotenvx/dotenvx').config();

const { ActionRowBuilder, Events, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName('announce')
            .setDescription(`Ouvre le formulaire d'annonce`),
        async execute(interaction) {
            
            if (interaction.channelId !== process.env.DISCORD_MODERATOR_CHANNEL_ID) {
                await interaction.reply({ content: `Impossible d'utiliser cette commande.`, ephemeral: true });
                return;
            }

            const modal = new ModalBuilder()
                .setCustomId('announcementModal')
                .setTitle('Annonce');

            const announceTitle = new TextInputBuilder()
                .setCustomId('announcementModal_title')
                .setLabel(`Titre de l'annonce:`)
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder(`Tournoi spécial`);

            const announceUrlInput = new TextInputBuilder()
                .setCustomId('announcementModal_url')
                .setLabel(`Lien lié à l'annonce:`)
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setPlaceholder('https://start.gg/bo-troyes-2');

            const announceContent = new TextInputBuilder()
                .setCustomId('announcementModal_content')
                .setLabel(`Message de l'annonce:`)
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setPlaceholder('Ici on fait le tournoi: BOTroyes #2');

            const titleRow = new ActionRowBuilder().addComponents(announceTitle);
            const urlRow = new ActionRowBuilder().addComponents(announceUrlInput);
            const contentRow = new ActionRowBuilder().addComponents(announceContent);

            modal.addComponents(titleRow, urlRow, contentRow);

            await interaction.showModal(modal);
        }
}