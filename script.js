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
/*
fetch('/api/private', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erreur :', error));

async function getStuff() { 
    try {
        // Correction : Remplacement de fetchStuff par fetch
        const response = await fetch('/api/private', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const stuff = await response.json();
        return process(stuff);
    } catch (err) { 
        console.error(err);
    }
}
*/

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
        console.log('Token utilisé :', token); // Ajouter ce log pour vérifier le token
        options.headers = {
            ...options.headers,
            'Authorization': 'Bearer ' + token
        };
    
        // Ajouter le cookie contenant le token aux en-têtes
        options.headers['Cookie'] = `token=${token}`;
    
        return fetch(url, options);
    }

    /*
    // Appel de la fonction getStuff
    fetchStuff()
    .then(stuff => {
        // Traitement des données récupérées avec fetchStuff()
        return process(stuff);
      })
      .then(processedData => {
        // Continuer le traitement avec les données traitées
      })
      .catch(error => {
        console.error(error);
      });
*/
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
        console.log("Cookies : " + cookie);
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
            console.log('Score mis à jour avec succès :', data);
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour du score :', error);
        });
    });
}

// Appel de la fonction initialize immédiatement après sa définition
initialize();