const { check } = require("express-validator");
const Router = require("express-promise-router");

const commentsController = require("../controllers/comments-controllers");

const router = new Router();

module.exports = router;

const commentValidation = [
    check("id").not.isEmpty(),
	check("content").not.isEmpty()
];

router.get("/recipe/:id", commentsController.getCommentsByRecipeId);
router.post("/", commentValidation, commentsController.postComment)
