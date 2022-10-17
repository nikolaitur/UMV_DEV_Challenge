module.exports = (app) => {
  const tracks = require("../controllers/track.controller.js");

  var router = require("express").Router();

  // Create a new Track
  router.post("/", tracks.verifyToken, tracks.create);

  app.use("/api/tracks", router);
};
