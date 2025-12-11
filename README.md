# Setup Guide
# Quick Start

## Follow these steps to set up and run your Discord bot:
Prerequisites

  > Node.js (version 16.9.0 or higher)
> 
  > A Discord account with a registered bot application
> 
  > Basic terminal/command line knowledge

### 📋 Step-by-Step Installation
## Step 1: Install Node.js

# Download and install the latest LTS version of Node.js from the official website:

# Verify installation:
```bash

`node --version`
`npm --version`

```

## Step 2: Download the Code

# Clone or download the project files to your computer:
```bash

# Using Git
git clone <your-repository-url>
cd <project-folder>
```
### Or download ZIP and extract

## Step 3: Install Dependencies

### Navigate to your project directory and install required packages:
```bash

npm install
```

This will install all necessary packages listed in package.json.
## Step 4: Configure Environment Variables

Create a .env file in the root directory of your project:
bash

## Create the .env file
```
touch .env
```

### Add the following variables to your .env file:
```env

TOKEN=your_bot_token_here
GUILD_ID=your_guild_id_here
```

Where to find these values:

    TOKEN: From Discord Developer Portal

        Go to your application → Bot → Copy token

    GUILD_ID: Your Discord server ID

        Enable Developer Mode in Discord settings

        Right-click your server → Copy ID
        
## Step 5: Run the Bot

Start your Discord bot with:
```bash

npm start
# or
node index.js
```

# 📚 Useful Commands
```bash

# Development
npm start          # Start the bot
npm run dev        # Start with nodemon (if configured)

# Troubleshooting
npm list           # Check installed packages
npm audit fix      # Fix security vulnerabilities
```
# Security Notes

    Never share your .env file or bot token

    Add .env to your .gitignore file

    Regularly update dependencies: npm update

    Use a process manager like PM2 for production
