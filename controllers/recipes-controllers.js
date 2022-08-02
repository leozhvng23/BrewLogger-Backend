const { validationResult } = require("express-validator");
const db = require("../db");

const getAllRecipes = async (req, res, next) => {
	let result;
	try {
		result = await db.query("SELECT * FROM recipes", []);
	} catch (err) {
		return next(new Error("Fetching recipes failed, please try again later."));
	}
	res.send(result.rows);
};

const getRecipeById = async (req, res, next) => {
	const { rid } = req.body;
	let result;
	try {
		result = await db.query("SELECT * FROM recipes WHERE id = $1 ", [rid]);
	} catch (err) {
		return next(new Error("Fetching recipe failed, please try again later."));
	}

	if (!result.rows[0]) {
		return next(new Error("Could not find a recipe for the provided rid."));
	}
	res.send(result.rows[0]);
};

const getRecipesByUserId = async (req, res, next) => {
	const { uid } = req.body;
	let result;
	try {
		result = await db.query(
			`SELECT recipes.id AS id, 
                recipes.name AS name, 
                recipes.photo_url AS photo_url, 
                recipes.type AS type,
                recipes.brew_time as brew_time,
                equipments.name AS brewer 
            FROM recipes, make, requires_equipment, equipments 
            WHERE make.uid = $1 
                AND make.id = recipes.id 
                AND requires_equipment.id = recipes.id 
                AND equipments.eid = requires_equipment.eid 
                AND equipments.brewer = 1`,
			[uid]
		);
	} catch (err) {
		return next(new Error("Fetching recipes failed, please try again later."));
	}

	if (!result.rows || result.rows.length === 0) {
		return next(new Error("Could not find recipes for the provided user id."));
	}

	res.send(result.rows);
};

const createRecipe = async (req, res, next) => {
	const errors = validationResult(req);
	console.log(errors);
	if (!errors.isEmpty()) {
		return next(new Error("Invalid inputs passed, please check your data."));
	}
	const {
		uid,
		name,
		description,
		brew_time,
		guide,
		yield,
		type,
		photo_url,
		bid,
		bean_amount,
		eid_brewer,
		eid_grinder,
		setting_brewer,
		setting_grinder,
	} = req.body;

	let result;
	try {
		result = await db.query("SELECT * FROM users WHERE uid = $1", [uid]);
	} catch (err) {
		return next(new Error("Creating recipe failed, please try again later"));
	}

	if (!result.rows[0]) {
		return next(new Error("Could not find user for provided uid."));
	}

	const client = await db.getClient();

	try {
		await client.query("BEGIN");
		const queryText = `
        INSERT INTO RECIPES(name, brew_time, yield, description, guide, photo_url, type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id`;
		const queryValues = [name, brew_time, yield, description, guide, photo_url, type];
		const res = await client.query(queryText, queryValues);
		const recipeId = res.rows[0].id;
		console.log(recipeId);

		await client.query(
			"INSERT INTO requires_bean(bid, id, amount) VALUES ($1, $2, $3)",
			[bid, recipeId, bean_amount]
		);
		await client.query(
			"INSERT INTO requires_equipment(eid, id, setting) VALUES ($1, $2, $3)",
			[eid_brewer, recipeId, setting_brewer]
		);
		await client.query(
			"INSERT INTO requires_equipment(eid, id, setting) VALUES ($1, $2, $3)",
			[eid_grinder, recipeId, setting_grinder]
		);
		await client.query("INSERT INTO make(uid, id, time) VALUES ($1, $2, NOW())", [
			uid,
			recipeId,
		]);
		await client.query("COMMIT");
	} catch (err) {
		await client.query("ROLLBACK");
		return next(new Error("Creating recipe failed, please try again later."));
	} finally {
		client.release();
	}

	res.send(result.rows[0]);
};

exports.getAllRecipes = getAllRecipes;
exports.getRecipeById = getRecipeById;
exports.getRecipesByUserId = getRecipesByUserId;
exports.createRecipe = createRecipe;
