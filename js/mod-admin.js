/**
 * MÓDULO 5: PERFIL DE ADMINISTRADOR / COORDINACIÓN (js/mod-admin.js)
 * Permite gestionar todo el sitio sin editar código HTML ni tocar celdas de Google Sheets:
 * - Alternar entre Políticas Públicas y Criminología
 * - Configurar Zoom, horarios y docentes por materia
 * - Subir libros/diapositivas PDF directo a Google Drive y publicarlos
 * - Crear tareas y revisar entregas de alumnos con link directo a Drive
 * - Publicar comunicados y gestionar cargos/vouchers de pago
 */
document.addEventListener('DOMContentLoaded', async () => {
  const {
    el, apiCall, renderizarCascaron, obtenerSesionAdmin,
    guardarSesionAdmin, cerrarSesionAdmin, leerArchivoBase64
  } = window.PosgradoCore;

  const root = document.getElementById('app-root');
  if (!root) return;

  renderizarCascaron(root, 'Panel de Administrador', true);
  const mount = document.getElementById('core-module-mount');

  let estado = {
    token: null,
    admin: null,
    programaId: 'POLITICAS',
    seccion: 'clases', // clases | materiales | tareas | comunicados | pagos | bandeja
    panelData: null
  };

  const guardada = obtenerSesionAdmin();
  if (guardada && guardada.token) {
    estado.token = guardada.token;
    estado.admin = guardada.admin;
    if (estado.admin && estado.admin.programas && estado.admin.programas[0]) {
      estado.programaId = estado.admin.programas[0].id;
    }
    const ok = await cargarDatosProgramaAdmin();
    if (ok) return;
  }

  mostrarLoginAdmin();

  function mostrarLoginAdmin() {
    mount.replaceChildren();

    if (typeof window.__RENDER_BARRA_DEMO_ADMIN__ === 'function') {
      mount.append(window.__RENDER_BARRA_DEMO_ADMIN__(async (cred) => {
        document.getElementById('adm-cor').value = cred.correo;
        document.getElementById('adm-pas').value = cred.password;
        await hacerLogin();
      }));
    }

    const card = el('div', 'login-card');
    card.style.borderTopColor = '#2c2e30';
    card.append(
      el('h2', '', 'Acceso de Coordinación / Administrador'),
      el('p', 'intro', 'Desde aquí puedes actualizar enlaces de Zoom, subir libros/diapositivas a Drive, crear tareas, publicar comunicados y revisar vouchers sin modificar código.')
    );

    const g1 = el('div', 'field-group');
    g1.append(el('label', '', 'Correo institucional de administración'), Object.assign(el('input'), { id: 'adm-cor', type: 'email', placeholder: 'investigacionyposgrado@usjt.edu.mx' }));

    const g2 = el('div', 'field-group');
    const inpP = Object.assign(el('input'), { id: 'adm-pas', type: 'password', placeholder: '••••••••' });
    g2.append(el('label', '', 'Contraseña de administrador'), inpP);

    const btn = el('button', 'btn btn-primary btn-block', 'Entrar a consola administrativa');
    btn.type = 'button';
    const err = el('div', 'alert-box alert-error');

    async function hacerLogin() {
      const correo = document.getElementById('adm-cor').value.trim();
      const password = document.getElementById('adm-pas').value.trim();
      err.classList.remove('show');
      btn.disabled = true;
      btn.textContent = 'Autenticando...';
      try {
        const res = await apiCall({ action: 'admin_login', correo, password });
        btn.disabled = false;
        btn.textContent = 'Entrar a consola administrativa';
        if (res.status === 'success') {
          estado.token = res.token;
          estado.admin = res.admin;
          estado.programaId = res.admin.programas[0].id;
          guardarSesionAdmin(res.token, res.admin);
          await cargarDatosProgramaAdmin();
        } else {
          err.textContent = res.message || 'Credenciales inválidas.';
          err.classList.add('show');
        }
      } catch (e) {
        btn.disabled = false;
        btn.textContent = 'Entrar a consola administrativa';
        err.textContent = e.message || 'Error de red.';
        err.classList.add('show');
      }
    }

    btn.onclick = hacerLogin;
    inpP.onkeydown = (e) => { if (e.key === 'Enter') hacerLogin(); };
    card.append(g1, g2, btn, err);
    mount.append(card);
  }

  async function cargarDatosProgramaAdmin(mensajeExito) {
    mount.replaceChildren(el('div', 'empty-state', 'Cargando datos administrativos del programa...'));
    try {
      const res = await apiCall({
        action: 'admin_obtener_panel',
        token: estado.token,
        programaId: estado.programaId
      });
      if (res.status !== 'success') return false;
      estado.panelData = res;
      dibujarConsolaAdmin(mensajeExito);
      return true;
    } catch (e) {
      return false;
    }
  }

  function obtenerListaMateriasPrograma() {
    const p = estado.panelData && estado.panelData.programa;
    if (!p || !p.periodos) return [];
    const lista = [];
    p.periodos.forEach((ms, idx) => {
      ms.forEach(m => lista.push({ nombre: m, periodo: p.tipoPeriodo + ' ' + (idx + 1) }));
    });
    return lista;
  }

  function dibujarConsolaAdmin(mensajeExito) {
    mount.replaceChildren();
    const d = estado.panelData;

    // Barra superior de Administrador con selector de Maestría
    const topBar = el('div', 'student-bar');
    topBar.style.borderLeftColor = '#2c2e30';

    const izq = el('div');
    izq.append(
      el('p', 'eyebrow', 'Administrador Activo · ' + (estado.admin ? estado.admin.nombre : 'Coordinación')),
      el('h2', '', d.programa.nombre)
    );

    const controles = el('div');
    controles.style.display = 'flex';
    controles.style.gap = '10px';
    controles.style.alignItems = 'center';
    controles.style.flexWrap = 'wrap';

    const selProg = el('select');
    selProg.style.padding = '8px 12px';
    selProg.style.borderRadius = '4px';
    selProg.style.fontWeight = '600';
    (estado.admin.programas || []).forEach(p => {
      const opt = el('option', '', p.nombre);
      opt.value = p.id;
      opt.selected = p.id === estado.programaId;
      selProg.append(opt);
    });
    selProg.onchange = () => {
      estado.programaId = selProg.value;
      cargarDatosProgramaAdmin();
    };

    const btnSalir = el('button', 'btn btn-outline btn-sm', 'Cerrar sesión');
    btnSalir.type = 'button';
    btnSalir.onclick = cerrarSesionAdmin;

    controles.append(selProg, btnSalir);
    topBar.append(izq, controles);
    mount.append(topBar);

    if (mensajeExito) {
      const okBox = el('div', 'alert-box alert-success show', mensajeExito);
      mount.append(okBox);
    }

    // Sub-pestañas administrativas
    const secciones = [
      { id: 'clases', label: '1. Sesiones Zoom y Docentes' },
      { id: 'materiales', label: '2. Materiales en Drive (' + d.materiales.length + ')' },
      { id: 'tareas', label: '3. Tareas Programadas (' + d.tareas.length + ')' },
      { id: 'comunicados', label: '4. Comunicados (' + d.avisos.length + ')' },
      { id: 'pagos', label: '5. Cargos y Vouchers (' + d.pagos.length + ')' },
      { id: 'bandeja', label: '6. Trabajos Recibidos (' + d.entregas.length + ')' }
    ];

    const nav = el('div', 'sub-tabs');
    secciones.forEach(s => {
      const b = el('button', 'sub-tab' + (estado.seccion === s.id ? ' active' : ''), s.label);
      b.type = 'button';
      b.onclick = () => {
        estado.seccion = s.id;
        dibujarConsolaAdmin();
      };
      nav.append(b);
    });
    mount.append(nav);

    const area = el('div');
    mount.append(area);

    if (estado.seccion === 'clases') renderAdminClases(area, d);
    else if (estado.seccion === 'materiales') renderAdminMateriales(area, d);
    else if (estado.seccion === 'tareas') renderAdminTareas(area, d);
    else if (estado.seccion === 'comunicados') renderAdminComunicados(area, d);
    else if (estado.seccion === 'pagos') renderAdminPagos(area, d);
    else if (estado.seccion === 'bandeja') renderAdminBandeja(area, d);
  }

  /* ---- 1. GESTIÓN DE CLASES Y ZOOM ---- */
  function renderAdminClases(area, d) {
    const materias = obtenerListaMateriasPrograma();
    const card = el('div', 'panel-card');
    card.append(el('h3', '', 'Configurar Docente, Horario y Enlace de Zoom por Asignatura'));

    card.innerHTML += `
      <div class="form-grid-2">
        <div class="field-group">
          <label>Seleccionar materia del programa</label>
          <select id="adm-cl-mat"></select>
        </div>
        <div class="field-group">
          <label>Estatus de la materia</label>
          <select id="adm-cl-est">
            <option value="En curso">En curso (visible en Inicio / Zoom)</option>
            <option value="Programada">Programada</option>
            <option value="Finalizada">Finalizada</option>
          </select>
        </div>
      </div>
      <div class="form-grid-3">
        <div class="field-group"><label>Nombre del Docente</label><input id="adm-cl-doc" type="text" placeholder="Dr. / Mtra. ..."></div>
        <div class="field-group"><label>Correo del Docente</label><input id="adm-cl-cor" type="email" placeholder="docente@usjt.edu.mx"></div>
        <div class="field-group"><label>Horario de clase</label><input id="adm-cl-hor" type="text" placeholder="Sábados 09:00 - 13:00 h"></div>
      </div>
      <div class="form-grid-3">
        <div class="field-group"><label>Enlace directo de Zoom (URL)</label><input id="adm-cl-zoom" type="url" placeholder="https://zoom.us/j/..."></div>
        <div class="field-group"><label>ID de Reunión Zoom</label><input id="adm-cl-id" type="text" placeholder="891 2345 6789"></div>
        <div class="field-group"><label>Código de acceso Zoom</label><input id="adm-cl-cod" type="text" placeholder="USJT2026"></div>
      </div>
      <div class="field-group">
        <label>Enlace a carpeta/lista de Grabaciones (Drive / YouTube oculto)</label>
        <input id="adm-cl-grab" type="url" placeholder="https://drive.google.com/...">
      </div>
      <button id="adm-cl-save" class="btn btn-primary" type="button">Guardar cambios en la materia</button>
    `;
    area.append(card);

    const sel = document.getElementById('adm-cl-mat');
    materias.forEach(m => {
      const o = el('option', '', m.periodo + ' · ' + m.nombre);
      o.value = m.nombre;
      o.dataset.periodo = m.periodo;
      sel.append(o);
    });

    function cargarValoresMateria() {
      const nom = sel.value;
      const reg = (d.clases || []).find(c => c.materia === nom) || {};
      document.getElementById('adm-cl-est').value = reg.estatusMateria || 'Programada';
      document.getElementById('adm-cl-doc').value = reg.docente || '';
      document.getElementById('adm-cl-cor').value = reg.correoDocente || '';
      document.getElementById('adm-cl-hor').value = reg.horario || '';
      document.getElementById('adm-cl-zoom').value = reg.zoomUrl || '';
      document.getElementById('adm-cl-id').value = reg.meetingId || '';
      document.getElementById('adm-cl-cod').value = reg.codigoZoom || '';
      document.getElementById('adm-cl-grab').value = reg.grabacionesUrl || '';
    }

    sel.onchange = cargarValoresMateria;
    cargarValoresMateria();

    document.getElementById('adm-cl-save').onclick = async () => {
      const btn = document.getElementById('adm-cl-save');
      btn.disabled = true;
      btn.textContent = 'Guardando...';
      const optSel = sel.options[sel.selectedIndex];
      const res = await apiCall({
        action: 'admin_guardar_clase',
        token: estado.token,
        programaId: estado.programaId,
        materia: sel.value,
        periodo: optSel ? optSel.dataset.periodo : '',
        estatusMateria: document.getElementById('adm-cl-est').value,
        docente: document.getElementById('adm-cl-doc').value.trim(),
        correoDocente: document.getElementById('adm-cl-cor').value.trim(),
        horario: document.getElementById('adm-cl-hor').value.trim(),
        zoomUrl: document.getElementById('adm-cl-zoom').value.trim(),
        meetingId: document.getElementById('adm-cl-id').value.trim(),
        codigoZoom: document.getElementById('adm-cl-cod').value.trim(),
        grabacionesUrl: document.getElementById('adm-cl-grab').value.trim()
      });
      if (res.status === 'success') {
        estado.panelData = res;
        dibujarConsolaAdmin(res.message);
      } else {
        btn.disabled = false;
        btn.textContent = 'Guardar cambios en la materia';
        alert(res.message || 'Error al guardar');
      }
    };
  }

  /* ---- 2. SUBIR MATERIALES A GOOGLE DRIVE O POR LINK ---- */
  function renderAdminMateriales(area, d) {
    const materias = obtenerListaMateriasPrograma();
    const formCard = el('div', 'panel-card');
    formCard.append(el('h3', '', 'Publicar Diapositivas, Libros o Sílabo en una Materia'));
    formCard.innerHTML += `
      <div class="form-grid-3">
        <div class="field-group"><label>Materia</label><select id="adm-m-mat"></select></div>
        <div class="field-group">
          <label>Tipo de recurso</label>
          <select id="adm-m-tipo">
            <option value="Diapositivas">Diapositivas</option>
            <option value="Libro">Libro / Capítulo</option>
            <option value="Lectura">Lectura PDF</option>
            <option value="Sílabo">Sílabo / Encuadre</option>
            <option value="Video">Video / Enlace</option>
          </select>
        </div>
        <div class="field-group"><label>Título del material</label><input id="adm-m-tit" type="text" placeholder="Ej. Presentación Unidad 2"></div>
      </div>
      <div class="field-group"><label>Descripción o indicación breve</label><input id="adm-m-desc" type="text" placeholder="Ej. Revisar páginas 15 a 42 antes del sábado"></div>
      <div class="form-grid-2">
        <div class="field-group">
          <label>Opción A: Subir archivo directo a Google Drive (máx. 12 MB)</label>
          <input id="adm-m-file" type="file">
        </div>
        <div class="field-group">
          <label>Opción B: O pegar enlace existente (Drive / Web)</label>
          <input id="adm-m-url" type="url" placeholder="https://drive.google.com/...">
        </div>
      </div>
      <button id="adm-m-btn" class="btn btn-primary" type="button">Publicar material en el aula</button>
    `;
    area.append(formCard);

    const sel = document.getElementById('adm-m-mat');
    materias.forEach(m => {
      const o = el('option', '', m.periodo + ' · ' + m.nombre);
      o.value = m.nombre;
      sel.append(o);
    });

    document.getElementById('adm-m-btn').onclick = async () => {
      const btn = document.getElementById('adm-m-btn');
      const fileInp = document.getElementById('adm-m-file');
      const titulo = document.getElementById('adm-m-tit').value.trim();
      const url = document.getElementById('adm-m-url').value.trim();
      if (!titulo) return alert('Escribe el título del material.');
      if (!fileInp.files[0] && !url) return alert('Selecciona un archivo para subir a Drive o pega un enlace.');

      btn.disabled = true;
      btn.textContent = 'Subiendo a Drive y publicando...';
      let archivo = null;
      if (fileInp.files[0]) archivo = await leerArchivoBase64(fileInp.files[0]);

      const res = await apiCall({
        action: 'admin_agregar_material',
        token: estado.token,
        programaId: estado.programaId,
        materia: sel.value,
        tipo: document.getElementById('adm-m-tipo').value,
        titulo,
        descripcion: document.getElementById('adm-m-desc').value.trim(),
        url,
        archivo
      });
      if (res.status === 'success') {
        estado.panelData = res;
        dibujarConsolaAdmin(res.message);
      } else {
        btn.disabled = false;
        btn.textContent = 'Publicar material en el aula';
        alert(res.message);
      }
    };

    const listCard = el('div', 'panel-card');
    listCard.append(el('h3', '', 'Materiales Publicados Actualmente'));
    if (!d.materiales.length) {
      listCard.append(el('div', 'empty-state', 'Sin materiales registrados en este programa.'));
    } else {
      d.materiales.forEach(m => {
        const r = el('div', 'list-row');
        r.append(
          el('div', '', '[' + m.tipo + '] ' + m.titulo + ' — ' + m.materia),
          botonEliminarFila('materiales', m.rowNumber)
        );
        listCard.append(r);
      });
    }
    area.append(listCard);
  }

  /* ---- 3. CREAR TAREAS ---- */
  function renderAdminTareas(area, d) {
    const materias = obtenerListaMateriasPrograma();
    const card = el('div', 'panel-card');
    card.append(el('h3', '', 'Asignar Nueva Tarea o Trabajo'));
    card.innerHTML += `
      <div class="form-grid-3">
        <div class="field-group"><label>Materia</label><select id="adm-t-mat"></select></div>
        <div class="field-group"><label>Título de la tarea</label><input id="adm-t-tit" type="text" placeholder="Ej. Ensayo crítico Unidad 1"></div>
        <div class="field-group"><label>Fecha límite</label><input id="adm-t-fec" type="date"></div>
      </div>
      <div class="field-group"><label>Instrucciones para el alumno</label><textarea id="adm-t-ins" placeholder="Formato PDF, extensión, criterios..."></textarea></div>
      <button id="adm-t-btn" class="btn btn-primary" type="button">Publicar actividad</button>
    `;
    area.append(card);

    const sel = document.getElementById('adm-t-mat');
    materias.forEach(m => {
      const o = el('option', '', m.periodo + ' · ' + m.nombre);
      o.value = m.nombre;
      sel.append(o);
    });

    document.getElementById('adm-t-btn').onclick = async () => {
      const titulo = document.getElementById('adm-t-tit').value.trim();
      if (!titulo) return alert('Indica el título de la actividad.');
      const res = await apiCall({
        action: 'admin_crear_tarea',
        token: estado.token,
        programaId: estado.programaId,
        materia: sel.value,
        titulo,
        fechaLimite: document.getElementById('adm-t-fec').value,
        instrucciones: document.getElementById('adm-t-ins').value.trim(),
        puntajeMax: '100'
      });
      if (res.status === 'success') {
        estado.panelData = res;
        dibujarConsolaAdmin(res.message);
      }
    };

    const list = el('div', 'panel-card');
    list.append(el('h3', '', 'Tareas Activas'));
    if (!d.tareas.length) list.append(el('div', 'empty-state', 'No hay tareas programadas.'));
    d.tareas.forEach(t => {
      const r = el('div', 'list-row');
      r.append(
        el('div', '', t.titulo + ' · ' + t.materia + ' (Límite: ' + (t.fechaLimite || 'Abierta') + ')'),
        botonEliminarFila('tareas', t.rowNumber)
      );
      list.append(r);
    });
    area.append(list);
  }

  /* ---- 4. PUBLICAR COMUNICADOS ---- */
  function renderAdminComunicados(area, d) {
    const card = el('div', 'panel-card');
    card.append(el('h3', '', 'Publicar Comunicado Oficial para el Programa'));
    card.innerHTML += `
      <div class="form-grid-2">
        <div class="field-group"><label>Título del comunicado</label><input id="adm-a-tit" type="text" placeholder="Ej. Suspensión de labores / Fechas de coloquio"></div>
        <div class="field-group">
          <label>Prioridad</label>
          <select id="adm-a-imp">
            <option value="SI">Destacado (Borde Guinda)</option>
            <option value="NO">Normal (Borde Dorado)</option>
          </select>
        </div>
      </div>
      <div class="field-group"><label>Mensaje</label><textarea id="adm-a-msg" placeholder="Redacta el aviso para los alumnos de esta maestría..."></textarea></div>
      <button id="adm-a-btn" class="btn btn-primary" type="button">Publicar comunicado</button>
    `;
    area.append(card);

    document.getElementById('adm-a-btn').onclick = async () => {
      const titulo = document.getElementById('adm-a-tit').value.trim();
      const mensaje = document.getElementById('adm-a-msg').value.trim();
      if (!titulo || !mensaje) return alert('Completa título y mensaje.');
      const res = await apiCall({
        action: 'admin_publicar_aviso',
        token: estado.token,
        programaId: estado.programaId,
        titulo,
        mensaje,
        importante: document.getElementById('adm-a-imp').value === 'SI'
      });
      if (res.status === 'success') {
        estado.panelData = res;
        dibujarConsolaAdmin(res.message);
      }
    };

    const list = el('div', 'panel-card');
    list.append(el('h3', '', 'Comunicados Publicados'));
    if (!d.avisos.length) list.append(el('div', 'empty-state', 'Sin comunicados publicados.'));
    d.avisos.forEach(a => {
      const r = el('div', 'list-row');
      r.append(el('div', '', a.fecha + ' · ' + a.titulo + ': ' + a.mensaje), botonEliminarFila('avisos', a.rowNumber));
      list.append(r);
    });
    area.append(list);
  }

  /* ---- 5. CARGOS Y VOUCHERS RECIBIDOS ---- */
  function renderAdminPagos(area, d) {
    const card = el('div', 'panel-card');
    card.append(el('h3', '', 'Asignar Cargo de Colegiatura o Inscripción'));
    card.innerHTML += `
      <div class="form-grid-2">
        <div class="field-group"><label>Destinatario (escribe TODOS o el correo de un alumno específico)</label><input id="adm-p-cor" type="text" value="TODOS"></div>
        <div class="field-group"><label>Concepto</label><input id="adm-p-con" type="text" placeholder="Ej. Colegiatura Diciembre 2026"></div>
      </div>
      <div class="form-grid-3">
        <div class="field-group"><label>Periodo</label><input id="adm-p-per" type="text" placeholder="Ej. Cuatrimestre 2"></div>
        <div class="field-group"><label>Monto</label><input id="adm-p-mon" type="text" placeholder="Ej. $2,800.00"></div>
        <div class="field-group"><label>Fecha límite</label><input id="adm-p-fec" type="date"></div>
      </div>
      <button id="adm-p-btn" class="btn btn-primary" type="button">Crear cargo de pago</button>
    `;
    area.append(card);

    document.getElementById('adm-p-btn').onclick = async () => {
      const concepto = document.getElementById('adm-p-con').value.trim();
      const monto = document.getElementById('adm-p-mon').value.trim();
      if (!concepto || !monto) return alert('Concepto y monto son obligatorios.');
      const res = await apiCall({
        action: 'admin_crear_pago',
        token: estado.token,
        programaId: estado.programaId,
        correo: document.getElementById('adm-p-cor').value.trim() || 'TODOS',
        concepto,
        periodo: document.getElementById('adm-p-per').value.trim(),
        monto,
        fechaLimite: document.getElementById('adm-p-fec').value
      });
      if (res.status === 'success') {
        estado.panelData = res;
        dibujarConsolaAdmin(res.message);
      }
    };

    const list = el('div', 'panel-card');
    list.append(el('h3', '', 'Registro de Pagos y Vouchers Subidos a Drive'));
    const wrap = el('div', 'table-wrap');
    const tbl = el('table', 'portal-table');
    tbl.innerHTML = '<thead><tr><th>Alumno / Destino</th><th>Concepto</th><th>Monto</th><th>Estatus</th><th>Voucher en Drive</th><th>Acción</th></tr></thead>';
    const tb = el('tbody');
    d.pagos.forEach(p => {
      const tr = el('tr');
      tr.append(
        el('td', '', (p.alumno || p.correo) + (p.matricula ? ' (' + p.matricula + ')' : '')),
        el('td', '', p.concepto),
        el('td', '', p.monto),
        el('td', '', p.estatus + (p.folioVoucher ? ' · ' + p.folioVoucher : ''))
      );
      const tdDrive = el('td');
      if (p.driveUrl) {
        const a = el('a', 'btn btn-gold btn-sm', 'Ver voucher ↗');
        a.href = p.driveUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
        tdDrive.append(a);
      } else {
        tdDrive.textContent = '—';
      }
      const tdDel = el('td');
      tdDel.append(botonEliminarFila('pagos', p.rowNumber));
      tr.append(tdDrive, tdDel);
      tb.append(tr);
    });
    tbl.append(tb);
    wrap.append(tbl);
    list.append(wrap);
    area.append(list);
  }

  /* ---- 6. BANDEJA DE TAREAS ENTREGADAS EN DRIVE ---- */
  function renderAdminBandeja(area, d) {
    const card = el('div', 'panel-card');
    card.append(el('h3', '', 'Trabajos Entregados por Alumnos (Alojados en Google Drive)'));
    if (!d.entregas.length) {
      card.append(el('div', 'empty-state', 'Aún no se han recibido trabajos en este programa.'));
    } else {
      const wrap = el('div', 'table-wrap');
      const tbl = el('table', 'portal-table');
      tbl.innerHTML = '<thead><tr><th>Folio / Fecha</th><th>Alumno</th><th>Materia</th><th>Actividad</th><th>Archivo en Drive</th></tr></thead>';
      const tb = el('tbody');
      d.entregas.forEach(e => {
        const tr = el('tr');
        tr.append(
          el('td', '', e.folio + ' · ' + e.fechaHora),
          el('td', '', e.alumno + (e.matricula ? ' (' + e.matricula + ')' : '')),
          el('td', '', e.materia),
          el('td', '', e.tituloTarea + ' (' + e.nombreArchivo + ')')
        );
        const tdLink = el('td');
        if (e.driveUrl) {
          const a = el('a', 'btn btn-primary btn-sm', 'Abrir en Drive ↗');
          a.href = e.driveUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
          tdLink.append(a);
        } else {
          tdLink.textContent = 'Recibido';
        }
        tr.append(tdLink);
        tb.append(tr);
      });
      tbl.append(tb);
      wrap.append(tbl);
      card.append(wrap);
    }
    area.append(card);
  }

  function botonEliminarFila(coleccion, rowNumber) {
    const b = el('button', 'btn btn-outline btn-sm', 'Eliminar');
    b.type = 'button';
    b.onclick = async () => {
      if (!confirm('¿Deseas eliminar este registro?')) return;
      const res = await apiCall({
        action: 'admin_eliminar_fila',
        token: estado.token,
        programaId: estado.programaId,
        coleccion,
        rowNumber
      });
      if (res.status === 'success') {
        estado.panelData = res;
        dibujarConsolaAdmin('Registro eliminado.');
      }
    };
    return b;
  }
});
