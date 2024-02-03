<div style="text-align: center;">
<img src="https://cdn.discordapp.com/attachments/456120666874183680/575235193384861716/couronne.png" style="border-radius: 50%; width: 300px" alt="Couronne DraftBot">

DraftBot is a text adventure game. The story takes place in a medieval world, and the player embodies an adventurer who wants to win a competition launched by the king, to win the princess' hand. To achieve this, he must travel and earn points by going through a lot of danger, including thieves, wilderness, and scary children. Every few hours, the player can follow their adventure through "reports" and interact with a multiple choice system, using reactions below the report. Each choice has multiple issues, which could hurt the character, heal them, or even give them some stuff. During the journey, they earn money, equipments, and points, and can use them to buy potions, items or effects in the shop, fight other players, and ascend the leaderboard.

[![](https://img.shields.io/discord/429765017332613120.svg)](https://discord.gg/5JqrMtZ)
[![](https://img.shields.io/github/stars/BastLast/DraftBot-A-Discord-Adventure.svg?label=Stars&style=social)](https://github.com/BastLast/DraftBot-A-Discord-Adventure)

</div>

<br>

# How to play the game ?

DraftBot is originally a discord bot and has evolved to become a fully fledged game that you can play either through discord or through other clients.

You can start playing by visiting our website: https://draftbot.com

# Create a custom DraftBot instance

_Before creating your own instance, please note that you can add the bot to your server through the link available on
the bot's discord_

**If you decide to work on the creation of your own instance of the bot, you are supposed to have a minimum of computer
skills. Bot support team will prioritize players of the main instance and will only provide very limited assistance. We
will fix bugs you report, but we will not teach you how to code a discord bot.**

Please do not copy and paste the commands we provide in this readme without :
- Understanding the command
- Replacing the relevant parts with your data
- Having read the whole document

**Only the code available in the "release" tab is considered "stable".**

## BETA BRANCH WARNING

You are here in the not yet released v5 of DraftBot. Compared to previous versions of the game, we migrated to microservices. Cloning this repository and its submodules will allow you to get all the services necessary to run draftbot v5.

This work is still in progress, please do not open issues about bugs faced in this version of the software.

## Dev environment setup

### Requirements

This list contains all the software programs necessary to run DraftBot. Our start guide will walk you through the installation process

- Docker
- Any IDE
- git
- node (see package.json of any service for the relevant version)
- nvm (not mandatory but highly recommended)
- yarn

### Start guide

This guide will help you run DraftBot on your computer. We provide instructions for Linux, MacOS (🐧) and Windows (🪟). If not specified, the command is the same for all OS.
Please do not skip any step of this guide, otherwise, the following commands will not work.

- Install git: 🐧 `apt-get install git` | 🪟 https://git-scm.com/download/win
- Download the bot: `git clone https://github.com/BastLast/DraftBot-A-Discord-Adventure`
- Switch to the DraftBot v5 branch `git checkout draftbot-v5-multirepo-preparation`
- Download all the git submodules:
- Install NodeJS (check nvm documentation for instructions)
  - Check any package.json for the minimal required version
- Install Yarn `npm install --global yarn`
- Install and launch a mariadb database. Keep the credentials for the config file. 
  - Here is a command that will help you create a database container. (Please replace the relevant parameters of this command)
    `docker run -d --name mariadb -e MARIADB_USER=draftbot -e MARIADB_PASSWORD=secret_password -e MARIADB_ROOT_PASSWORD=super_secret_password -v /path/to/volumes/mariadb:/var/lib/mysql -p 3306:3306 mariadb:latest`
- Move to the Core folder: `cd Core`
- Create the config file by copying the file config.default.toml in a new file config.toml
- Edit the file config.toml with the correct data
- Install the Core module: `yarn install`
- Move to the Keycloak folder: `cd ../Keycloak`
- Follow the instructions in the README.md file of the Keycloak folder
- Move to the Discord folder: `cd ../Discord`
- Create the config file by copying the file config.default.toml in a new file config.toml
- Edit the file config.toml with the correct data
- Install the Discord module: `yarn install`
- Move to the lib folder: `cd ../lib`
- Install the lib module: `yarn install`
- The Core module also need access to the Keycloak server on the first launch. You need to create the relevant config file in the Core folder: 🐧 `cd ../Core && touch keycloak.toml` | 🪟 `cd ../Core && type nul > keycloak.toml`
- You can copy and paste the content of the keycloak section from the config.toml file in the Discord folder in the keycloak.toml file
- You can now start the Core module: `yarn start`
- and the discord module `cd ../Discord && yarn start`

You can set up npm launch scripts to make the start easier.
From now on you should be able to start the bot by running `yarn start` in the Core and Discord folders while having the database and keycloak running.
Starting order is important, start with the database container and keycloak, then the Core and finally the Discord module.

# Screenshots

![image](https://user-images.githubusercontent.com/56274541/120916573-ad599000-c6aa-11eb-9e6f-ccc804bc63b2.png)

# Links

- [Website](https://draftbot.com)
- [Discord server _(in French)_](https://discord.gg/5JqrMtZ)
- [Suggestion board _(in French)_](https://feedback.draftbot.com/)
- [Player guide](https://guide.draftbot.com)
- [Twitter account _(in French)_](https://twitter.com/DraftBot_?s=09)
