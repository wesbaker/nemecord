require("dotenv").config();

const axios = require("axios");
const moment = require("moment");
const getAttachment = require("./lib/Play").getAttachment;

const testRun = process.argv.includes("--test");
if (testRun) {
  if (typeof axios !== "function") {
    console.error("axios was not loaded.");
  }
  if (typeof moment !== "function") {
    console.error("moment was not loaded.");
  }
  console.log("Debug: Nemecord would post now.");
  process.exit(0);
}

const Raven = require("raven");
Raven.config(process.env.SENTRY_DSN);

const url = process.env.DISCORD_WEBHOOK_URL;

module.exports = (req, res) => {
  axios
    .get("https://nemestats.com/api/v2/PlayedGames/", {
      params: {
        gamingGroupId: process.env.GAMING_GROUP_ID,
        datePlayedFrom: moment()
          .subtract(1, "days")
          .format("YYYY-MM-DD"),
        datePlayedTo: moment()
          .subtract(1, "days")
          .format("YYYY-MM-DD")
      }
    })
    .then(({ data: { playedGames } }) => {
      playedGames.forEach(playData => {
        getAttachment(playData).then(attachment => {
          axios.post(url, attachment).catch(error => {
            if (error) Raven.captureException(error);
          });
        });
      });
      res.end(`${playedGames.length} plays sent to Discord.`);
    })
    .catch(err => {
      Raven.captureException(err);
      res.statusCode = 404;
      res.end(err.message);
    });
};
