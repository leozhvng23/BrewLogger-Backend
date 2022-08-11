const { validationResult } = require("express-validator");
const db = require("../db");

const uid = 6

const getCommentsByRecipeId = async (req, res, next) => {
	const queryText = `
        SELECT 
            comment_posted.cid as cid,
            users.name as user_name,
            users.uid as uid,    
            comment_posted.time as posted_on,
            comment_posted.content as content,
            likes.count :: int AS num_of_likes,
            isLiked.count as is_liked
        FROM recipes
            JOIN comment_posted USING(id)
            JOIN users USING(uid)
            LEFT JOIN (
                SELECT cid, 
                    COUNT(*) AS count
                FROM like_comment
                GROUP BY cid
            ) AS likes USING(cid)
            LEFT JOIN (
                SELECT cid,
                    COUNT(*) AS count
                FROM like_comment 
                WHERE uid = $2
                GROUP BY cid
            ) as isLiked USING(cid)
        WHERE recipes.id = $1
        ORDER BY comment_posted.time desc
	`;
	let result;
	try {
		result = await db.query(queryText, [req.params.id, uid]);
	} catch (err) {
		return next(new Error("Fetching comments failed, please try again later."));
	}

	if (!result.rows || result.rows.length === 0) {
		return next(new Error("Could not find comments for the provided recipe id."));
	}
	res.send(result.rows);	
}


exports.getCommentsByRecipeId = getCommentsByRecipeId