const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken'); // Ajout de la dépendance JWT

const path = require('path')
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());


app.use(express.static(path.join(__dirname, 'front')));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


// Configuration de la connexion à la base de données
const connection = mysql.createConnection({
    host: '192.168.65.77',
    user: 'api',
    password: 'api',
    database: 'cookieclic'
});

connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connexion à la base de données réussie');
});

// Middleware d'authentification
function authenticateToken(req, res, next) {
    const userCredentialsCookie = req.cookies.userCredentials; // Utilisez la clé correcte

    if (!userCredentialsCookie) {
        return res.status(401).json({ error: 'Token manquant, veuillez vous connecter.' });
    }

    const { nom, token } = JSON.parse(userCredentialsCookie); // Parsez le contenu du cookie

    jwt.verify(token, 'votre_clé_secrète', (err, decodedToken) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide.' });
        }
        req.user = decodedToken;
        next();
    });
}

// Route d'exemple nécessitant une authentification
app.get('/api/private', authenticateToken, (req, res) => {
    res.json({ message: 'Contenu privé accessible !' });
});

// Route de connexion
app.post('/api/login', (req, res) => {
    const { nom, motDePasse } = req.body;

    const sql = `SELECT * FROM User WHERE nom = ? AND mot_de_passe = ?`;
    connection.query(sql, [nom, motDePasse], (err, results) => {
        if (err) {
            console.error('Erreur lors de l\'exécution de la requête SQL :', err);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }

        if (results.length > 0) {
            const user = { nom };
            const token = jwt.sign(user, 'votre_clé_secrète', { expiresIn: '7d' });

            // Stockage du token dans un cookie
            res.cookie('token', token, { httpOnly: true });

            // Envoyer le token dans la réponse JSON
            res.status(200).json({ message: 'Connexion réussie!', token: token });
        } else {
            res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe invalide.' });
        }
    });
});

// Route d'inscription
app.post('/api/register', (req, res) => {
    const { nom, motDePasse } = req.body;

    const sql = `INSERT INTO User (nom, mot_de_passe) VALUES (?, ?)`;
    connection.query(sql, [nom, motDePasse], (err, results) => {
        if (err) {
            console.error('Erreur lors de l\'exécution de la requête SQL :', err);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }

        // Génération du token pour le nouvel utilisateur
        const user = { nom };
        const token = jwt.sign(user, 'votre_clé_secrète', { expiresIn: '7d' });

        // Stockage du token dans la base de données
        const updateTokenSql = `UPDATE User SET token = ? WHERE nom = ?`;
        connection.query(updateTokenSql, [token, nom], (err, updateResults) => {
            if (err) {
                console.error('Erreur lors de l\'enregistrement du token dans la base de données :', err);
                return res.status(500).json({ error: 'Erreur interne du serveur' });
            }
            res.status(200).json({ message: 'Inscription réussie !' });
        });
    });
});

app.listen(port, () => {
    console.log(`Le serveur est en cours d'exécution sur http://:${port}`);
});