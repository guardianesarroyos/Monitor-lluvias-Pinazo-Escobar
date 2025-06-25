# 🌧️ Monitor de Lluvias – Arroyo Pinazo-Escobar

![status](https://img.shields.io/badge/status-en%20desarrollo-blue)
![license](https://img.shields.io/badge/licencia-abierta%20con%20atribuci%C3%B3n-brightgreen)
![build](https://img.shields.io/badge/build-manual-lightgrey)

> Aplicación comunitaria para visualizar y comparar la lluvia acumulada en distintos sectores de la cuenca del Arroyo Pinazo-Escobar.

---

## 📖 Descripción

**Monitor de Lluvias** es una aplicación web y pwa progresiva que unifica en una sola vista los datos de seis (6) estaciones meteorológicas cada 15' distribuidas a lo largo del **Arroyo Pinazo-Escobar**, permitiendo interpretar en tiempo real **dónde llovió más** dentro de la cuenca.

Esta visualización ayuda a anticipar posibles crecidas cuando se detectan precipitaciones intensas **aguas arriba**, ya que el sistema fluvial responde con inercia hidrológica a lo largo de varias horas.

La app fue creada por el colectivo **guardianesarroyosba** para fortalecer el monitoreo comunitario del arroyo y facilitar la interpretación ambiental en contextos de riesgo hídrico.

---

## 🌐 Contexto hidrológico

- 📍 Ubicación: Cuenca del Arroyo Pinazo–Escobar, Buenos Aires, Argentina  
- 📏 Longitud estimada del arroyo: 26 km (siguiendo su curso meandroso)  
- 💧 Altura normal del cauce: 1,30 m  
- 🌊 Caudal base sin lluvia: 4,26 m³/s  
- 🌪️ Caudal en crecidas extremas (200 mm): hasta 112,8 m³/s  

---

## 🧰 Características

 🔁 Consulta dinámica de lluvia acumulada en 24, 48 y 72 horas.  
- 🌐 Seis (6) estaciones meteorológicas sincronizadas cada 15': aguas arriba, zona media, y zona baja.  
- 📊 Comparaciones visuales rápidas para interpretar distribución de lluvias. Tooltips de localidades 
- 🔎 Útil para anticipar posibles crecidas al detectar mayores precipitaciones en la cuenca alta.  
- 🎯 Diseño minimalista y responsivo, ideal para celular.  

---

## 🖥️ Tecnologías utilizadas

- `React.js` + `Vite`  
- `Tailwind CSS` para estilos rápidos y oscuros  
- `Custom Hooks` para actualización de datos  
- `JSON` para estructuras simples de lluvia acumulada  

---

## 🚀 Instalación

```bash
git clone https://github.com/guardianesarroyosba/monitor-lluvias-pinazo-escobar.git
cd monitor-lluvias-pinazo-escobar
npm install
npm run dev
```

La app se abrirá automáticamente en `http://localhost:5173`

---

## 🧪 Uso sugerido

- 🔍 Revisar si llovió significativamente más **aguas arriba** que en el resto de la cuenca.  
- 🧠 Asociar la información de lluvia con posibles tiempos de respuesta de crecida.  
- 📌 Complementar con información vecinal o institucional sobre niveles del arroyo.  

---

## 📂 Estructura del proyecto

```
📁 src/
├── components/         # Visualización y layout
├── data/               # Estaciones, acumulados y zonas
├── hooks/              # Actualización de datos y lógica
├── styles/             # Tema oscuro y tipografía
└── utils/              # Cálculos y comparaciones
```

---

## 🤝 Contribuciones

¡Toda colaboración es bienvenida! Podés:

- Reportar errores (`Issues`)  
- Enviar mejoras (`Pull Requests`)  
- Proponer nuevas funciones o estaciones meteorológicas  

---

## 🪪 Licencia

Este proyecto está bajo una **Licencia Abierta con Atribución**.

Podés usar, modificar y redistribuir libremente este software, **siempre que cites a los autores originales**:  
**guardianesarroyosba**

Consultá el archivo [`LICENSE`](./LICENSE) para más información.

---

## 🧠 Créditos

- 🌱 Desarrollado por: [guardianesarroyosba](https://github.com/guardianesarroyosba)  
- 🤝 Apoyo: vecinos, técnicos y observadores de la cuenca del Pinazo–Escobar  
- 🛰️ Fuentes de datos: estaciones meteorológicas comunitarias y colaborativas

---

## Configuración de la API Key de Wunderground

Por motivos de seguridad, la clave de API de Wunderground **no está incluida en este repositorio**.

Para que la aplicación funcione correctamente en tu entorno local, debes crear un archivo llamado `config.local.js` en la raíz del proyecto con el siguiente contenido:

```js
window.WU_API_KEY = "TU_API_KEY_AQUI";
```

> **Importante:**  
> Este archivo está en `.gitignore` y **no debe subirse al repositorio**.

Si no tienes una clave, solicita acceso al administrador del proyecto.

---
