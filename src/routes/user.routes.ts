import { getUser } from "../controllers/user.controller";

const express = require("express");

const router = express.Router();

router.get("/:userId", getUser);

module.exports = router;
