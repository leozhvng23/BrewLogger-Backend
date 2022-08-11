const { check } = require("express-validator");
const Router = require("express-promise-router");

const commentsController = require("../controllers/comments-controllers");

const router = new Router();

module.exports = router;


router.get("/recipe/:id", commentsController.getCommentsByRecipeId);
