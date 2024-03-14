document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var nom = document.getElementById('nom').value; // Récupérer la valeur du champ de nom
    var motDePasse = document.getElementById('mot-de-passe').value; // Récupérer la valeur du champ de mot de passe

    fetch('http://192.168.65.77:3000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nom: nom, // Envoyer le nom récupéré dans le champ de nom
            motDePasse: motDePasse // Envoyer le mot de passe récupéré dans le champ de mot de passe
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Nom d\'utilisateur ou mot de passe incorrect.');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        //Redirection vers cookieclic.html après une connexion réussie
        window.location.href = 'cookieclic.html';
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('error-message').innerText = error.message;
    });
});

