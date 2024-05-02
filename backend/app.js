const rocksRoutes = require("./routes/rocks-routes");
const usersRoutes = require("./routes/users-routes");
// Importer le gestionnaire d'erreurs
const errorHandler = require("./handler/error-handler");

// CODE AJOUTÉ ——————————————————————————————
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const uri =
	"mongodb+srv://hector_admin:1Fuck1ngL0v3R0cks@hector.lnv1yey.mongodb.net/?retryWrites=true&w=majority&appName=hector";

//Parse le code entrant pour ajouter une propriété body sur la request
app.use(express.json());

// ce middleware ne rtourne pas de reponse mais va ajoute run header
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*"); // header et value * quels domaines peuvent acceder a notre serveur
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	); //quel header sont autorisés ( pourait etre * pour tout)
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE"); // quelles methodes HTTP sont autorisées
	next();
});

app.use("/api/v1/rocks", rocksRoutes);

app.use("/api/v1/users", usersRoutes);

app.use((req, res, next) => {
	const error = new Error("Not found");
	error.code = 404;
	next(error);
});

app.use(errorHandler);

mongoose
	.connect(uri)
	.then(() => {
		console.log("connexion BD réussie!");
		app.listen(5000);
	})
	.catch(() => {
		console.log("connexion BD échouée...");
	});
