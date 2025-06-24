fetch('/get-api-key')
  .then(response => response.json())
  .then(data => {
    const apiKey = data.API_KEY;

    // Usar la API Key en una solicitud
    fetch(`https://api.example.com/data?key=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById("resultado").innerText = JSON.stringify(data, null, 2);
      })
      .catch(error => console.error("Error:", error));
  })
  .catch(error => console.error("Error al obtener la API Key:", error));
