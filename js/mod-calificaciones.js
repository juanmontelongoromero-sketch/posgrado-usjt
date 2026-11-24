/**
 * MÓDULO 3: CALIFICACIONES HOMOLOGADAS (js/mod-calificaciones.js)
 * Código exclusivo para la página de Consulta de Calificaciones en Google Sites.
 */
document.addEventListener('DOMContentLoaded', () => {
  const { el, iniciarModuloAlumno, parsearNumero, calcularPromedio } = window.PosgradoCore;
  let tabActiva = 0;

  iniciarModuloAlumno({
    tituloModulo: 'Kárdex y Calificaciones',
    actionCarga: 'mod_calificaciones',
    render: function renderCalif(container, data, ctx) {
      container.replaceChildren();
      const periodos = data.periodos || [];
      const perfil = data.perfil || {};
      const fmt = (n) => (n === null ? '—' : n.toFixed(2));

      const tabs = el('div', 'sub-tabs');
      ['Resumen General', ...periodos.map(p => p.titulo)].forEach((t, i) => {
        const b = el('button', 'sub-tab' + (i === tabActiva ? ' active' : ''), t);
        b.type = 'button';
        b.onclick = () => {
          tabActiva = i;
          renderCalif(container, data, ctx);
        };
        tabs.append(b);
      });
      container.append(tabs);

      const medias = periodos.map(p => calcularPromedio(p.materias.map(m => m.calificacion)));
      const todas = periodos.flatMap(p => p.materias.map(m => m.calificacion));
      const promGeneral = calcularPromedio(todas);
      const evaluadas = todas.filter(n => parsearNumero(n) !== null).length;

      if (tabActiva === 0) {
        const kpis = el('div', 'kpi-grid');
        const cHero = el('div', 'kpi-card highlight');
        cHero.append(
          el('p', 'kpi-label', 'Promedio General'),
          el('p', 'kpi-value', fmt(promGeneral)),
          el('span', 'kpi-sub', evaluadas + ' de ' + todas.length + ' asignaturas evaluadas')
        );
        kpis.append(cHero);

        periodos.forEach((p, idx) => {
          const c = el('div', 'kpi-card');
          c.append(
            el('p', 'kpi-label', p.titulo),
            el('p', 'kpi-value', fmt(medias[idx])),
            el('span', 'kpi-sub', p.materias.length + ' materias')
          );
          kpis.append(c);
        });
        container.append(kpis);
        container.append(el('p', 'course-meta',
          'Programa: ' + ((perfil.programa && perfil.programa.nombre) || '') +
          ' · Los promedios consideran únicamente las calificaciones numéricas registradas.'
        ));
      } else {
        const per = periodos[tabActiva - 1];
        if (!per) return;
        const card = el('div', 'panel-card');
        const h3 = el('h3');
        h3.append(el('span', '', per.titulo), el('span', '', 'Promedio: ' + fmt(medias[tabActiva - 1])));
        card.append(h3);

        per.materias.forEach(m => {
          const vacia = m.calificacion === undefined || m.calificacion === null || String(m.calificacion).trim() === '';
          const r = el('div', 'list-row');
          r.append(
            el('span', '', m.nombre),
            el('span', 'status-pill ' + (vacia ? 'status-pending' : 'status-paid'), vacia ? 'Sin calificación' : String(m.calificacion))
          );
          card.append(r);
        });
        container.append(card);
      }
    }
  });
});
