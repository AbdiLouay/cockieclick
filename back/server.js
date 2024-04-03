const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken'); 

const path = require('path');
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
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // Autorise les requêtes avec des cookies
    next();
});

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

var test = 1;
function authenticateToken(req, res, next) {

    //const token = req.cookies.token;
    const token = req.body['token'];
    
    // Log pour vérifier si le token est correctement extrait des cookies
    console.log('Token extrait du body de la requête :', token);

    if (!token) {
        console.log('Token manquant dans les cookies');
        return res.status(401).json({ error: 'Token manquant, veuillez vous connecter.' });
    }

    jwt.verify(token, 'votre_clé_secrète', (err, decodedToken) => {
        if (err) {
            console.log('Erreur lors de la vérification du token :', err);
            return res.status(403).json({ error: 'Token invalide.' });
        }
        req.user = decodedToken;
        next();
    });
}

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
            // Définir le cookie dans les en-têtes de la réponse
            res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly`);
            res.status(200).json({ message: 'Connexion réussie!', token: token });
        } else {
            res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe invalide.' });
        }
    });
});

// Route d'inscription
app.post('/api/register', (req, res) => {
    const { nom, motDePasse } = req.body;

    // Vérification si le nom d'utilisateur est déjà utilisé
    const checkUserSql = `SELECT * FROM User WHERE nom = ?`;
    connection.query(checkUserSql, [nom], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification du nom d\'utilisateur :', err);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà pris.' });
        }

        // Insertion du nouvel utilisateur avec score par défaut à 0
        const insertUserSql = `INSERT INTO User (nom, mot_de_passe, score) VALUES (?, ?, 0)`;
        connection.query(insertUserSql, [nom, motDePasse], (err, insertResults) => {
            if (err) {
                console.error('Erreur lors de l\'insertion de l\'utilisateur :', err);
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
});


app.post('/api/increment-score', authenticateToken, (req, res) => {
    const { nom } = req.user;
    
    const incrementScoreSql = `UPDATE User SET score = score + 1 WHERE nom = ?`;
    connection.query(incrementScoreSql, [nom], (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour du score :', err);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        res.status(200).json({ message: 'Score augmenté avec succès' });
    });
});


app.listen(port, () => {
    console.log(`Le serveur est en cours d'exécution sur http://:${port}`);
});