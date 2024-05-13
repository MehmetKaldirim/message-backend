const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/user_controller");

const router = express.Router();

router.get("/", usersController.getUsers);
// GET /users/uid
router.get("/:uid", usersController.getUserById);

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.signup
);

router.post("/login", usersController.login);

module.exports = router;
