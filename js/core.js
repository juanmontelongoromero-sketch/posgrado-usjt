/**
 * ============================================================================
 * NÚCLEO COMPARTIDO ENTRE PÁGINAS MODULARES (js/core.js)
 * ============================================================================
 * Gestiona:
 * 1. Comunicación con la única liga /exec de Google Apps Script.
 * 2. Persistencia segura del Token de Sesión en localStorage para que el alumno
 *    navegue entre distintas páginas de Google Sites sin escribir su contraseña
 *    en cada pestaña.
 * 3. Renderizado automático del formulario de Login y barra superior del alumno.
 * 4. Utilidades compartidas (conversión Base64 para Drive, promedios, alertas).
 */

window.PosgradoCore = (function () {
  const STORAGE_TOKEN_ALUMNO = 'posgrado_usjt_alumno_token_v1';
  const STORAGE_PERFIL_ALUMNO = 'posgrado_usjt_alumno_perfil_v1';
  const STORAGE_TOKEN_ADMIN = 'posgrado_usjt_admin_token_v1';
  const STORAGE_PERFIL_ADMIN = 'posgrado_usjt_admin_perfil_v1';

  function el(tag, className, text) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  async function apiCall(payload) {
    const url = (window.POSGRADO_CONFIG && window.POSGRADO_CONFIG.SCRIPT_URL) || '';
    if ((!url || url === 'MODO_SIMULADOR_LOCAL') && typeof window.__POSGRADO_DEMO_API__ === 'function') {
      return await window.__POSGRADO_DEMO_API__(payload);
    }
    if (!url || url.indexOf('http') !== 0) {
      throw new Error('Configura tu liga /exec de Apps Script en github-pages/js/config.js');
    }
    const res = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(payload)
    });
    return await res.json();
  }

  function obtenerSesionAlumno() {
    try {
      const token = localStorage.getItem(STORAGE_TOKEN_ALUMNO);
      const perfilRaw = localStorage.getItem(STORAGE_PERFIL_ALUMNO);
      if (!token) return null;
      return { token, perfil: perfilRaw ? JSON.parse(perfilRaw) : null };
    } catch (e) {
      return null;
    }
  }

  function guardarSesionAlumno(token, perfil) {
    try {
      localStorage.setItem(STORAGE_TOKEN_ALUMNO, token);
      if (perfil) localStorage.setItem(STORAGE_PERFIL_ALUMNO, JSON.stringify(perfil));
    } catch (e) {}
  }

  function cerrarSesionAlumno() {
    try {
      localStorage.removeItem(STORAGE_TOKEN_ALUMNO);
      localStorage.removeItem(STORAGE_PERFIL_ALUMNO);
    } catch (e) {}
    window.location.reload();
  }

  function obtenerSesionAdmin() {
    try {
      const token = localStorage.getItem(STORAGE_TOKEN_ADMIN);
      const adminRaw = localStorage.getItem(STORAGE_PERFIL_ADMIN);
      if (!token) return null;
      return { token, admin: adminRaw ? JSON.parse(adminRaw) : null };
    } catch (e) {
      return null;
    }
  }

  function guardarSesionAdmin(token, admin) {
    try {
      localStorage.setItem(STORAGE_TOKEN_ADMIN, token);
      if (admin) localStorage.setItem(STORAGE_PERFIL_ADMIN, JSON.stringify(admin));
    } catch (e) {}
  }

  function cerrarSesionAdmin() {
    try {
      localStorage.removeItem(STORAGE_TOKEN_ADMIN);
      localStorage.removeItem(STORAGE_PERFIL_ADMIN);
    } catch (e) {}
    window.location.reload();
  }

  /**
   * Inicializa cualquier página modular de Alumno:
   * - Si ya hay un token válido guardado (de otra pestaña del sitio), carga directo el módulo.
   * - Si no hay sesión o expiró, muestra la tarjeta institucional de acceso.
   */
  async function iniciarModuloAlumno(opciones) {
    const root = document.getElementById(opciones.rootId || 'app-root');
    if (!root) return;

    renderizarCascaron(root, opciones.tituloModulo, false);
    const bodyMount = document.getElementById('core-module-mount');

    const sesionGuardada = obtenerSesionAlumno();
    if (sesionGuardada && sesionGuardada.token) {
      bodyMount.replaceChildren(el('div', 'empty-state', 'Cargando información de tu programa académico...'));
      try {
        const res = await apiCall({
          action: opciones.actionCarga,
          token: sesionGuardada.token
        });
        if (res.status === 'success') {
          if (res.perfil) guardarSesionAlumno(sesionGuardada.token, res.perfil);
          montarVistaAutenticadaAlumno(bodyMount, sesionGuardada.token, res, opciones);
          return;
        }
      } catch (e) {}
      // Si el token expiró, limpiar y mostrar login
      try { localStorage.removeItem(STORAGE_TOKEN_ALUMNO); } catch (e) {}
    }

    mostrarFormularioLoginAlumno(bodyMount, opciones);
  }

  function renderizarCascaron(root, tituloModulo, esAdmin) {
    root.replaceChildren();
    const shell = el('main', 'portal-shell');

    const header = el('header', 'top-header' + (esAdmin ? ' admin-mode' : ''));
    const brand = el('div', 'brand-block');
    brand.append(
      el('h1', '', (window.POSGRADO_CONFIG && window.POSGRADO_CONFIG.INSTITUCION) || 'Investigación y Posgrado'),
      el('p', '', esAdmin ? 'Consola de Administración Académica y Escolar' : 'Espacio Académico Exclusivo por Programa')
    );
    header.append(brand, el('div', 'module-tag-top', tituloModulo || 'Módulo'));

    const container = el('div', 'module-container');
    container.id = 'core-module-mount';

    const footer = el('footer', 'portal-footer');
    footer.append(
      el('span', '', 'Departamento de Investigación y Posgrado'),
      el('span', '', esAdmin ? 'Perfil Administrador' : 'Sesión cifrada por programa')
    );

    shell.append(header, container, footer);
    root.append(shell);
  }

  function mostrarFormularioLoginAlumno(mount, opciones) {
    mount.replaceChildren();

    // Si estamos en modo simulador local, mostrar barra rápida para probar cualquiera de las dos maestrías
    if (typeof window.__RENDER_BARRA_DEMO_ALUMNO__ === 'function') {
      mount.append(window.__RENDER_BARRA_DEMO_ALUMNO__(async (credDemo) => {
        document.getElementById('inp-nom').value = credDemo.nombre;
        document.getElementById('inp-cor').value = credDemo.correo;
        document.getElementById('inp-pas').value = credDemo.password;
        await ejecutarLogin();
      }));
    }

    const card = el('div', 'login-card');
    card.append(
      el('h2', '', opciones.tituloModulo || 'Acceso de Alumnos'),
      el('p', 'intro', 'Inicia sesión una sola vez con tus credenciales registradas; tu sesión permanecerá activa al cambiar entre las secciones del sitio.')
    );

    const g1 = el('div', 'field-group');
    g1.append(el('label', '', 'Nombre completo'), Object.assign(el('input'), { id: 'inp-nom', type: 'text', placeholder: 'Ej. Ramírez Ramírez Juan', autocomplete: 'off' }));

    const g2 = el('div', 'field-group');
    g2.append(el('label', '', 'Correo registrado'), Object.assign(el('input'), { id: 'inp-cor', type: 'email', placeholder: 'correo@ejemplo.com', autocomplete: 'off' }));

    const g3 = el('div', 'field-group');
    const inpPass = Object.assign(el('input'), { id: 'inp-pas', type: 'password', placeholder: '••••••••' });
    g3.append(el('label', '', 'Contraseña'), inpPass);

    const btn = el('button', 'btn btn-primary btn-block', 'Ingresar');
    btn.type = 'button';
    const alertBox = el('div', 'alert-box alert-error');

    async function ejecutarLogin() {
      const nombre = document.getElementById('inp-nom').value.trim();
      const correo = document.getElementById('inp-cor').value.trim();
      const password = document.getElementById('inp-pas').value.trim();

      alertBox.classList.remove('show');
      if (!nombre || !correo || !password) {
        alertBox.textContent = 'Completa Nombre completo, Correo y Contraseña.';
        alertBox.classList.add('show');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Verificando credenciales...';

      try {
        const loginRes = await apiCall({ action: 'auth_login', nombre, correo, password });
        if (loginRes.status !== 'success') {
          btn.disabled = false;
          btn.textContent = 'Ingresar';
          alertBox.textContent = loginRes.message || 'Credenciales incorrectas.';
          alertBox.classList.add('show');
          return;
        }

        guardarSesionAlumno(loginRes.token, loginRes.perfil);
        const modRes = await apiCall({ action: opciones.actionCarga, token: loginRes.token });
        if (modRes.status === 'success') {
          montarVistaAutenticadaAlumno(mount, loginRes.token, modRes, opciones);
        } else {
          throw new Error(modRes.message || 'No se pudo cargar el módulo.');
        }
      } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Ingresar';
        alertBox.textContent = err.message || 'Error de comunicación con el servidor.';
        alertBox.classList.add('show');
      }
    }

    btn.onclick = ejecutarLogin;
    inpPass.onkeydown = (e) => { if (e.key === 'Enter') ejecutarLogin(); };

    card.append(g1, g2, g3, btn, alertBox);
    mount.append(card);
  }

  function montarVistaAutenticadaAlumno(mount, token, respuestaInicial, opciones) {
    mount.replaceChildren();
    const perfil = respuestaInicial.perfil || {};

    const bar = el('div', 'student-bar');
    const info = el('div');
    const metaPartes = [];
    if (perfil.matricula) metaPartes.push('Matrícula: ' + perfil.matricula);
    if (perfil.correo) metaPartes.push(perfil.correo);
    info.append(
      el('p', 'eyebrow', 'Sesión Académica Activa'),
      el('h2', '', perfil.alumno || ''),
      el('p', 'student-meta', metaPartes.join(' · ')),
      el('span', 'program-pill', (perfil.programa && perfil.programa.nombre) || '')
    );

    const actions = el('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';

    const btnRecargar = el('button', 'btn btn-outline-slate btn-sm', 'Actualizar');
    btnRecargar.type = 'button';
    btnRecargar.onclick = async () => {
      btnRecargar.disabled = true;
      const fresco = await apiCall({ action: opciones.actionCarga, token });
      btnRecargar.disabled = false;
      if (fresco.status === 'success') {
        montarVistaAutenticadaAlumno(mount, token, fresco, opciones);
      }
    };

    const btnSalir = el('button', 'btn btn-outline btn-sm', 'Cerrar sesión');
    btnSalir.type = 'button';
    btnSalir.onclick = cerrarSesionAlumno;

    actions.append(btnRecargar, btnSalir);
    bar.append(info, actions);

    const feedback = el('div', 'alert-box alert-success');
    feedback.id = 'core-global-feedback';

    const contentArea = el('div');
    contentArea.id = 'core-module-content';

    mount.append(bar, feedback, contentArea);

    opciones.render(contentArea, respuestaInicial, {
      token,
      perfil,
      apiCall: (extraPayload) => apiCall({ ...extraPayload, token }),
      notificarExito: (msg) => {
        feedback.className = 'alert-box alert-success show';
        feedback.textContent = msg;
      },
      recargarVista: (nuevaData) => {
        opciones.render(contentArea, { ...respuestaInicial, ...nuevaData }, {
          token,
          perfil,
          apiCall: (extraPayload) => apiCall({ ...extraPayload, token }),
          notificarExito: (msg) => {
            feedback.className = 'alert-box alert-success show';
            feedback.textContent = msg;
          },
          recargarVista: () => {}
        });
      }
    });
  }

  function leerArchivoBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const s = String(reader.result || '');
        const idx = s.indexOf(',');
        resolve({
          nombre: file.name,
          mimeType: file.type || 'application/octet-stream',
          base64: idx !== -1 ? s.slice(idx + 1) : s
        });
      };
      reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'));
      reader.readAsDataURL(file);
    });
  }

  function parsearNumero(v) {
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    if (typeof v !== 'string' || !v.trim()) return null;
    const s = v.trim().replace(',', '.');
    return /^[-+]?\d+(\.\d+)?$/.test(s) && Number.isFinite(Number(s)) ? Number(s) : null;
  }

  function calcularPromedio(lista) {
    const ns = lista.map(parsearNumero).filter(n => n !== null);
    return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : null;
  }

  return {
    el,
    apiCall,
    iniciarModuloAlumno,
    renderizarCascaron,
    obtenerSesionAdmin,
    guardarSesionAdmin,
    cerrarSesionAdmin,
    leerArchivoBase64,
    parsearNumero,
    calcularPromedio
  };
})();
