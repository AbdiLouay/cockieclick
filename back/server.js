function getTokenFromCookies() {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token') {
            return value;
        }
    }
    return null;
}


const token = getTokenFromCookies();


function initialize() {
    // Fonction pour récupérer le token depuis les cookies ou le stockage local
    function getToken() {
        const tokenFromCookies = getTokenFromCookies();
        if (tokenFromCookies) {
            return tokenFromCookies;
        }
        return localStorage.getItem('token');
    }

    // Fonction pour enregistrer le token dans les cookies et le stockage local
    function saveToken(token) {
        document.cookie = `token=${token}; path=/`;
        localStorage.setItem('token', token);
    }

    // Fonction pour afficher le contenu après la connexion réussie
    function showLoggedInContent() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('login-success').style.display = 'block';
    }

    // Fonction pour effectuer une requête AJAX avec le token JWT
    function fetchWithToken(url, options) {
        const token = getToken();
        if (!token) {
            throw new Error('Token manquant');
        }
        options.headers = {
            ...options.headers,
            'Authorization': 'Bearer ' + token
        };
    
        // Ajouter le cookie contenant le token aux en-têtes
        options.headers['Cookie'] = `token=${token}`;
    
        return fetch(url, options);
    }   
    
    // Vérifier si un token est présent dans les cookies ou le stockage local
    if (token) {
        // Si un token est présent, afficher le contenu de la page après la connexion réussie
        showLoggedInContent();
    } else {
        // Sinon, afficher le formulaire de connexion
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('login-success').style.display = 'none';
    }

    // Gestionnaire d'événements pour le bouton de connexion
    document.getElementById('login-button').addEventListener('click', function() {
        var nom = document.getElementById('nom').value;
        var motDePasse = document.getElementById('mot-de-passe').value;

        // Effectuer la requête de connexion
        fetch('http://192.168.65.77:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nom: nom,
                motDePasse: motDePasse
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('La requête a échoué : ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Enregistrer le token dans les cookies et le stockage local
            saveToken(data.token);
            // Afficher le contenu de la page après la connexion réussie
            showLoggedInContent();
        })
        .catch(error => {
            console.error('Erreur lors de la connexion :', error);
        });
    });

    // Gestionnaire d'événements pour le bouton de déconnexion
    document.getElementById("logout-button").addEventListener("click", function() {
        // Supprimer le token des cookies et du stockage local
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        localStorage.removeItem('token');
        // Recharger la page
        window.location.reload();
    });

    // Gestionnaire d'événement pour l'image cliquable spécifique (cookieImage)
    document.getElementById('cookieImage').addEventListener('click', function(){
        var cookie = document.cookie;
        // Effectuer une requête AJAX pour incrémenter le score
        fetchWithToken('http://192.168.65.77:3000/api/increment-score', {
            method: 'POST',
            //credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookie
            },
            body: JSON.stringify({ increment: 1, token: getTokenFromCookies() })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('La requête a échoué : ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour du score :', error);
        });
    });
}

// Fonction pour récupérer le score actuel depuis le serveur
function getScore() {
    // Récupérer le token depuis les cookies
    const token = getTokenFromCookies();

    // Vérifier si le token est disponible
    if (!token) {
        console.error('Token manquant pour récupérer le score.');
        return;
    }

    // Créer l'URL de la requête pour récupérer le score
    const scoreURL = 'http://192.168.65.77:3000/api/get-score';

    // Effectuer une requête GET pour récupérer le score actuel avec le token dans l'en-tête
    fetch(scoreURL, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('La requête a échoué : ' + response.statusText);
        }
        return response.json();
    }).then(data => {
        // Mettre à jour l'affichage du score sur votre page
        document.getElementById('score').innerText = 'Score : ' + data.score;
    }).catch(error => {
        console.error('Erreur lors de la récupération du score :', error);
    });
}

// Appel de la fonction pour récupérer le score actuel toutes les secondes
setInterval(getScore, 1000); // Rafraîchit le score toutes les 1000 millisecondes (1 seconde)



// Appel de la fonction initialize immédiatement après sa définition
initialize();