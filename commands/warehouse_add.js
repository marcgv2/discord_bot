const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const logger = require('../utils/logger');

const DATA_PATH = './db/warehouse.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warehouse_add')
        .setDescription('add an item to the warehouse')
        .addStringOption(option => 
            option.setName('item')
                .setDescription('Name of item to add')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('location')
            .setDescription('Location of item')
            .setRequired(true)),

    async execute(interaction) {
        const itemName = interaction.options.getString('item')?.toLowerCase();
        const itemLocation = interaction.options.getString('location')?.toUpperCase();

        try {
            // Read existing data
            const rawData = await fs.readFile(DATA_PATH, 'utf-8');
            const warehouseData = JSON.parse(rawData);

            // Check if location is already occupied by ANY item
            const locationOccupied = warehouseData.find(item => item.position === itemLocation);
            
            if (locationOccupied) {
                await interaction.reply(`Location ${itemLocation} is already occupied by "${locationOccupied.name}". Cannot add "${itemName}" here.`);
                return;
            }

            // Optional: Also check if the same item exists anywhere (if you want this too)
            const itemExists = warehouseData.find(item => item.name === itemName);
            if (itemExists) {
                await interaction.reply(`Item "${itemName}" already exists at location ${itemExists.position}.`);
                return;
            }

            // Add new item
            const newItem = { name: itemName, position: itemLocation };
            warehouseData.push(newItem);

            // Write updated data to the file
            await fs.writeFile(DATA_PATH, JSON.stringify(warehouseData, null, 2));
            await interaction.reply(`Added "${itemName}" to location ${itemLocation}`);

            // logging 
            await logger.log('warehouse_add', interaction.user, {
                item: itemName,
                position: itemLocation
            })

        } catch(error) {
            console.error('Error:', error);
            await interaction.reply('There was an error adding the item to the warehouse.');
        }
    }
}