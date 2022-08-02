const { check } = require('express-validator');
const Router = require('express-promise-router');

const usersController = require("../controllers/users-controllers");

const router = new Router();

module.exports = router;

router.get("/", usersController.getUsers);

router.post(
	"/signup",
	[
		check("name").not().isEmpty(),
        check("bio").not().isEmpty(),
		check("email")
			.normalizeEmail() // Test@test.com => test@test.com
			.isEmail(),
		check("password").isLength({ min: 5 }),
	],
	usersController.signup
);

router.post("/login", usersController.login);


