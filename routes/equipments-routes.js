const { check } = require("express-validator");
const Router = require("express-promise-router");

const equipmentsController = require("../controllers/equipments-controllers");

const router = new Router();

module.exports = router;

router.get("/brewers/", equipmentsController.getAllBrewersNames);
router.get("/grinders/", equipmentsController.getAllGrindersNames);