const { check } = require("express-validator");
const Router = require("express-promise-router");

const beansController = require("../controllers/beans-controllers");

const router = new Router();

module.exports = router;

router.get("/", beansController.getAllBeansNames);