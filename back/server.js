const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const path = require('path')
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'front')));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.use(cors());

// Configuration de la connexion à la base de données
const connection = mysql.createConnection({
    host: '192.168.65.77', // L'hôte de la base de données
    user: 'api', // Votre nom d'utilisateur MySQL
    password: 'api', // Votre mot de passe MySQL
    database: 'cookieclic' // Le nom de votre base de données
});

// Connexion à la base de données
connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connexion à la base de données réussie');
});


app.post('/api/login', (req, res) => {
    const { nom, motDePasse } = req.body;

    // Requête SQL pour vérifier les informations d'identification
    const sql = `SELECT * FROM User WHERE nom = ? AND mot_de_passe = ?`;
    connection.query(sql, [nom, motDePasse], (err, results) => {
        if (err) {
            console.error('Erreur lors de l\'exécution de la requête SQL :', err);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }

        if (results.length > 0) {
            const cookieOptions = {
                maxAge: 7 * 24 * 60 * 60 * 1000, // Durée de validité du cookie en millisecondes (7 jours)
                httpOnly: false, // Le cookie n'est pas accessible via JavaScript côté client
                sameSite: 'None'
            };
            console.log('Connexion d\'un client mise en place du cookie');
            // Set the cookie manually
            res.cookie('userInfo', { nom: nom, motDePasse: motDePasse }, cookieOptions);

            res.status(200).json({ message: 'Connexion réussie!' });
        } else {
            res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe invalide.' });
        }
    });
});



app.listen(port, () => {
    console.log(`Le serveur est en cours d'exécution sur http://localhost:${port}`);
});

