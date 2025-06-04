# Simulador de crecidas del arroyo Pinazo-Escobar

## ¿Qué es este proyecto?

El **Simulador de crecidas del arroyo Pinazo-Escobar** es una app sencilla que forma parte de un kit de aplicaciones de alerta temprana. Su propósito es ayudar a prevenir daños mayores ocasionados por inundaciones, especialmente en zonas donde faltan obras hidrológicas y existe una deficiente planificación ambiental.

La app permite simular, usando modelos históricos, hasta dónde podría llegar el pico de una crecida del arroyo, ayudando a los vecinos a anticipar el riesgo de ingreso de agua a sus viviendas y tomar decisiones informadas.

## ¿Por qué es importante?

Muchos habitantes de la cuenca Pinazo-Escobar viven bajo la amenaza de inundaciones que pueden afectar viviendas y bienes. Esta herramienta busca empoderar a la comunidad, facilitando la comprensión y el monitoreo del comportamiento del arroyo después de lluvias intensas, aun sin conocimientos técnicos previos.

## ¿Cómo funciona?

Para utilizar la app solo necesitas dos datos:
1. La **altura actual** del arroyo Escobar (en metros).
2. El **horario en que dejó de llover**.

El simulador estima, tomando en cuenta eventos históricos, cuándo y hasta qué nivel se podría producir el pico de la crecida, considerando:
- Si el evento de lluvia fue de 24, 48 o 72 horas (a mayor duración, más lento y prolongado será el escurrimiento).
- Que el pico generalmente ocurre entre 8 y 10 horas después de la lluvia en eventos de 24 horas.

### Referencias útiles

- **Nivel normal y estable:** 1,30 m (en Maschwitz)
- **Cauce medio:** 2,60 m
- **Cauce tres cuartos:** 3,00 m
- **Cauce completo:** 3,60 m (aquí el arroyo se desborda y ocupa el valle de inundación)

El nivel de “piso de la casa” es habitualmente el umbral que utilizan los vecinos para estimar el ingreso de agua.

## Uso

1. Descarga este repositorio o abre el archivo `index.html` en tu navegador.
2. Ingresa la altura y el horario solicitados.
3. Consulta la simulación para saber hasta dónde podría llegar el agua y en qué momento.
4. Toma medidas para proteger tus bienes y tu familia si corresponde.

## Detalle técnico

- La aplicación está construida en **HTML** y utiliza **CSS** para los estilos, todo en un único archivo (`index.html`).
- No requiere instalación ni dependencias externas: basta con abrir el archivo en cualquier navegador moderno.
- La interfaz es simple y amigable, pensada para que cualquier persona la pueda usar sin conocimientos técnicos.
- El código está preparado para verse bien en modo claro y oscuro, adaptándose automáticamente a la configuración del dispositivo.

## Contribuciones

Si tienes sugerencias o deseas colaborar, puedes abrir un [issue](https://github.com/guardianesarroyos/Simulador-crecidas/issues) o enviar un pull request. ¡Toda ayuda es bienvenida!

## Licencia

Este proyecto está bajo la licencia MIT. El uso y la distribución son libres, siempre que se mencione al equipo técnico "guardianesarroyosba" como creadores.

---

**Contacto:**  
[guardianesarroyos@gmail.com](mailto:guardianesarroyos@gmail.com)