document.getElementById('inscription-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Empêche le comportement par défaut du formulaire
    
    const formData = new FormData(this);
    const jsonData = {};
    formData.forEach((value, key) => { jsonData[key] = value });
    
    fetch('http://192.168.65.77:3000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // Traitement de la réponse du serveur
        // Redirection après une inscription réussie
        if (data.message === 'Inscription réussie !') {
            window.location.href = 'http://192.168.65.77/front/index.html';
        }
    })
    .catch(error => {
        console.error('Erreur lors de la soumission du formulaire :', error);
    });
});