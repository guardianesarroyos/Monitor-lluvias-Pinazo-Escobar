// script/app.js - Versión: 2025-07-13_MonitorArroyo_Fix_V10 (API Key externa, indicador de fuente de datos)
console.log("Cargando script/app.js - Versión: 2025-07-13_MonitorArroyo_Fix_V10 (API Key externa, indicador de fuente de datos)");

// Configuración
const config = {
  intervaloActualizacion: 15 * 60 * 1000,
  ubicacion: {
    lat: -34.6037,
    lon: -58.3816,
    zonaHoraria: 'America/Argentina/Buenos_Aires'
  },
  wunderground: {
    // La API Key ahora se toma de window.WUNDERGROUND_API_KEY (definida en script/config.js)
    apiKey: window.WUNDERGROUND_API_KEY, 
    stationIds: {
      alto: "IPILAR8",
      medio: "IINGEN19",
      bajo: "IBELND46"
    }
  },
  imagenesFondo: {
    dia: 'arroyoescobar_dia.png',  // RUTA RELATIVA (sin /)
    noche: 'arroyoescobar_noche.png'   // RUTA RELATIVA (sin /)
  },
  datosManualesURL: 'DATOS/manuales.json'
};

// Estado del sistema
const estadoSistema = {
  horasSeleccionadas: 24,
  ultimoFondo: null,
  datosManuales: null,
  ultimaActualizacion: null
};

// Áreas geográficas
const areas = {
  alto: { lat: -34.455, lon: -58.859, nombre: "Pilar" },
  medio: { lat: -34.386, lon: -58.767, nombre: "Maschwitz" },
  bajo: { lat: -34.336, lon: -58.715, nombre: "Escobar" }
};

// Estructuras de datos para historial y corrección
const cuencas = {
  media: {
    name: "Cuenca Media - Maschwitz",
    lat: -34.386,
    lon: -58.767,
    station: "IINGEN19"
  },
  alta: {
    name: "Cuenca Alta - Pilar",
    lat: -34.455,
    lon: -58.859,
    station: "IPILAR8"
  },
  bajo: {
    name: "Cuenca Baja - Escobar",
    lat: -34.341,
    lon: -58.738,
    station: "IBELND46"
  }
};
// Inicialización de historicalData y correctionFactors para cada cuenca
let historicalData = {};
let correctionFactors = {};

Object.keys(cuencas).forEach(key => {
  historicalData[key] = { openmeteo: [], wunderground: [], corrected: [] };
  correctionFactors[key] = { temp: 0, rain: 0, rain24h: 0, count: 0 };
});

// Variables de control
let isTabActive = true;
let lastUpdateTime = null;
let updateIntervalId = null;

// ----------------------------------------
// Funciones auxiliares
// ----------------------------------------

function formatTimestampForCsv(date) {
  return date.toISOString();
}

function formatDate(date) {
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function showStatus(message, isError = false) {
  const statusEl = document.getElementById('update-status');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.style.color = isError ? 'red' : '#00d4ff';
  }
}

function updateLastUpdated() {
  lastUpdateTime = new Date();
  const lastUpdatedEl = document.getElementById('hora-update');
  if (lastUpdatedEl) {
    lastUpdatedEl.textContent = formatDate(lastUpdateTime);
  }
  const manualRefreshBtn = document.getElementById('manual-refresh');
  if (manualRefreshBtn) {
    manualRefreshBtn.onclick = updateAllData;
  }
}

// Modificada para aceptar la fuente de datos
function actualizarCuencaUI(prefix, lluvia, temp, isError, source) {
  const lluviaEl = document.getElementById(`lluvia-${prefix}`);
  const tempEl = document.getElementById(`temp-${prefix}`);
  const burbujaEl = document.querySelector(`.burbuja.${prefix}`);

  // Limpiar cualquier indicador de fuente anterior
  const oldSourceSpanLluvia = lluviaEl.querySelector('.data-source');
  if (oldSourceSpanLluvia) oldSourceSpanLluvia.remove();
  const oldSourceSpanTemp = tempEl.querySelector('.data-source');
  if (oldSourceSpanTemp) oldSourceSpanTemp.remove();

  if (lluviaEl) {
    lluviaEl.textContent = `${lluvia} mm`;
    if (source) {
      const sourceSpan = document.createElement('span');
      sourceSpan.className = `data-source source-${source.toLowerCase()}`;
      sourceSpan.textContent = ` (${source})`;
      lluviaEl.appendChild(sourceSpan);
    }
  }
  if (tempEl) {
    tempEl.textContent = `Temp: ${temp}°C`;
    if (source) {
      const sourceSpan = document.createElement('span');
      sourceSpan.className = `data-source source-${source.toLowerCase()}`;
      sourceSpan.textContent = ` (${source})`;
      tempEl.appendChild(sourceSpan);
    }
  }

  if (burbujaEl) {
    if (isError) {
      burbujaEl.classList.add('error');
    } else {
      burbujaEl.classList.remove('error');
    }
  }
}

// ----------------------------------------
// Funciones de Obtención de Datos de APIs
// ----------------------------------------

async function obtenerDatosOpenMeteo(lat, lon) {
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation&timezone=auto`);
    if (response.ok) {
      const data = await response.json();
      return {
        temp: data.current.temperature_2m?.toFixed(1) || "--",
        lluvia: data.current.precipitation?.toFixed(1) || "0.0",
        source: 'OM' // Añadir la fuente
      };
    }
    return null;
  } catch (error) {
    console.error("Error Open-Meteo:", error);
    return null;
  }
}

async function obtenerDatosWunderground(stationId) {
  if (!config.wunderground.apiKey) {
    console.error("API Key de Wunderground no disponible. No se pueden obtener datos de Wunderground.");
    return {
      temp: null,
      lluvia: null,
      error: true,
      source: 'WU' // Aunque falle, indicamos la fuente intentada
    };
  }
  try {
    const url = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=m&apiKey=${config.wunderground.apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Error HTTP al obtener datos de Wunderground: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error("Cuerpo del error de Wunderground:", errorText);
      return {
        temp: null,
        lluvia: null,
        error: true,
        source: 'WU' // Aunque falle, indicamos la fuente intentada
      };
    }
    const data = await response.json();
    const obs = data.observations && data.observations[0];
    return {
      temp: obs ? obs.metric.temp : "--",
      lluvia: obs ? obs.metric.precipTotal : "0.0",
      source: 'WU' // Añadir la fuente
    };
  } catch (error) {
    console.error("❌ Error al obtener datos de Wunderground:", error);
    return {
      temp: null,
      lluvia: null,
      error: true,
      source: 'WU' // Aunque falle, indicamos la fuente intentada
    };
  }
}

async function cargarDatosManuales(datosManualesURL) {
  try {
    const response = await fetch(`${datosManualesURL}?t=${new Date().getTime()}`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Error cargando datos manuales:", error);
    return null;
  }
}

function determinarDatoFinal(lluviaAuto, lluviaManual) {
  const numAuto = parseFloat(lluviaAuto) || 0;
  const numManual = parseFloat(lluviaManual) || 0;
  return numManual > numAuto ? numManual : numAuto;
}
// ----------------------------------------
// Funciones de Persistencia (Local Storage)
// ----------------------------------------

function saveToLocalStorage() {
  try {
    localStorage.setItem('historicalData', JSON.stringify(historicalData));
    localStorage.setItem('correctionFactors', JSON.stringify(correctionFactors));
    console.log('Datos guardados en Local Storage.');
  } catch (e) {
    console.error('Error al guardar en Local Storage:', e);
  }
}

function loadFromLocalStorage() {
  try {
    const storedHistoricalData = localStorage.getItem('historicalData');
    const storedCorrectionFactors = localStorage.getItem('correctionFactors');

    if (storedHistoricalData) {
      const parsedData = JSON.parse(storedHistoricalData);
      historicalData = JSON.parse(JSON.stringify(parsedData));

      Object.keys(cuencas).forEach(key => {
        if (!historicalData[key]) historicalData[key] = { openmeteo: [], wunderground: [], corrected: [] };
        if (!historicalData[key].openmeteo) historicalData[key].openmeteo = [];
        if (!historicalData[key].wunderground) historicalData[key].wunderground = [];
        if (!historicalData[key].corrected) historicalData[key].corrected = [];
      });
      console.log('Datos históricos cargados desde Local Storage.');
    } else {
      console.log('No hay datos históricos en Local Storage. Iniciando con valores por defecto.');
      Object.keys(cuencas).forEach(key => {
        historicalData[key] = { openmeteo: [], wunderground: [], corrected: [] };
      });
    }

    if (storedCorrectionFactors) {
      const parsedFactors = JSON.parse(storedCorrectionFactors);
      correctionFactors = JSON.parse(JSON.stringify(parsedFactors));
      console.log('Factores de corrección cargados desde Local Storage.');
    } else {
      console.log('No hay factores de corrección en Local Storage. Iniciando con valores por defecto.');
      Object.keys(cuencas).forEach(key => {
        correctionFactors[key] = { temp: 0, rain: 0, rain24h: 0, count: 0 };
      });
    }

  } catch (e) {
    console.error('Error al cargar de Local Storage:', e);
    Object.keys(cuencas).forEach(key => {
      historicalData[key] = { openmeteo: [], wunderground: [], corrected: [] };
      correctionFactors[key] = { temp: 0, rain: 0, rain24h: 0, count: 0 };
    });
    console.warn('Local Storage corrupto o inaccesible. Datos reiniciados.');
  }
}
// Funciones de Backup/Restore (las de Mimi Kroklima, si las quieres mantener)
function exportDataToCsv() {
  let csvContent = "timestamp,cuenca,servicio,temp,rain,rain24h,factor_temp,factor_rain,factor_rain24h\n";

  Object.entries(historicalData).forEach(([cuencaKey, data]) => {
    const cuencaName = cuencas[cuencaKey].name;

    data.openmeteo.forEach(entry => {
      csvContent += `${formatTimestampForCsv(new Date(entry.timestamp))},"${cuencaName}",openmeteo,${entry.temp !== null ? entry.temp : ''},${entry.rain !== null ? entry.rain : ''},${entry.rain24h !== null ? entry.rain24h : ''},,,\n`;
    });

    data.wunderground.forEach(entry => {
      csvContent += `${formatTimestampForCsv(new Date(entry.timestamp))},"${cuencaName}",wunderground,${entry.temp !== null ? entry.temp : ''},${entry.rain !== null ? entry.rain : ''},${entry.rain24h !== null ? entry.rain24h : ''},,,\n`;
    });

    data.corrected.forEach(entry => {
      csvContent += `${formatTimestampForCsv(new Date(entry.timestamp))},"${cuencaName}",corrected,${entry.temp !== null ? entry.temp : ''},${entry.rain !== null ? entry.rain : ''},${entry.rain24h !== null ? entry.rain24h : ''},,,\n`;
    });
  });

  Object.entries(correctionFactors).forEach(([cuencaKey, factors]) => {
    const cuencaName = cuencas[cuencaKey].name;
    csvContent += `${formatTimestampForCsv(new Date())},"${cuencaName}",Factor de Corrección,,,${factors.temp !== null ? factors.temp.toFixed(2) : ''},${factors.rain !== null ? factors.rain.toFixed(2) : ''},${factors.rain24h !== null ? factors.rain24h.toFixed(2) : ''}\n`;
  });

  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const now = new Date();
  const filename = `mikroklima_backup_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.csv`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showStatus("Backup de datos descargado correctamente (CSV).");
}

function importDataFromJson(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        if (data.historicalData && data.correctionFactors) {
          historicalData = data.historicalData;
          correctionFactors = data.correctionFactors;

          Object.keys(cuencas).forEach(key => {
            if (!historicalData[key]) historicalData[key] = { openmeteo: [], wunderground: [], corrected: [] };
            if (!historicalData[key].openmeteo) historicalData[key].openmeteo = [];
            if (!historicalData[key].wunderground) historicalData[key].wunderground = [];
            if (!historicalData[key].corrected) historicalData[key].corrected = [];
            if (!correctionFactors[key]) correctionFactors[key] = { temp: 0, rain: 0, rain24h: 0, count: 0 };
          });

          saveToLocalStorage();
          showStatus("Datos cargados correctamente desde backup (JSON).");
        } else {
          throw new Error("Formato de archivo de backup inválido.");
        }
      } catch (error) {
        console.error("Error al cargar el archivo de backup:", error);
        showStatus(`Error al cargar backup: ${error.message}`, true);
      }
    };
    reader.readAsText(file);
  }
}

// ----------------------------------------
// Funciones de Actualización Principal
// ----------------------------------------
async function actualizarCuenca(prefix, area) {
  try {
    let datosAuto = null;
    let dataSource = ''; // Variable para almacenar la fuente del dato

    const stationId = config.wunderground.stationIds[prefix];
    if (stationId) {
      datosAuto = await obtenerDatosWunderground(stationId);
      if (datosAuto && !datosAuto.error) {
        dataSource = datosAuto.source;
      } else { // Si Wunderground falla, intenta con Open-Meteo
        datosAuto = await obtenerDatosOpenMeteo(area.lat, area.lon);
        if (datosAuto) dataSource = datosAuto.source;
      }
    } else { // Si no hay stationId para Wunderground, usa Open-Meteo directamente
      datosAuto = await obtenerDatosOpenMeteo(area.lat, area.lon);
      if (datosAuto) dataSource = datosAuto.source;
    }

    let datosManual = null;
    if (estadoSistema.datosManuales) {
      datosManual = {
        lluvia: estadoSistema.datosManuales.hoy[`lluvia_${prefix}`] || "0.0",
        temp: "--"
      };
    }

    const lluviaFinal = datosManual && datosAuto && !datosAuto.error ?
      determinarDatoFinal(datosAuto.lluvia, datosManual.lluvia) :
      datosAuto?.lluvia || datosManual?.lluvia || "--";
    const tempFinal = datosAuto?.temp || "--";

    // Pasar la fuente a la función de actualización de la UI
    actualizarCuencaUI(prefix, lluviaFinal, tempFinal, !datosAuto || datosAuto.error, dataSource);

    const timestamp = new Date().toISOString();
    if (!historicalData[prefix]) historicalData[prefix] = { openmeteo: [], wunderground: [], corrected: [] };
    
    // Solo añadir al historial si los datos son válidos
    historicalData[prefix].openmeteo.push({
      timestamp: timestamp,
      temp: datosAuto?.temp,
      rain: datosAuto?.lluvia,
      rain24h: 0 // Asumiendo que OpenMeteo solo da precipitación actual aquí
    });
    historicalData[prefix].wunderground.push({
      timestamp: timestamp,
      temp: datosAuto?.temp, // Usamos datosAuto para Wunderground si no hay error
      rain: datosAuto?.lluvia,
      rain24h: 0 // Asumiendo que Wunderground solo da precipitación actual aquí
    });

    const MAX_HISTORICAL_DATA = 100;
    if (historicalData[prefix].openmeteo.length > MAX_HISTORICAL_DATA) {
      historicalData[prefix].openmeteo.shift();
      historicalData[prefix].wunderground.shift();
      historicalData[prefix].corrected.shift();
    }

    return true;
  } catch (error) {
    console.error(`Error actualizando ${prefix}:`, error);
    actualizarCuencaUI(prefix, "--", "--", true, ''); // Sin fuente si hay error
    return false;
  }
}

async function actualizarDatos() {
  try {
    estadoSistema.datosManuales = await cargarDatosManuales(config.datosManualesURL);
    updateLastUpdated();

    await Promise.all([
      actualizarCuenca('alto', areas.alto),
      actualizarCuenca('medio', areas.medio),
      actualizarCuenca('bajo', areas.bajo)
    ]);
    saveToLocalStorage();
    showStatus("Datos actualizados.");
  } catch (error) {
    console.error("Error en actualización automática:", error);
    showStatus("Error al actualizar datos.", true);
  }
}
// ----------------------------------------
// Función para cargar el fondo (modo día/noche)
// ----------------------------------------
function aplicarFondoSegunModo() {
  // 1. Define el modo (día/noche) según preferencia del sistema
  const esModoNoche = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const nuevoFondo = esModoNoche ? config.imagenesFondo.noche : config.imagenesFondo.dia;

  // 2. Depuración en consola
  console.log(`🌓 Modo: ${esModoNoche ? 'Noche' : 'Día'} | Intentando cargar: ${nuevoFondo}`); // Log más explícito

  // 3. Carga la imagen
  const img = new Image();
  img.onload = () => {
    document.body.style.backgroundImage = `url('${nuevoFondo}')`;
    console.log("✅ Fondo aplicado correctamente");
  };
  img.onerror = (e) => { // Captura el evento de error para más detalles
    console.error("❌ Error al cargar el fondo. Falló la URL:", nuevoFondo, e); // Log más explícito
    document.body.style.backgroundColor = esModoNoche ? '#121212' : '#f5f5f5'; // Fondo de respaldo
  };
  img.src = nuevoFondo;
}
// ----------------------------------------
// Inicialización de la aplicación
// ----------------------------------------
document.addEventListener('DOMContentLoaded', function() {
  // 1. Carga datos iniciales
  loadFromLocalStorage();

  // 2. Configura eventos (tooltips, botones, etc.)
  document.querySelectorAll('.info-icon').forEach(icon => {
    icon.addEventListener('click', e => {
      e.stopPropagation();
      const tooltipId = e.currentTarget.dataset.tooltip;
      document.getElementById(tooltipId).classList.toggle('visible');
    });
  });

  document.querySelectorAll('.selector-tiempo button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.selector-tiempo button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      estadoSistema.horasSeleccionadas = parseInt(btn.dataset.horas);
      actualizarDatos();
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.tooltip-text').forEach(tooltip => {
      tooltip.classList.remove('visible');
    });
  });

  // 3. Carga el fondo y los datos iniciales
  aplicarFondoSegunModo(); // ¡Asegúrate de que esta línea esté presente!
  // Escuchar cambios en el modo oscuro/claro del sistema
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', aplicarFondoSegunModo);
  
  actualizarDatos();

  // 4. Actualización periódica (opcional)
  setInterval(actualizarDatos, config.intervaloActualizacion);
});

// ----------------------------------------
// Opcional: Registro del Service Worker (solo para producción)
// ----------------------------------------
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  navigator.serviceWorker.register('./service-worker.js')
    .then(reg => console.log('Service Worker registrado:', reg))
    .catch(err => console.error('Error registrando Service Worker:', err));
}
