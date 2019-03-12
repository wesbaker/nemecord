# Nemecord

[![CircleCI](https://circleci.com/gh/wesbaker/nemecord.svg?style=svg)](https://circleci.com/gh/wesbaker/nemecord)
[![Code Climate](https://codeclimate.com/github/wesbaker/nemecord/badges/gpa.svg)](https://codeclimate.com/github/wesbaker/nemecord)

A simple way to send [Nemestats][nemestats] plays to Discord:

![Example Nemecord](example.png)

## Installation

At the moment you'll need your own instance for your Discord. I run mine on Heroku (for free) and it works really well.

1. Create [a new Discord Webhook](https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks)
2. Create a new app over at [Heroku](https://dashboard.heroku.com/new-app?org=personal-apps)
3. [Set two environment variables on your app at Heroku](https://devcenter.heroku.com/articles/config-vars#setting-up-config-vars-for-a-deployed-application):
    - `GAMING_GROUP_ID` is the ID in the URL of your gaming group at [Nemestats][nemestats] (e.g. with a url of `https://nemestats.com/GamingGroup/Details/13468` your ID is `13468`)
    - `DISCORD_WEBHOOK_URL` is the Webhook URL created in step 3
4. Clone this repository and then [deploy it to Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app)
5. Schedule a run of the app so the games get posted
    - Open the scheduler: `heroku addons:open scheduler`
    - Add a new job specifying a daily run at the time you want running `npm run post`

[nemestats]: https://nemestats.com
