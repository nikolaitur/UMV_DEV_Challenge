const request = require("request");

const db = require("../models");
const Track = db.tracks;
const Artist = db.artists;
const Op = db.Sequelize.Op;

const spotify_client_id = "8209293ddf804ef6af53cedaf26540b1";
const spotify_client_secret = "89c9543fbcfc4dca8961b3ea13d0a2b0";

// Create and Save a new Track
exports.create = (req, res) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) res.sendStatus(403);
    else {
      // Validate request

      if (!req.body.isrc) {
        res.status(400).send({
          message: "ISRC can not be empty!",
        });
        return;
      }

      var authOptions = {
        url: "https://accounts.spotify.com/api/token",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              spotify_client_id + ":" + spotify_client_secret
            ).toString("base64"),
        },
        form: {
          grant_type: "client_credentials",
        },
        json: true,
      };

      request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          var token = body.access_token;
          console.log(token);
          request.get(
            {
              url: "https://api.spotify.com/v1/search",
              headers: {
                Authorization: "Bearer " + token,
              },
              qs: {
                q: "isrc:" + req.body.isrc,
                type: "track",
              },
              json: true,
            },
            function (error, response, body) {
              if (!error && response.statusCode === 200) {
                if (response.body.tracks.total !== 0) {
                  const tracks = response.body.tracks.items;
                  const track = tracks.sort(
                    (a, b) => a.popularity > b.popularity
                  )[0];

                  const trackItem = {
                    ISRC: req.body.isrc,
                    title: track.name,
                    SpotifyImageURI: track.album.images[0].url,
                  };

                  isISRCUnique(trackItem.ISRC).then((isUnique) => {
                    if (isUnique) {
                      Track.create(trackItem)
                        .then((data) => {
                          let artistItems = track.artists.map((artist) => {
                            return {
                              trackId: data.dataValues.id,
                              name: artist.name,
                            };
                          });

                          Artist.bulkCreate(artistItems)
                            .then((data) => {
                              res.status(201).send({
                                message: "Successfully created a Track record",
                              });
                            })
                            .catch((err) => {
                              res.status(500).send({
                                message:
                                  err.message ||
                                  "Some error occurred while creating the Track.",
                              });
                            });
                        })
                        .catch((err) => {
                          res.status(500).send({
                            message:
                              err.message ||
                              "Some error occurred while creating the Track.",
                          });
                        });
                    } else {
                      res.status(200).send({
                        message: "ISRC entry already exists",
                      });
                      return;
                    }
                  });
                } else {
                  res.status(200).send({
                    message: "No tracks found",
                  });
                  return;
                }
              } else {
                res.status(500).send({
                  message:
                    "Something went wrong while fetching meta data from Spotify API",
                });
                return;
              }
            }
          );
          return;
        } else {
          res.status(500).send({
            message: "Spotify Authentication Failed",
          });
          return;
        }
      });
    }
  });
};

// Retrieve a single Track by ISRC from the database.
exports.findByISRC = (req, res) => {
  const isrc = req.params.isrc;
  var condition = isrc ? { isrc: isrc } : null;

  Track.findAll({
    where: condition,
    include: [{ model: Artist, attributes: ["name"] }],
  })
    .then((data) => {
      if (data.length) {
        res.send(data[0]);
      } else {
        res.send({
          message: "No entry found",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving an track by ISRC.",
      });
    });
};

// Find Tracks by artist name
exports.findByArtist = (req, res) => {
  const name = req.query.name;
  var condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  Track.findAll({
    include: [{ model: Artist, attributes: ["name"], where: condition }],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving an track by artist name.",
      });
    });
};
