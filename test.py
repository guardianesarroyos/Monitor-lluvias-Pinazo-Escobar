import os
from dotenv import load_dotenv

# Cargar variables desde el archivo .env
load_dotenv()

# Obtener la API Key usando el nombre de la variable
api_key = os.getenv("API_KEY")

print(f"Tu API Key es: {api_key}")  # Solo para pruebas, no imprimir en producción
