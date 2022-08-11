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

const getPopularRecipes = async (req, res, next) => {
	const queryText = `
	SELECT recipes.id AS id, 
			recipes.name AS name, 
			recipes.description AS description,
			recipes.photo_url AS photo_url, 
			recipes.type AS type,
            recipes.brew_time AS brew_time,
			bean_roasts.name AS bean_name,
			bean_roasts.bid AS bid,
			users.name AS user_name,
			users.uid AS uid,
			make.time AS created_on,
			brewers.name AS brewer,
			brewers.eid AS brewer_eid,
			comments.count AS num_of_comments,
			likes.count AS num_of_likes
		FROM recipes 
			join make using(id)
			join users using (uid)
			join requires_bean using (id)
			join bean_roasts using (bid)
			join requires_brewer using(id)
			join equipments brewers on brewers.eid = requires_brewer.eid
			left join (
					SELECT id, count(*) AS count 
					FROM comment_posted 
					GROUP BY id
				) AS comments USING(id)
			left join (
					SELECT id, count(*) AS count 
					FROM like_recipe 
					GROUP BY id
					) AS likes USING(id) 
		ORDER BY num_of_likes desc NULLS LAST
        LIMIT 5`

	let result;
	try {
		result = await db.query(queryText, []);
	} catch (err) {
		return next(new Error("Fetching popular recipes failed, please try again later."));
	}
	res.send(result.rows);

};

const getFeedRecipes = async (req, res, next) => {
	const queryText = `
		SELECT recipes.id AS id, 
			recipes.name AS name, 
			recipes.description AS description,
			recipes.photo_url AS photo_url, 
			recipes.type AS type,
			bean_roasts.name AS bean_name,
			bean_roasts.bid AS bid,
			users.name AS user_name,
			users.uid AS uid,
			make.time AS created_on,
			brewers.name AS brewer,
			brewers.eid AS brewer_eid,
			comments.count AS num_of_comments,
			likes.count AS num_of_likes
		FROM recipes 
			join make using(id)
			join users using (uid)
			join follow on follow.uid_2 = users.uid
			join requires_bean using (id)
			join bean_roasts using (bid)
			join requires_brewer using(id)
			join equipments brewers on brewers.eid = requires_brewer.eid
			left join (
					SELECT id, count(*) AS count 
					FROM comment_posted 
					GROUP BY id
				) AS comments USING(id)
			left join (
					SELECT id, count(*) AS count 
					FROM like_recipe 
					GROUP BY id
					) AS likes USING(id) 
		WHERE follow.uid_1 = $1
		ORDER BY created_on desc
		`

	let result;
	try {
		result = await db.query(queryText, [req.params.uid]);
	} catch (err) {
		return next(new Error("Fetching recipes failed, please try again later."));
	}

	if (!result.rows || result.rows.length === 0) {
		return next(new Error("Could not find recipes for the provided user id."));
	}

	res.send(result.rows);
};

const getRecipeById = async (req, res, next) => {
	const queryText = `
		SELECT recipes.id AS id, 
			recipes.name AS name, 
			recipes.description AS description,
			recipes.photo_url AS photo_url, 
			recipes.type AS type,
			recipes.yield AS yield,
			recipes.brew_time as brew_time,
			recipes.guide as guide,
			bean_roasts.name as bean_name,
			bean_roasts.bid as bid,
			users.name as user_name,
			users.uid as uid,
			make.time as created_on,
			brewers.name as brewer,
			brewers.eid as brewer_eid,
			grinders.eid as grinder_eid,
			requires_brewer.setting as brewer_setting,
			requires_grinder.setting as grinder_setting,
			grinders.name as grinder,
			comments.count AS num_of_comments,
			likes.count AS num_of_likes
		FROM recipes 
			left join make using (id)
			left join users using (uid)
			left join requires_bean using (id)
			left join bean_roasts using (bid)
			left join requires_brewer using(id)
			left join requires_grinder using(id)
			left join equipments brewers on brewers.eid = requires_brewer.eid
			left join equipments grinders on grinders.eid = requires_grinder.eid
			left join (
					SELECT id, count(*) AS count 
					FROM comment_posted 
					GROUP BY id
				) AS comments USING(id)
			left join (
					SELECT id, count(*) AS count 
					FROM like_recipe 
					GROUP BY id
				) AS likes USING(id) 
		WHERE recipes.id = $1`;

	let result;
	try {
		result = await db.query(queryText, [req.params.id]);
	} catch (err) {
		return next(new Error("Fetching recipe failed, please try again later."));
	}

	if (!result.rows[0]) {
		return next(new Error("Could not find a recipe for the provided recipe id."));
	}
	res.send(result.rows[0]);
};

const getRecipesByUserId = async (req, res, next) => {
	const queryText = `
	SELECT recipes.id AS id, 
		recipes.name AS name, 
		recipes.description AS description,
		recipes.photo_url AS photo_url, 
		recipes.type AS type,
		recipes.yield AS yield,
		recipes.brew_time as brew_time,
		recipes.guide as guide,
		bean_roasts.name as bean_name,
		bean_roasts.bid as bid,
		users.name as user_name,
		users.uid as uid,
		make.time as created_on,
		brewers.name as brewer,
		brewers.eid as brewer_eid,
		grinders.eid as grinder_eid,
		requires_brewer.setting as brewer_setting,
		requires_grinder.setting as grinder_setting,
		grinders.name as grinder,
		comments.count AS num_of_comments,
		likes.count AS num_of_likes
	FROM recipes 
		left join make using (id)
		left join users using (uid)
		left join requires_bean using (id)
		left join bean_roasts using (bid)
		left join requires_brewer using(id)
		left join requires_grinder using(id)
		left join equipments brewers on brewers.eid = requires_brewer.eid
		left join equipments grinders on grinders.eid = requires_grinder.eid
		left join (
			SELECT id, count(*) AS count 
			FROM comment_posted 
			GROUP BY id
		) AS comments USING(id)
		left join (
				SELECT id, count(*) AS count 
				FROM like_recipe 
				GROUP BY id
			) AS likes USING(id) 
	WHERE users.uid = $1`;

	let result;
	try {
		result = await db.query(queryText, [req.params.uid]);
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
		result = await db.query(
			"INSERT INTO saves(uid, id) VALUES ($1, $2) RETURNING *",
			[uid, id]
		);
	} catch (err) {
		return next(new Error("Adding favorite failed, please try again later"));
	}
	res.json({ message: "Added to favorites.", record: result.rows });
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
		console.log("created recipe id: " + recipeId);

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

	res.json({ message: "New recipe created!" });
};

const updateRecipe = async (req, res, next) => {
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
		result = await db.query("SELECT * FROM make WHERE uid = $1 AND id = $2", [
			uid,
			req.params.id,
		]);
	} catch (err) {
		return next(new Error("Updating recipe failed, please try again later"));
	}

	if (!result.rows[0]) {
		return next(
			new Error("Could not find recipe record for provided user id and recipe id.")
		);
	}
	const start = Date.now();
	const client = await db.getClient();
	try {
		await client.query("BEGIN");
		const queryText =
			"UPDATE recipes SET name = $1, brew_time = $2, yield = $3, description = $4, guide = $5, photo_url = $6, type = $7 WHERE id = $8";
		const queryValues = [
			name,
			brew_time,
			yield,
			description,
			guide,
			photo_url,
			type,
			req.params.id,
		];
		await client.query(queryText, queryValues);
		console.log("updated recipes");
		await client.query(
			"UPDATE requires_bean SET bid = $1, amount = $2 WHERE id = $3",
			[bid, bean_amount, req.params.id]
		);
		console.log("updated requires_beans");

		await client.query("DELETE FROM requires_equipment WHERE id = $1", [
			req.params.id,
		]);
		console.log("Delete data from requires_equipments");
		await client.query(
			"INSERT INTO requires_equipment(eid, id, setting) VALUES ($1, $2, $3)",
			[eid_brewer, req.params.id, setting_brewer]
		);
		console.log("updated brewer in requires_equipment");
		await client.query(
			"INSERT INTO requires_equipment(eid, id, setting) VALUES ($1, $2, $3)",
			[eid_grinder, req.params.id, setting_grinder]
		);
		console.log("updated grinder in requires_equipment");
		await client.query("COMMIT");
		console.log("update complete");
	} catch (err) {
		await client.query("ROLLBACK");
		return next(new Error("Updating recipe failed, please try again later."));
	} finally {
		client.release();
		console.log("executed queries in " + (Date.now() - start));
	}

	res.json({ message: "Recipe updated!" });
};

const removeFavorite = async (req, res, next) => {
	const { uid, id } = req.body;

	let result;
	try {
		result = await db.query("SELECT * FROM saves WHERE uid = $1 and id = $2", [
			uid,
			id,
		]);
	} catch (err) {
		return next(new Error("Removing favorite failed, please try again later"));
	}

	if (!result.rows[0]) {
		return next(
			new Error(
				"Could not find favorite record for provided user id and recipe id."
			)
		);
	}

	try {
		result = await db.query("DELETE FROM saves WHERE uid = $1 and id = $2", [
			uid,
			id,
		]);
	} catch (err) {
		return next(new Error("Removing favorite failed, please try again later"));
	}

	res.json({ message: "Removed from favorites." });
};

const deleteRecipe = async (req, res, next) => {
	let result;
	try {
		result = await db.query("SELECT * FROM recipes WHERE id = $1", [req.params.id]);
	} catch (err) {
		return next(new Error("Removing recipe failed, please try again later"));
	}

	if (!result.rows[0]) {
		return next(new Error("Could not find recipe for provided recipe id."));
	}

	try {
		result = await db.query("DELETE FROM recipes WHERE id = $1", [req.params.id]);
	} catch (err) {
		return next(new Error("Removing recipe failed, please try again later"));
	}

	res.json({ message: "Deleted recipe." });
};

exports.getAllRecipes = getAllRecipes;
exports.getRecipeById = getRecipeById;
exports.getPopularRecipes = getPopularRecipes;
exports.getFeedRecipes = getFeedRecipes;
exports.getRecipesByUserId = getRecipesByUserId;
exports.getRecipesByBeanId = getRecipesByBeanId;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.addFavorite = addFavorite;
exports.createRecipe = createRecipe;
exports.updateRecipe = updateRecipe;
exports.removeFavorite = removeFavorite;
exports.deleteRecipe = deleteRecipe;
