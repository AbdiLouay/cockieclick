const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Configuration de la connexion à la base de données
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'votre_utilisateur_mysql',
    password: 'votre_mot_de_passe_mysql',
    database: 'nom_de_votre_base_de_données'
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
    const { username, password } = req.body;

    // Requête SQL pour vérifier les informations d'identification
    const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
    connection.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('Erreur lors de l\'exécution de la requête SQL :', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        if (results.length > 0) {
            res.status(200).json({ message: 'Login successful!' });
        } else {
            res.status(401).json({ error: 'Invalid username or password.' });
        }
    });
});

app.listen(port, () => {
    console.log(`Le serveur est en cours d'exécution sur http://localhost:${port}`);
});
