document.getElementById('inscription-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var nom = document.getElementById('nom').value;
    var motDePasse = document.getElementById('motdepasse').value;

    fetch('http://192.168.65.77:3000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nom: nom,
            motDePasse: motDePasse
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        window.location.href = 'index.html'; // Rediriger vers la page de connexion
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Une erreur est survenue lors de l'inscription.");
    });
});