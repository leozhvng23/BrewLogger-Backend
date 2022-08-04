const { validationResult } = require("express-validator");
const db = require("../db");

const getAllBeansNames = async (req, res, next) => {
	const queryText = `
        SELECT bean_roasts.bid,
            bean_roasts.name as name, 
            roasters.name as roaster_name,
            roasters.rid as rid
        FROM bean_roasts 
        JOIN roasters USING (rid)
    `;
	let result;
	try {
		result = await db.query(queryText, []);
	} catch (err) {
		return next(new Error("Fetching beans failed, please try again later."));
	}
	res.send(result.rows);
};

exports.getAllBeansNames = getAllBeansNames;
