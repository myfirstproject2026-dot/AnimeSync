const express = require("express");

const {
  search,
  explore
} = require("../controllers/discovery.controller");

const router = express.Router();

router.get("/search", search);
router.get("/explore", explore);

module.exports = router;
