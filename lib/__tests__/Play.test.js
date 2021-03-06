const Play = require("../Play");
const cloneDeep = require("lodash").cloneDeep;
const moxios = require("moxios");

describe("Play", () => {
  const players = [
    { playerName: "Luke Skywalker", gameRank: 1, pointsScored: 10 },
    { playerName: "Darth Vader", gameRank: 2, pointsScored: 8 },
    { playerName: "R2-D2", gameRank: 3, pointsScored: 7 },
    { playerName: "Jar-Jar Binks", gameRank: 4, pointsScored: 0 },
  ];
  const play = {
    gameDefinitionName: "Star Wars: A New Hope",
    playedGameId: 1,
    datePlayed: "1977-05-25",
    boardGameGeekGameDefinitionId: 187645,
    playerGameResults: players,
  };
  const thumbUrl =
    "https://images-na.ssl-images-amazon.com/images/M/MV5BYzQ2OTk4N2QtOGQwNy00MmI3LWEwNmEtOTk0OTY3NDk2MGJkL2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_UX182_CR0,0,182,268_AL_.jpg";
  const attachments = {
    embeds: [
      {
        description: "Played on Wednesday, May 25th 1977",
        fields: [
          {
            name: "Players",
            value: ":trophy: Luke (10), Darth (8), R2-D2 (7), Jar-Jar (0)",
          },
        ],
        thumbnail: {
          url:
            "https://images-na.ssl-images-amazon.com/images/M/MV5BYzQ2OTk4N2QtOGQwNy00MmI3LWEwNmEtOTk0OTY3NDk2MGJkL2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_UX182_CR0,0,182,268_AL_.jpg",
        },
        title: "Star Wars: A New Hope",
        url: "https://nemestats.com/PlayedGame/Details/1",
      },
    ],
  };
  describe("getUrl", () => {
    test("returns the correct URL", () => {
      expect(Play.getUrl(1)).toBe("https://nemestats.com/PlayedGame/Details/1");
    });
  });

  describe("createPlayers", () => {
    test("returns normal players", () => {
      expect(Play.createPlayers(players)).toEqual({
        name: "Players",
        value: ":trophy: Luke (10), Darth (8), R2-D2 (7), Jar-Jar (0)",
      });
    });

    test("returns tied players", () => {
      let testPlayers = cloneDeep(players);
      testPlayers[1]["gameRank"] = 1;
      testPlayers[1]["pointsScored"] = 10;
      expect(Play.createPlayers(testPlayers)).toEqual({
        name: "Players",
        value:
          ":trophy: Luke (10), :trophy: Darth (10), R2-D2 (7), Jar-Jar (0)",
      });
    });

    test("returns no scores when players have none", () => {
      const testPlayers = cloneDeep(players).map((player) => {
        player.pointsScored = null;
        return player;
      });
      expect(Play.createPlayers(testPlayers)).toEqual({
        name: "Players",
        value: ":trophy: Luke, Darth, R2-D2, Jar-Jar",
      });
    });

    test("returns 0 for a null score when at least one player has a score", () => {
      let testPlayers = cloneDeep(players);
      testPlayers[2]["pointsScored"] = null;
      testPlayers[3]["pointsScored"] = null;
      expect(Play.createPlayers(testPlayers)).toEqual({
        name: "Players",
        value: ":trophy: Luke (10), Darth (8), R2-D2 (0), Jar-Jar (0)",
      });
    });

    const cooperativePlayers = (win) =>
      cloneDeep(players).map((player) => {
        player.pointsScored = null;
        player.gameRank = win ? 1 : 2;
        return player;
      });

    test("trophies for all for a cooperative win", () => {
      expect(Play.createPlayers(cooperativePlayers(true))).toEqual({
        name: "Players",
        value:
          ":trophy: Luke, :trophy: Darth, :trophy: R2-D2, :trophy: Jar-Jar",
      });
    });

    test("no trophies for a cooperative loss", () => {
      expect(Play.createPlayers(cooperativePlayers(false))).toEqual({
        name: "Players",
        value: "Luke, Darth, R2-D2, Jar-Jar",
      });
    });
  });

  describe("getThumbnail", () => {
    beforeEach(() => {
      moxios.install();
    });

    afterEach(() => {
      moxios.uninstall();
    });

    test("returns a valid thumb URL for a known game", () => {
      return new Promise((done) => {
        moxios.stubRequest(
          /https:\/\/www.boardgamegeek.com\/xmlapi2\/thing.*/,
          {
            status: 200,
            responseText: `<items><item><thumbnail>${thumbUrl}</thumbnail></item></items>`,
          }
        );
        moxios.wait(() => {
          Play.getThumbnail(187645).then((url) => {
            expect(url).toBe(thumbUrl);
            done();
          });
        });
      });
    });

    test("returns an error for an invalid URL", () => {
      return new Promise((done) => {
        global.console = { error: jest.fn() };
        moxios.stubRequest(
          /https:\/\/www.boardgamegeek.com\/xmlapi2\/thing.*/,
          {
            status: 400,
            responseText: "Problem",
          }
        );
        expect.assertions(1);
        moxios.wait(() => {
          Play.getThumbnail(187645).then(() => {
            expect(console.error).toHaveBeenCalled();
            done();
          });
        });
      });
    });
  });

  describe("createAttachment", () => {
    test("creates expected attachments array", () => {
      expect(Play.createAttachment(play, thumbUrl)).toEqual(attachments);
    });
  });

  describe("getAttachment", () => {
    beforeEach(() => {
      moxios.install();

      moxios.stubRequest(/https:\/\/www.boardgamegeek.com\/xmlapi2\/thing.*/, {
        status: 200,
        responseText: `<items><item><thumbnail>${thumbUrl}</thumbnail></item></items>`,
      });
    });

    afterEach(() => {
      moxios.uninstall();
    });

    test("returns full attachments array", () => {
      return new Promise((done) => {
        moxios.wait(() => {
          Play.getAttachment(play).then((attachments) => {
            expect(attachments).toEqual(attachments);
            done();
          });
        });
      });
    });
  });
});
