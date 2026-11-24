/**
 * ============================================================================
 * CONFIGURACIÓN ÚNICA DEL SITIO EN GITHUB PAGES (js/config.js)
 * ============================================================================
 * Solo necesitas colocar aquí UNA VEZ tu liga /exec de Google Apps Script.
 * Todas las páginas modulares (Sesiones, Materias, Calificaciones, Pagos y Admin)
 * leerán automáticamente esta misma URL.
 */

window.POSGRADO_CONFIG = {
  // Pega aquí tu liga /exec de Google Apps Script cuando lo publiques.
  // Mientras tenga el texto "MODO_SIMULADOR_LOCAL", usará datos de prueba interactivos
  // para que puedas probar todas las páginas y el Panel Administrador de inmediato.
  SCRIPT_URL: "MODO_SIMULADOR_LOCAL",

  INSTITUCION: "Investigación y Posgrado",
  SUBTITULO: "Sistema Modular de Gestión Académica"
};
