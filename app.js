const express = require("express");
const mountRoutes = require("./routes");

const app = express();
mountRoutes(app);

app.listen(process.env.PORT || 5000, 
	() => console.log("Server is running..."));