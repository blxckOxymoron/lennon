
[![GitHub deployments](https://img.shields.io/github/deployments/blxckOxymoron/lennon/discord-bot?label=Discord%20Bot&logo=discord&logoColor=fff&style=for-the-badge)](https://github.com/blxckOxymoron/lennon/deployments/activity_log?environment=discord-bot)

# Lennon 🔥


Lennon is a discord bot that tries to provide new and useful functionality! So no music, auto-roles and moderation because 
there already are very sophisticated bots for these use cases.

## Commands 💫

### Molecule
Lennon will query the puchem database and output a dark-mode-friendly structure formula!

### Equation
Use this command to display a KaTeX math equation!

### Timer
Set a timer for a given amount of hours/minutes/seconds. When the time runs out, Lennon will send you a DM!

## Cool Engineering Stuff 🚀

### Sapphire.js
Sapphire.js gives a great scaffold to create listeners, commands and localization

### Auto Deployment
The GH Action on the main branch automatically builds the typescript app and creates an artifact.
It also restarts the service via ssh on the remote Linux server. This service has an auto-updater to load the latest artifact 
as well as apply any prisma migrations. As a finishing touch the invite URL is displayed as a deployment in the repo's sidebar.
