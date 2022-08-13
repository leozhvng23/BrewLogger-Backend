const express = require("express");
const mountRoutes = require("./routes");

const app = express();
mountRoutes(app);

console.log("Database_URL", process.env.DATABASE_URL);


app.listen(process.env.PORT || 5000, 
	() => console.log("Server is running..."));