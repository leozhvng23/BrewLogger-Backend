const { check } = require("express-validator");
const Router = require("express-promise-router");

const recipesController = require("../controllers/recipes-controllers");

const router = new Router();

module.exports = router;

const recipeValidation = [
	check("uid").not().isEmpty(),
	check("name").not().isEmpty(),
	check("description").not().isEmpty(),
	check("brew_time").not().isEmpty(),
	check("yield").isFloat(),
	check("guide").not().isEmpty(),
	check("type").not().isEmpty(),
	check("photo_url").isURL(),
	check("bid").not().isEmpty(),
	check("bid").isNumeric(),
	check("bean_amount").not().isEmpty(),
	check("bean_amount").isNumeric(),
	check("eid_brewer").not().isEmpty(),
	check("eid_brewer").isNumeric(),
	check("eid_grinder").not().isEmpty(),
	check("eid_grinder").isNumeric(),
];




router.get("/popular/", recipesController.getPopularRecipes)

router.get("/feed/:uid", recipesController.getFeedRecipes);

router.get("/bean/:bid", recipesController.getRecipesByBeanId);

router.get("/user/:uid", recipesController.getRecipesByUserId);

router.get("/favorites/:uid", recipesController.getFavoriteRecipes); // delete :uid

router.get("/:id", recipesController.getRecipeById);

router.get("/", recipesController.getAllRecipes);

router.get("/favorite/ids", recipesController.getFavoriteIds);

router.get("/like/ids", recipesController.getLikedIds);

router.post("/likes/:id", recipesController.likeRecipe)

router.post("/favorites/:id", recipesController.addFavorite);

router.post("/", recipeValidation, recipesController.createRecipe);

router.patch("/:id", recipeValidation, recipesController.updateRecipe);

router.delete("/favorites/:id", recipesController.removeFavorite);

router.delete("/likes/:id", recipesController.unlikeRecipe)

router.delete("/:id", recipesController.deleteRecipe);


