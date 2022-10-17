module.exports = (sequelize, Sequelize) => {
  const Track = sequelize.define("track", {
    ISRC: {
      type: Sequelize.STRING,
    },
    title: {
      type: Sequelize.STRING,
    },
    SpotifyImageURI: {
      type: Sequelize.STRING,
    },
  });

  return Track;
};
