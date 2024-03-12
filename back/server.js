const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const port = 3000;

app.use(express.json());

const connection = mysql.createConnection({
host: '192.168.65.77', // L'hôte de la base de données
user: 'api', // Votre nom d'utilisateur MySQL
password: 'api', // Votre mot de passe MySQL
database: 'exo2' // Le nom de votre base de données
});

 // Connexion à la base de données
        connection.connect((err) => {
        if (err) {
            console.error('Erreur de connexion à la base de données :', err);
            throw err;
        }
        console.log('Connecté à la base de données MySQL');
        });
            

app.use(cors());
            
// Configuration d'une route pour la racine "/"
app.get('/', (req, res) => {
/*let temp =  Math.floor(Math.random() * (36 - (-10) + 1)) + (-10);
const response = {
      temperature: temp,
      unit: '°C'
};
            
res.json(response);*/


app.post('/addUser', (req, res) => {

  const { nom, prenom } = req.body;

  if (!nom || !prenom) {
    return res.status(400).json({ message: 'nom et prenom requis' });

  }

  // Requête d'insertion
  const sql = 'INSERT INTO User (nom, prenom) VALUES (?, ?)';

  // Exécute la requête
  connection.query(sql, [nom, prenom], (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête d\'insertion :', err);
      res.status(500).send('Erreur lors de l\'insertion des données');
      return;
    }

    //je rajoute au json une cles success à true que j'utilise dans le front
    //cette clé me permetra de vérifier que l'api s'est bien déroulé
    req.body.success = true;
    res.json(req.body);
  });


});


connection.query('SELECT * FROM User', (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.status(500).send('Erreur lors de la requête SQL');
      return;
    }

    // Envoi des résultats en tant que réponse JSON
    res.json(results);
  });


});

// Écoute du serveur sur le port spécifié
app.listen(port, () => {
   console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
