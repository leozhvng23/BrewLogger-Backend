const { validationResult } = require("express-validator");
const db = require("../db");

const getUsers = async (req, res, next) => {
	let result;
	try {
		result = await db.query("SELECT * FROM users", []);
	} catch (err) {
		return next(new Error("Fetching users failed, please try again later."));
	}
	res.send(result.rows);
};

const signup = async (req, res, next) => {
	const errors = validationResult(req);
    console.log(errors);
	if (!errors.isEmpty()) {
		return next(new Error("Invalid inputs passed, please check your data."));
	}
	const { email, bio, name, password } = req.body;

	let result;
	try {
		result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
	} catch (err) {
		return next(new Error("Signing up failed, please try again later"));
	}

	if (result.rows[0]) {
		return next(new Error("User exists already, please login instead."));
	}

	try {
		result = await db.query(
			"insert into users(email, bio, name, password) values($1, $2, $3, $4) RETURNING *",
			[email, bio, name, password]
		);
	} catch (err) {
		return next(new Error("User exists already, please log in instead"));
	}

	res.send(result.rows[0]);
};

const login = async (req, res, next) => {
	const { email, password } = req.body;

	let result;
	try {
		result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
	} catch (err) {
		return next(new Error("Logging in failed, please try again later."));
	}

	const existingUser = result.rows[0];
	if (!existingUser || existingUser.password !== password) {
		return next(new Error("Invalid credentials."));
	}

	res.json({ message: "Logged in!", user: existingUser.name });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
