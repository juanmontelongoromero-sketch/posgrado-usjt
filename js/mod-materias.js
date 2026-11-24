/**
 * MÓDULO 2: MATERIAS, CONTENIDO EN DRIVE Y ENTREGA DE TRABAJOS (js/mod-materias.js)
 * Código exclusivo para la página de Aula Virtual y Trabajos en Google Sites.
 */
document.addEventListener('DOMContentLoaded', () => {
  const { el, iniciarModuloAlumno, leerArchivoBase64 } = window.PosgradoCore;
  let periodoIdx = 0;
  let materiaAbiertaNombre = null;

  iniciarModuloAlumno({
    tituloModulo: 'Materias, Materiales y Trabajos',
    actionCarga: 'mod_materias',
    render: function renderMaterias(container, data, ctx) {
      container.replaceChildren();
      const periodos = data.periodos || [];

      // Construir modal privado de subida de tareas si no existe en el DOM
      asegurarModalTarea(ctx, (nuevaRespuesta) => {
        ctx.notificarExito(nuevaRespuesta.message || 'Trabajo entregado exitosamente.');
        renderMaterias(container, { ...data, periodos: nuevaRespuesta.periodos }, ctx);
      });

      if (materiaAbiertaNombre) {
        const encontrada = periodos.flatMap(p => p.materias).find(m => m.nombre === materiaAbiertaNombre);
        if (encontrada) {
          dibujarDetalleMateria(container, encontrada, () => {
            materiaAbiertaNombre = null;
            renderMaterias(container, data, ctx);
          });
          return;
        }
      }

      const tabs = el('div', 'sub-tabs');
      periodos.forEach((p, idx) => {
        const b = el('button', 'sub-tab' + (idx === periodoIdx ? ' active' : ''), p.titulo);
        b.type = 'button';
        b.onclick = () => {
          periodoIdx = idx;
          renderMaterias(container, data, ctx);
        };
        tabs.append(b);
      });
      container.append(tabs);

      const actual = periodos[periodoIdx];
      if (!actual) return;

      const grid = el('div', 'courses-grid');
      actual.materias.forEach(mat => {
        const card = el('article', 'course-card');
        const top = el('div');
        top.append(
          el('span', 'course-period-tag', mat.periodoEtiqueta + (mat.estatusMateria ? ' · ' + mat.estatusMateria : '')),
          el('h4', '', mat.nombre),
          el('p', 'course-meta', 'Docente: ' + mat.docente),
          el('p', 'course-meta', 'Horario: ' + mat.horario),
          el('p', 'course-meta', (mat.materiales || []).length + ' materiales · ' + (mat.tareas || []).length + ' actividades')
        );

        const acts = el('div', 'course-actions');
        const btnVer = el('button', 'btn btn-primary btn-sm', 'Abrir materia');
        btnVer.type = 'button';
        btnVer.onclick = () => {
          materiaAbiertaNombre = mat.nombre;
          renderMaterias(container, data, ctx);
        };
        acts.append(btnVer);

        const btnSubir = el('button', 'btn btn-outline-slate btn-sm', 'Subir trabajo');
        btnSubir.type = 'button';
        btnSubir.onclick = () => abrirModalTarea(mat.nombre, '', '');
        acts.append(btnSubir);

        if (mat.zoomUrl) {
          const aZoom = el('a', 'btn btn-gold btn-sm', 'Zoom ↗');
          aZoom.href = mat.zoomUrl;
          aZoom.target = '_blank';
          aZoom.rel = 'noopener noreferrer';
          acts.append(aZoom);
        }

        card.append(top, acts);
        grid.append(card);
      });

      container.append(grid);
    }
  });

  function dibujarDetalleMateria(container, mat, onBack) {
    const btnBack = el('button', 'btn btn-outline-slate btn-sm', '← Volver a materias del programa');
    btnBack.type = 'button';
    btnBack.style.marginBottom = '16px';
    btnBack.onclick = onBack;
    container.append(btnBack);

    const head = el('div', 'panel-card');
    head.style.background = '#2c2e30';
    head.style.color = '#ffffff';
    head.style.borderLeft = '5px solid #bc955c';
    head.append(
      el('span', 'course-period-tag', mat.periodoEtiqueta),
      el('h2', '', mat.nombre),
      el('p', '', 'Docente: ' + mat.docente + (mat.correoDocente ? ' (' + mat.correoDocente + ')' : '') + '  ·  Horario: ' + mat.horario)
    );
    head.querySelector('h2').style.margin = '6px 0';
    head.querySelector('p').style.margin = '0';
    head.querySelector('p').style.fontSize = '13px';
    head.querySelector('p').style.color = '#ddc9a3';

    if (mat.zoomUrl || mat.grabacionesUrl) {
      const zRow = el('div');
      zRow.style.marginTop = '14px';
      zRow.style.display = 'flex';
      zRow.style.gap = '10px';
      zRow.style.flexWrap = 'wrap';
      if (mat.zoomUrl) {
        const z = el('a', 'btn btn-gold btn-sm', 'Entrar a videollamada Zoom ↗');
        z.href = mat.zoomUrl; z.target = '_blank'; z.rel = 'noopener noreferrer';
        zRow.append(z);
      }
      if (mat.grabacionesUrl) {
        const g = el('a', 'btn btn-outline-slate btn-sm', 'Ver grabaciones ↗');
        g.href = mat.grabacionesUrl; g.target = '_blank'; g.rel = 'noopener noreferrer';
        zRow.append(g);
      }
      head.append(zRow);
    }
    container.append(head);

    // Materiales alojados en Google Drive
    const matCard = el('div', 'panel-card');
    matCard.append(el('h3', '', 'Materiales del Profesor (Diapositivas, Libros y Lecturas)'));
    if (!mat.materiales || mat.materiales.length === 0) {
      matCard.append(el('div', 'empty-state', 'Aún no se han cargado materiales en esta asignatura.'));
    } else {
      mat.materiales.forEach(m => {
        const r = el('div', 'list-row');
        const izq = el('div');
        const l1 = el('div');
        l1.append(el('span', 'type-badge', m.tipo || 'Recurso'), el('strong', '', m.titulo));
        izq.append(l1);
        if (m.descripcion) izq.append(el('p', 'course-meta', m.descripcion));
        const der = el('div');
        if (m.url) {
          const a = el('a', 'btn btn-outline btn-sm', 'Abrir recurso ↗');
          a.href = m.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
          der.append(a);
        }
        r.append(izq, der);
        matCard.append(r);
      });
    }
    container.append(matCard);

    // Entrega de trabajos
    const tarCard = el('div', 'panel-card');
    const h3 = el('h3');
    h3.append(el('span', '', 'Actividades y Entrega de Trabajos'));
    const btnLibre = el('button', 'btn btn-primary btn-sm', 'Enviar trabajo en esta materia');
    btnLibre.type = 'button';
    btnLibre.onclick = () => abrirModalTarea(mat.nombre, '', '');
    h3.append(btnLibre);
    tarCard.append(h3);

    if ((!mat.tareas || !mat.tareas.length) && (!mat.entregasLibres || !mat.entregasLibres.length)) {
      tarCard.append(el('div', 'empty-state', 'Usa el botón "Enviar trabajo en esta materia" para remitir tu documento directamente a coordinación/docente.'));
    } else {
      (mat.tareas || []).forEach(t => {
        const r = el('div', 'list-row');
        const izq = el('div');
        izq.style.maxWidth = '650px';
        izq.append(
          el('strong', '', t.titulo),
          el('p', 'course-meta', t.instrucciones || ''),
          el('p', 'course-meta', 'Fecha límite: ' + (t.fechaLimite || 'Abierta') + ' · Puntaje máx.: ' + t.puntajeMax)
        );
        if (t.entregaAlumno) {
          izq.append(el('p', 'course-meta', '✓ Recibido: ' + t.entregaAlumno.nombreArchivo + ' · Folio: ' + t.entregaAlumno.folio + ' (' + t.entregaAlumno.fechaHora + ')'));
        }
        const der = el('div');
        der.style.display = 'flex';
        der.style.gap = '8px';
        der.style.alignItems = 'center';
        der.append(el('span', 'status-pill ' + (t.entregaAlumno ? 'status-paid' : 'status-pending'), t.entregaAlumno ? 'Entregada' : 'Pendiente'));
        if (t.abierta) {
          const b = el('button', 'btn btn-primary btn-sm', t.entregaAlumno ? 'Reenviar' : 'Subir tarea');
          b.type = 'button';
          b.onclick = () => abrirModalTarea(mat.nombre, t.idTarea, t.titulo);
          der.append(b);
        }
        r.append(izq, der);
        tarCard.append(r);
      });

      (mat.entregasLibres || []).forEach(ent => {
        const r = el('div', 'list-row');
        r.append(
          el('div', '', ent.tituloTarea + ' — ' + ent.nombreArchivo + ' (Folio: ' + ent.folio + ')'),
          el('span', 'status-pill status-paid', 'Recibido')
        );
        tarCard.append(r);
      });
    }
    container.append(tarCard);
  }

  let callbackExitoModal = null;
  function asegurarModalTarea(ctx, onSuccess) {
    callbackExitoModal = onSuccess;
    if (document.getElementById('mod-dlg-tarea')) return;

    const backdrop = el('div', 'modal-backdrop');
    backdrop.id = 'mod-dlg-tarea';
    backdrop.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Enviar Trabajo o Tarea</h3>
          <button class="modal-close" type="button" id="dlg-t-close">×</button>
        </div>
        <div class="modal-body">
          <div class="field-group">
            <label>Materia</label>
            <input id="dlg-t-materia" type="text" readonly style="background:#f4f3f0;">
            <input id="dlg-t-id" type="hidden">
          </div>
          <div class="field-group">
            <label>Título de la actividad o entrega</label>
            <input id="dlg-t-titulo" type="text" placeholder="Ej. Ensayo Unidad 1">
          </div>
          <div class="field-group">
            <label>Archivo (PDF, Word, PPT, ZIP o Imagen · Máx. 12 MB)</label>
            <div class="dropzone-box" id="dlg-t-drop">
              <strong>Haz clic para adjuntar tu trabajo</strong>
              <p class="course-meta" style="margin-top:4px;">Envío privado sin exponer la carpeta de Google Drive</p>
              <div id="dlg-t-pill" class="selected-file-pill"></div>
            </div>
            <input id="dlg-t-file" type="file" style="display:none;">
          </div>
          <div class="field-group" style="margin-bottom:0;">
            <label>Comentarios (opcional)</label>
            <textarea id="dlg-t-com" placeholder="Notas breves para el docente..."></textarea>
          </div>
          <div id="dlg-t-err" class="alert-box alert-error"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline-slate" type="button" id="dlg-t-cancel">Cancelar</button>
          <button class="btn btn-primary" type="button" id="dlg-t-send">Subir entrega</button>
        </div>
      </div>
    `;
    document.body.append(backdrop);

    const cerrar = () => backdrop.classList.remove('open');
    document.getElementById('dlg-t-close').onclick = cerrar;
    document.getElementById('dlg-t-cancel').onclick = cerrar;
    document.getElementById('dlg-t-drop').onclick = () => document.getElementById('dlg-t-file').click();
    document.getElementById('dlg-t-file').onchange = (e) => {
      const f = e.target.files[0];
      const pill = document.getElementById('dlg-t-pill');
      if (f) {
        pill.textContent = f.name + ' (' + (f.size / 1048576).toFixed(2) + ' MB)';
        pill.style.display = 'inline-block';
      } else {
        pill.style.display = 'none';
      }
    };

    document.getElementById('dlg-t-send').onclick = async () => {
      const materia = document.getElementById('dlg-t-materia').value.trim();
      const idTarea = document.getElementById('dlg-t-id').value.trim();
      const tituloTarea = document.getElementById('dlg-t-titulo').value.trim();
      const comentarios = document.getElementById('dlg-t-com').value.trim();
      const fileInput = document.getElementById('dlg-t-file');
      const err = document.getElementById('dlg-t-err');
      const btn = document.getElementById('dlg-t-send');

      err.classList.remove('show');
      if (!tituloTarea || !fileInput.files[0]) {
        err.textContent = 'Indica el título del trabajo y selecciona tu archivo.';
        err.classList.add('show');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Subiendo a buzón privado...';
      try {
        const archivo = await leerArchivoBase64(fileInput.files[0]);
        const res = await ctx.apiCall({ action: 'subir_tarea', materia, idTarea, tituloTarea, comentarios, archivo });
        btn.disabled = false;
        btn.textContent = 'Subir entrega';
        if (res.status === 'success') {
          cerrar();
          if (callbackExitoModal) callbackExitoModal(res);
        } else {
          err.textContent = res.message || 'Error al registrar la tarea.';
          err.classList.add('show');
        }
      } catch (ex) {
        btn.disabled = false;
        btn.textContent = 'Subir entrega';
        err.textContent = ex.message || 'Error de red.';
        err.classList.add('show');
      }
    };
  }

  function abrirModalTarea(materia, idTarea, titulo) {
    document.getElementById('dlg-t-materia').value = materia;
    document.getElementById('dlg-t-id').value = idTarea || '';
    const inp = document.getElementById('dlg-t-titulo');
    inp.value = titulo || '';
    inp.readOnly = Boolean(idTarea);
    document.getElementById('dlg-t-com').value = '';
    document.getElementById('dlg-t-file').value = '';
    document.getElementById('dlg-t-pill').style.display = 'none';
    document.getElementById('dlg-t-err').classList.remove('show');
    document.getElementById('mod-dlg-tarea').classList.add('open');
  }
});
