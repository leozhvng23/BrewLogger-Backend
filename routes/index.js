const bodyParser = require("body-parser");
const usersRoutes = require("./users-routes");
const recipesRoutes = require("./recipes-routes");

module.exports = (app) => {
	app.use(bodyParser.json());

	// handling CORS error
	app.use((req, res, next) => {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept, Authorization"
		);
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

		next();
	});

    app.use("/api/users", usersRoutes);
	app.use("/api/recipes", recipesRoutes);

	app.use((req, res, next) => {
		throw new Error("Could not find this route.");
	});

	app.use((error, req, res, next) => {
		if (res.headerSent) {
			return next(error);
		}
		res.status(error.code || 500);
		res.json({ message: error.message || "An unknown error occurred!" });
	});

	
	// app.use("/recipes", recipesRoutes);

    // app.listen(5500);
};
