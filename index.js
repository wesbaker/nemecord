require("dotenv").config();

const axios = require("axios");
const moment = require("moment");
const getAttachments = require("./lib/Play").getAttachments;

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
      getAttachments(playData).then(attachments => {
        attachments.forEach(attachment => {
          axios.post(url, attachment).catch(error => {
            if (error) Raven.captureException(error);
          });
        });
      });
    });
  })
  .catch(err => {
    Raven.captureException(err);
  });
