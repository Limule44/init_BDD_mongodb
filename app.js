// Importer le module express
const express = require('express');
// Importer le module mongoose
const mongoose = require('mongoose');

// ================================================
// Connexion à la base de données
// ================================================
// Quand je suis connecté à la bdd (evenementiel)
mongoose.connection.once('open', () => {
    console.log("Connexion à la base de données effectué");
});

// Quand la bdd aura des erreurs
mongoose.connection.on('error', () => {
    console.log("Erreur dans la BDD");
});

// Se connecter sur mongodb (async)
// Ca prend x temps à s'executer
mongoose.connect("mongodb://127.0.0.1:27017/db_demo");

// TODO : créer le modèle Article

// ================================================
// Instancier un serveur et autoriser envoie json
// ================================================
// Instancier le server grace à express
const app = express();

// AUTORISER LE BACK A RECEVOIR DES DONNEES DANS LE BODY
app.use(express.json());

const Articles = mongoose.model('Articles', {title : String, content : String, author : String}, 'articles');

// ================================================
// Les routes (url/point d'entrée)
// ================================================
app.get('/articles', async (request, response) => {

        // Récupérer tout les produits dans mongo
    // Attention fonction Asynchrone
    const articles = await Articles.find();

    //RG-001 : Si la liste est vide retourner un code 701
    if (articles.length == 0){
        return response.json({ code : "701" });
    }

    //RG-002 : Sinon la liste des produits
    return response.json(articles);
});

app.get('/article/:id', async (request, response) => {
    // Récupérer le param de l'url
    const idParam = request.params.id;

    // Récupérer dans la base, le produit avec l'id saisie
    const foundArticles = await Articles.findOne({'_id' : idParam})
    
    //RG-003 : Si l'id n'existe pas en base code 705
    if (!foundArticles){
        return response.json({ code : "705" })
    }
    console.log(foundArticles);
    
    //RG-004 : Sinon on retourne le produit trouvé
    return response.json(foundArticles);
});

app.post('/save-article', async (request, response) => {

    // Récupérer la requête
    const articleJson = request.body;

    // Envoyer le articleJson dans mongodb
    // --Instancier le modèle Product avec les données
    const article = new Articles(articleJson)

    // Données objet => language de prog (java, js python ...)
    // Données physique => Stockage de la données (sql, )
    // -- Persister en base (envoyer dans la BDD)
    await article.save();

    console.log(articleJson);

    return response.json(articleJson);
});

app.delete('/article/:id', async (request, response) => {
    const idParam = request.params.id;
    const deleteArticles = await Articles.deletebyid({'_id' : idParam})
    if (deleteArticles) {
        return response.json({ message : "Article supprimés avec succès" })
    }
    const foundIdArticles = await Articles.findById({'_id' : idParam})
    if (!foundIdArticles) {
        return response.json({ message : "Article non trouvé" })
    }
});

// ================================================
// Lancer le serveur
// ================================================
app.listen(3000, () => {
    console.log("Le serveur a démarré");
});