const { validationResult } = require("express-validator");
const db = require("../db");

const getAllBrewersNames = async (req, res, next) => {
    const queryText = `
        SELECT eid, name, brand
        FROM equipments
        WHERE type = 'brewer'
    `
	let result;
	try {
		result = await db.query(queryText, []);
	} catch (err) {
		return next(new Error("Fetching brewers failed, please try again later."));
	}
	res.send(result.rows);
};

const getAllGrindersNames = async (req, res, next) => {
    const queryText = `
        SELECT eid, name, brand
        FROM equipments
        WHERE type = 'grinder'
    `
	let result;
	try {
		result = await db.query(queryText, []);
	} catch (err) {
		return next(new Error("Fetching grinders failed, please try again later."));
	}
	res.send(result.rows);
};

exports.getAllBrewersNames = getAllBrewersNames;
exports.getAllGrindersNames = getAllGrindersNames;
