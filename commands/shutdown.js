const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { exec } = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('Shuts down the bot and stops PM2 from restarting it')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        // Defer reply to avoid timeout
        await interaction.reply({ ephemeral: true, content: 'shutdown in process' });
        
        try {
            // Get the PM2 app name from environment variable or use default
            const pm2AppName = process.env.PM2_APP_NAME || 'gayland_bot';
            
            // Execute PM2 stop command
            exec(`pm2 stop ${pm2AppName}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error stopping PM2: ${error}`);
                    return interaction.editReply({
                        content: ` Failed to stop PM2 process: ${error.message}`,
                        ephemeral: true
                    });
                }
                
                console.log('PM2 process stopped successfully');
                console.log('Output:', stdout);
                
                interaction.editReply({
                    content: ' Bot shutdown initiated. PM2 will not restart the bot.',
                    ephemeral: true
                }).then(() => {
                    // Destroy the client and exit
                    interaction.client.destroy();
                    console.log('Discord client destroyed');
                    process.exit(0);
                });
            });
            
        } catch (error) {
            console.error('Shutdown error:', error);
            interaction.editReply({
                content: ` An error occurred: ${error.message}`,
                ephemeral: true
            });
        }
    }
};
