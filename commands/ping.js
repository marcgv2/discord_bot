const { SlashCommandBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('pong'),

        async execute(interaction) {
            await interaction.reply('pong');

            // logging
            try {

                await logger.log('ping', interaction.user, {
                    response: 'pong'
                })
            } catch (error) {
                console.error('Error logging ping command:', error);
                await interaction.followUp('There was an error logging the ping command.');
            }
        }
}
