const express = require("express");
const router = express.Router();
const controller = require("../controllers/controllers");

// Define routes for the talks API
router.get("/talks", controller.listConf);
router.get('/talks/speaker/:term', controller.listOneSpeaker);
router.get('/talks/session/:term', controller.listSession);
router.get('/talks/time/:term', controller.listTime);
router.get('/talks/:speaker/rating', controller.listRatingsBySpeaker);
router.get('/talks/:id/ratingById', controller.listRatingsById);

// Use POST for the rateTalkById route
router.post('/talks/rate/:id/:rating', controller.rateTalkById);

// Posts endpoint
router.post('/posts', controller.handlePosts);

// 404 Error Handler
router.use(function (req, res) {
  res.status(404);
  res.type("text/plain");
  res.send("404 Not found.");
});

// 500 Internal Server Error Handler
router.use(function (err, req, res, next) {
  res.status(500);
  res.type("text/plain");
  res.send("Internal Server Error.");
});

module.exports = router;
