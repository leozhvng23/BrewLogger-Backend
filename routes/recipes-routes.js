const { check } = require("express-validator");
const Router = require("express-promise-router");

const recipesController = require("../controllers/recipes-controllers");

const router = new Router();

module.exports = router;

router.get("/", recipesController.getAllRecipes);

router.get("/:rid", recipesController.getRecipeById);

router.get("/user/:uid", recipesController.getRecipesByUserId);

const recipeValidation = [
	check("name").not().isEmpty(),
	check("description").not().isEmpty(),
	check("brew_time").not().isEmpty(),
	check("yield").isFloat(),
	check("guide").not().isEmpty(),
	check("espresso_coffee").isNumeric({ min: 0, max: 1 }),
	check("espresso_coffee").not().isEmpty(),
	check("filter_coffee").isNumeric({ min: 0, max: 1 }),
	check("filter_coffee").not().isEmpty(),
	check("photo_url").isURL(),
	check("bid").not().isEmpty(),
	check("bid").isNumeric(),
	check("bean_amount").not().isEmpty(),
	check("bean_amount").isNumeric(),
];

router.post("/", recipeValidation, recipesController.createRecipe);

router.patch("/:pid", recipeValidation, recipesController.updateRecipe);

router.delete("/:pid", recipesController.deleteRecipe);