const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const logger = require('../utils/logger');

const DATA_PATH = './db/warehouse.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warehouse')
        .setDescription('Check item positions in the warehouse')
        .addStringOption(option =>
            option.setName('item')
                .setDescription('Search for specific item position')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('location')
                .setDescription('Filter by location (e.g., A1, B2)')
                .setRequired(false)),
    
    async execute(interaction) {
        try {
            const rawData = await fs.readFile(DATA_PATH, 'utf-8');
            const warehouseData = JSON.parse(rawData);
            
            const itemQuery = interaction.options.getString('item')?.toLowerCase();
            const locationQuery = interaction.options.getString('location')?.toUpperCase();

            // Filter data based on queries
            let filteredItems = warehouseData;
            if (itemQuery) {
                filteredItems = filteredItems.filter(item => 
                    item.name.toLowerCase().includes(itemQuery)
                );
            }
            if (locationQuery) {
                filteredItems = filteredItems.filter(item => 
                    item.position === locationQuery
                );
            }

            if (filteredItems.length === 0) {
                let reply = 'No items found';
                if (itemQuery && locationQuery) {
                    reply = `No items matching "${itemQuery}" found in location ${locationQuery}`;
                } else if (itemQuery) {
                    reply = `No items matching "${itemQuery}" found in warehouse`;
                } else if (locationQuery) {
                    reply = `No items found in location ${locationQuery}`;
                }
                await interaction.reply(reply);
                
                // Log the search
                await logger.log('warehouse', interaction.user, {
                    item: itemQuery,
                    position: locationQuery,
                    result: 'no_items_found'
                });
                return;
            }

            // Format the response
            let response = '';
            if (itemQuery || locationQuery) {
                response = `**Search Results:**\n`;
                if (itemQuery) response += `Item: "${itemQuery}"\n`;
                if (locationQuery) response += `Location: ${locationQuery}\n`;
                response += '\n';
            }

            // Sort items by position (A1, A2, B1, etc.)
            filteredItems.sort((a, b) => a.position.localeCompare(b.position));

            filteredItems.slice(0, 15).forEach(item => {
                response += ` **${item.position}** - ${item.name}\n`;
            });

            if (filteredItems.length > 15) {
                response += `\n...and ${filteredItems.length - 15} more positions`;
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Warehouse Position Tracking')
                .setDescription(response)
                .setTimestamp()
                .setFooter({ 
                    text: itemQuery || locationQuery 
                        ? 'Search results' 
                        : `Displaying ${filteredItems.length} warehouse positions` 
                });

            await interaction.reply({ embeds: [embed] });

            // Logging
            await logger.log('warehouse', interaction.user, {
                item: itemQuery,
                position: locationQuery,
                results_count: filteredItems.length
            });
            
        } catch (error) {
            console.error('Error accessing warehouse data:', error);
            
            // Log the error
            await logger.error('Warehouse command error', error);
            
            if (!interaction.replied) {
                if (error.code === 'ENOENT') {
                    await interaction.reply('Warehouse database not found. Please check logs.');
                } else {
                    await interaction.reply('Error accessing warehouse data. Please try again later.');
                }
            }
        }
    }
};