/**
 * MÓDULO 1: SESIONES DE ZOOM Y COMUNICADOS (js/mod-sesiones.js)
 * Código exclusivo para la página de Sesiones y Avisos en Google Sites.
 */
document.addEventListener('DOMContentLoaded', () => {
  const { el, iniciarModuloAlumno } = window.PosgradoCore;

  iniciarModuloAlumno({
    tituloModulo: 'Sesiones Zoom y Comunicados',
    actionCarga: 'mod_sesiones',
    render: (container, data) => {
      container.replaceChildren();
      const grid = el('div', 'two-col-grid');

      // Columna 1: Sesiones Zoom activas
      const zoomCard = el('div', 'panel-card');
      zoomCard.append(el('h3', '', 'Clases en Vivo y Grabaciones (Zoom)'));
      const sesiones = data.sesiones || [];

      if (sesiones.length === 0) {
        zoomCard.append(el('div', 'empty-state', 'No hay sesiones de Zoom activas en este momento para tu programa.'));
      } else {
        sesiones.forEach(s => {
          const row = el('div', 'list-row');
          const info = el('div');
          info.append(
            el('span', 'course-period-tag', (s.periodo ? s.periodo + ' · ' : '') + (s.estatusMateria || 'Activa')),
            el('div', '', ''),
            el('strong', '', s.materia),
            el('p', 'course-meta', 'Docente: ' + s.docente + ' · Horario: ' + s.horario)
          );
          if (s.meetingId || s.codigoZoom) {
            info.append(el('p', 'course-meta',
              (s.meetingId ? 'ID Zoom: ' + s.meetingId : '') +
              (s.codigoZoom ? '   |   Código: ' + s.codigoZoom : '')
            ));
          }

          const btns = el('div');
          btns.style.display = 'flex';
          btns.style.gap = '8px';
          btns.style.flexWrap = 'wrap';

          if (s.zoomUrl) {
            const aZoom = el('a', 'btn btn-primary btn-sm', 'Abrir en Zoom ↗');
            aZoom.href = s.zoomUrl;
            aZoom.target = '_blank';
            aZoom.rel = 'noopener noreferrer';
            btns.append(aZoom);
          }
          if (s.grabacionesUrl) {
            const aGrab = el('a', 'btn btn-slate btn-sm', 'Grabaciones ↗');
            aGrab.href = s.grabacionesUrl;
            aGrab.target = '_blank';
            aGrab.rel = 'noopener noreferrer';
            btns.append(aGrab);
          }

          row.append(info, btns);
          zoomCard.append(row);
        });
      }

      // Columna 2: Comunicados oficiales
      const avisosCard = el('div', 'panel-card');
      avisosCard.append(el('h3', '', 'Comunicados de Coordinación'));
      const avisos = data.avisos || [];

      if (avisos.length === 0) {
        avisosCard.append(el('div', 'empty-state', 'No hay comunicados nuevos publicados.'));
      } else {
        avisos.forEach(a => {
          const box = el('div', 'notice-card' + (a.importante ? ' important' : ''));
          const head = el('div');
          head.style.display = 'flex';
          head.style.justifyContent = 'space-between';
          head.style.marginBottom = '4px';
          head.append(el('strong', '', a.titulo), el('span', 'course-meta', a.fecha || ''));
          box.append(head, el('p', 'course-meta', a.mensaje));
          box.lastChild.style.color = '#2c2e30';
          avisosCard.append(box);
        });
      }

      grid.append(zoomCard, avisosCard);
      container.append(grid);
    }
  });
});
