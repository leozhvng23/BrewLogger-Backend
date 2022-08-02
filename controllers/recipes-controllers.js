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
	let result;
	try {
		result = await db.query("SELECT * FROM recipes WHERE id = $1 ", [req.params.rid]);
	} catch (err) {
		return next(new Error("Fetching recipe failed, please try again later."));
	}

	if (!result.rows[0]) {
		return next(new Error("Could not find a recipe for the provided rid."));
	}
	res.send(result.rows[0]);
};

const getRecipesByUserId = async (req, res, next) => {
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
                AND equipments.type = 'brewer'`,
			[req.params.uid]
		);
	} catch (err) {
		return next(new Error("Fetching recipes failed, please try again later."));
	}

	if (!result.rows || result.rows.length === 0) {
		return next(new Error("Could not find recipes for the provided user id."));
	}

	res.send(result.rows);
};

const getRecipesByBeanId = async (req, res, next) => {
	let result;
	try {
		result = await db.query(
			`SELECT recipes.id AS id, 
                recipes.name AS name, 
                recipes.photo_url AS photo_url, 
                recipes.type AS type,
                recipes.brew_time as brew_time,
                equipments.name AS brewer 
            FROM recipes, requires_bean, requires_equipment, equipments 
            WHERE requires_bean.bid = $1 
                AND requires_bean.id = recipes.id 
                AND requires_equipment.id = recipes.id 
                AND equipments.eid = requires_equipment.eid 
                AND equipments.type = 'brewer'`,
			[req.params.bid]
		);
	} catch (err) {
		return next(new Error("Fetching recipes failed, please try again later."));
	}

	if (!result.rows || result.rows.length === 0) {
		return next(new Error("Could not find recipes for the provided bean id."));
	}

	res.send(result.rows);
};

const getFavoriteRecipes = async (req, res, next) => {
	let result;
	try {
		result = await db.query(
			`SELECT recipes.id AS id, 
                recipes.name AS name, 
                recipes.photo_url AS photo_url, 
                recipes.type AS type,
                recipes.brew_time as brew_time,
                equipments.name AS brewer 
            FROM recipes, saves, requires_equipment, equipments 
            WHERE saves.uid = $1 
                AND saves.id = recipes.id 
                AND requires_equipment.id = recipes.id 
                AND equipments.eid = requires_equipment.eid 
                AND equipments.type = 'brewer'`,
			[req.params.uid]
		);
	} catch (err) {
		return next(new Error("Fetching recipes failed, please try again later."));
	}

	if (!result.rows || result.rows.length === 0) {
		return next(
			new Error("Could not find favorite recipes for the provided user id.")
		);
	}

	res.send(result.rows);
};

const addFavorite = async (req, res, next) => {
	const errors = validationResult(req);
	console.log(errors);
	if (!errors.isEmpty()) {
		return next(new Error("Invalid params passed."));
	}

	const { uid, id } = req.body;

	let result;
	try {
		result = await db.query("INSERT INTO saves(uid, id) VALUES ($1, $2) RETURNING *", [uid, id]);
	} catch (err) {
		return next(new Error("Adding favorite failed, please try again later"));
	}
	res.json({ message: "Removed from favorites.", record: result.rows})
};

const removeFavorite = async (req, res, next) => {
	const { uid, id } = req.body;

	let result;
	try {
		result = await db.query("SELECT FROM saves WHERE uid = $1 and id = $2", [uid, id]);
	} catch (err) {
		return next(new Error("Removing favorite failed, please try again later"));
	}

	if (!result.rows[0]) {
		return next(new Error("Could not find favorite record for provided user id and recipe id."));
	}

	try {
		result = await db.query("DELETE FROM saves WHERE uid = $1 and id = $2", [uid, id]);
	} catch (err) {
		return next(new Error("Removing favorite failed, please try again later"));
	}	

	res.json({ message: "Removed from favorites."})
}

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
exports.getRecipesByBeanId = getRecipesByBeanId;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.addFavorite = addFavorite;
exports.removeFavorite = removeFavorite;
exports.createRecipe = createRecipe;
