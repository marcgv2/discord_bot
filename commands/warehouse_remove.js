const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs').promises;
const logger = require('../utils/logger');

const DATA_PATH = './db/warehouse.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warehouse_remove')
        .setDescription('remove an item from the warehouse')
        .addStringOption(option => 
            option.setName('item')
                .setDescription('Name of item to remove')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('location')
            .setDescription('Location of the item (optional)')
            .setRequired(false)),

    async execute(interaction) {
        const itemName = interaction.options.getString('item')?.toLowerCase();
        const itemLocation = interaction.options.getString('location')?.toUpperCase();

        try {
            // Read existing data
            const rawData = await fs.readFile(DATA_PATH, 'utf-8');
            let warehouseData = JSON.parse(rawData);

            let removedItem;
            
            if (itemLocation) {
                // Remove specific item at specific location
                removedItem = warehouseData.find(item => 
                    item.name === itemName && item.position === itemLocation
                );
                
                if (removedItem) {
                    warehouseData = warehouseData.filter(item => 
                        !(item.name === itemName && item.position === itemLocation)
                    );
                }
            } else {
                // Remove all instances of the item (any location)
                const itemsToRemove = warehouseData.filter(item => item.name === itemName);
                warehouseData = warehouseData.filter(item => item.name !== itemName);
                removedItem = itemsToRemove[0]; // Get first one for message
            }

            if (!removedItem) {
                const message = itemLocation 
                    ? `Item "${itemName}" not found at location ${itemLocation}.`
                    : `Item "${itemName}" not found in the warehouse.`;
                await interaction.reply(message);
                return;
            }

            // Write updated data to the file
            await fs.writeFile(DATA_PATH, JSON.stringify(warehouseData, null, 2));
            
            const message = itemLocation
                ? `Removed "${itemName}" from location ${itemLocation}`
                : `Removed all instances of "${itemName}" from the warehouse`;
            
            await interaction.reply(message);

            // logger
            await logger.log('warehouse_remove', interaction.user, {
                item: itemName,
                locaton: itemLocation
            })

        } catch(error) {
            console.error('Error:', error);
            await interaction.reply('There was an error removing the item from the warehouse.');
        }
    }
}