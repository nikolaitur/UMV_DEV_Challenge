module.exports = (app) => {
  const tracks = require("../controllers/track.controller.js");

  var router = require("express").Router();

  // Create a new Track
  router.post("/", tracks.verifyToken, tracks.create);

  // Retrieve a track by ISRC
  router.get("/isrc/:isrc", tracks.verifyToken, tracks.findByISRC);

  // Retrieve tracks by artist name
  router.get("/artist", tracks.verifyToken, tracks.findByArtist);

  // Get Oauth Bearer token
  router.get("/token", tracks.getToken);

  app.use("/api/tracks", router);
};
