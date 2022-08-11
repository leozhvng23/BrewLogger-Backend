const { validationResult } = require("express-validator");
const db = require("../db");

const getCommentsByRecipeId = async (req, res, next) => {
	const queryText = `
		SELECT users.name as user_name,
			users.uid as uid,
			comment_posted.time as posted_on,
			comment_posted.content as content,
			likes.count AS num_of_likes
		FROM recipes
			JOIN comment_posted USING(id)
			JOIN users USING(uid)
			LEFT JOIN (
				SELECT cid, 
					COUNT(*) AS count
				FROM like_comment
				GROUP BY cid
			) AS likes USING(cid)
		WHERE recipes.id = $1
		ORDER BY comment_posted.time desc
	`;
	let result;
	try {
		result = await db.query(queryText, [req.params.id]);
	} catch (err) {
		return next(new Error("Fetching comments failed, please try again later."));
	}

	if (!result.rows || result.rows.length === 0) {
		return next(new Error("Could not find comments for the provided recipe id."));
	}
	res.send(result.rows);	
}


exports.getCommentsByRecipeId = getCommentsByRecipeId