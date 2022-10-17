module.exports = (app) => {
  const tracks = require("../controllers/track.controller.js");

  var router = require("express").Router();

  // Create a new Track
  router.post("/", tracks.verifyToken, tracks.create);

  // Retrieve a Track by ISRC
  router.get("/isrc/:isrc", tracks.verifyToken, tracks.findByISRC);

  // Retrieve a Track by artist
  router.get("/artist", tracks.verifyToken, tracks.findByArtist);

  app.use("/api/tracks", router);
};
