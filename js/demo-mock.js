/**
 * ============================================================================
 * SIMULADOR INTERACTIVO LOCAL (js/demo-mock.js)
 * ============================================================================
 * Se activa únicamente mientras `SCRIPT_URL` en `js/config.js` sea "MODO_SIMULADOR_LOCAL".
 * Guarda los cambios en localStorage de tu navegador para que si publicas un aviso,
 * link de Zoom, material o tarea desde `admin.html`, ¡lo veas reflejado de inmediato
 * al abrir `sesiones.html`, `materias.html` o `pagos.html`!
 */
(function () {
  const DEMO_STATE_KEY = 'posgrado_usjt_demo_db_v2';

  const INITIAL_DB = {
    POLITICAS: {
      programa: {
        id: 'POLITICAS',
        nombre: 'Maestría en Desarrollo de Políticas Públicas en Materia de Seguridad',
        tipoPeriodo: 'Cuatrimestre',
        duracionTexto: 'Duración: 6 cuatrimestres · 18 materias',
        periodos: [
          ['Teoría de la Inteligencia', 'Seguridad Pública en México', 'Estadística Delictiva en México'],
          ['Prospectiva en la Planeación Estratégica', 'Enfoques Metodológicos Aplicados al Análisis', 'Metodología de la Investigación'],
          ['Diseño de Políticas en Seguridad Pública', 'Prevención Situacional y Estudio Criminológico', 'Identificación y Análisis de Riesgos'],
          ['Implementación de Políticas Públicas', 'Elaboración de Agendas de Seguridad Pública', 'Seminario de Tesis I'],
          ['Evaluación de Políticas en Seguridad Pública', 'Derechos Humanos en la Administración Pública', 'Gobernabilidad y Participación Ciudadana'],
          ['Ética en Seguridad Pública', 'Liderazgo y Toma de Decisiones en Administración Pública', 'Seminario de Tesis II']
        ],
        datosBancarios: {
          banco: 'BBVA Institucional',
          beneficiario: 'Universidad / Investigación y Posgrado',
          clabe: '012 610 00192837465 1',
          convenio: 'Referencia: Matrícula del alumno',
          notas: 'Adjunta tu comprobante en PDF o imagen para actualizar tu estatus a Pagado al instante.'
        }
      },
      alumnoDemo: {
        nombre: 'Juan Ramírez Ramírez',
        correo: 'juan.ramirez@gmail.com',
        password: 'Demo2026',
        matricula: 'POS-PP-2026-014',
        notas: {
          'Teoría de la Inteligencia': '9.5',
          'Seguridad Pública en México': '9.0',
          'Estadística Delictiva en México': '9.8'
        }
      },
      clases: [
        { rowNumber: 2, materia: 'Prospectiva en la Planeación Estratégica', periodo: 'Cuatrimestre 2', docente: 'Dr. Alejandro Ríos Domínguez', correoDocente: 'arios@usjt.edu.mx', horario: 'Sábados 09:00 - 13:00 h', zoomUrl: 'https://zoom.us/j/89123456789', meetingId: '891 2345 6789', codigoZoom: 'USJT2026', grabacionesUrl: 'https://drive.google.com/', estatusMateria: 'En curso' },
        { rowNumber: 3, materia: 'Enfoques Metodológicos Aplicados al Análisis', periodo: 'Cuatrimestre 2', docente: 'Dra. Patricia Morales', correoDocente: 'pmorales@usjt.edu.mx', horario: 'Sábados 13:00 - 17:00 h', zoomUrl: 'https://zoom.us/j/84455667788', meetingId: '844 5566 7788', codigoZoom: 'POS2026', grabacionesUrl: '', estatusMateria: 'En curso' }
      ],
      materiales: [
        { rowNumber: 2, id: 'MAT-1', materia: 'Prospectiva en la Planeación Estratégica', tipo: 'Diapositivas', titulo: 'Sesión 3 · Construcción de Escenarios 2030', descripcion: 'Presentación oficial en PDF alojada en Drive.', url: '#recurso-drive', fecha: '18/11/2026' },
        { rowNumber: 3, id: 'MAT-2', materia: 'Prospectiva en la Planeación Estratégica', tipo: 'Libro', titulo: 'Godet, M. · De la anticipación a la acción', descripcion: 'Capítulos 2 y 4 obligatorios.', url: '#libro-drive', fecha: '10/11/2026' }
      ],
      tareas: [
        { rowNumber: 2, idTarea: 'TAR-PP-01', materia: 'Prospectiva en la Planeación Estratégica', titulo: 'Matriz de escenarios prospectivos', instrucciones: 'Subir análisis en PDF (4 a 6 cuartillas).', fechaLimite: '30/11/2026', puntajeMax: '100', activa: 'SI' }
      ],
      entregas: [],
      pagos: [
        { rowNumber: 2, idPago: 'PP-01', correo: 'juan.ramirez@gmail.com', matricula: 'POS-PP-2026-014', alumno: 'Juan Ramírez Ramírez', concepto: 'Reinscripción Cuatrimestre 2', periodo: 'Cuatrimestre 2', monto: '$3,500.00', fechaLimite: '05/11/2026', estatus: 'Pagado', fechaPago: '03/11/2026', referencia: 'BBVA-9912', folioVoucher: 'PAG-261103', driveUrl: '#voucher-drive' },
        { rowNumber: 3, idPago: 'PP-02', correo: 'TODOS', matricula: '', alumno: 'Todos los alumnos', concepto: 'Colegiatura Noviembre', periodo: 'Cuatrimestre 2', monto: '$2,800.00', fechaLimite: '28/11/2026', estatus: 'Pendiente', fechaPago: '', referencia: '', folioVoucher: '', driveUrl: '' }
      ],
      avisos: [
        { rowNumber: 2, fecha: '24/11/2026', titulo: 'Bienvenido a la Arquitectura Modular', mensaje: 'Si abres otra página del sitio (Materias, Calificaciones o Pagos), tu sesión se mantiene iniciada automáticamente.', importante: 'SI' }
      ]
    },

    CRIMINOLOGIA: {
      programa: {
        id: 'CRIMINOLOGIA',
        nombre: 'Maestría en Criminología y Justicia Penal',
        tipoPeriodo: 'Semestre',
        duracionTexto: 'Duración: 4 semestres · 16 materias',
        periodos: [
          ['Teorías Criminológicas', 'Cibercriminalidad', 'Investigación Criminal', 'Sistema de Justicia Penal'],
          ['Crimen Organizado', 'Análisis de Redes', 'Metodología de la Investigación Científica', 'Entrevista como Técnica de Investigación Criminal'],
          ['Sistemas de Identificación Humana', 'Criminalística de Campo y Laboratorio', 'Análisis de la Escena del Crimen', 'Análisis de la Conducta Criminal'],
          ['Perfilación Criminal', 'Tecnología Aplicada a la Investigación Criminal', 'Marco Jurídico para la Investigación Criminal', 'Las Pruebas Periciales']
        ],
        datosBancarios: {
          banco: 'BBVA Institucional',
          beneficiario: 'Universidad / Investigación y Posgrado',
          clabe: '012 610 00192837465 1',
          convenio: 'Referencia: Matrícula del alumno',
          notas: 'Adjunta tu comprobante en PDF o imagen para actualizar tu estatus a Pagado al instante.'
        }
      },
      alumnoDemo: {
        nombre: 'Acosta Muñoz Dulce Fernanda',
        correo: 'dulcefer3108@gmail.com',
        password: 'acostadf@2026',
        matricula: 'POS-CR-2026-001',
        notas: {
          'Teorías Criminológicas': '9.6',
          'Cibercriminalidad': '10',
          'Investigación Criminal': '9.2',
          'Sistema de Justicia Penal': '9.4'
        }
      },
      clases: [
        { rowNumber: 2, materia: 'Teorías Criminológicas', periodo: 'Semestre 1', docente: 'Dra. Laura Castellanos Vega', correoDocente: 'lcastellanos@usjt.edu.mx', horario: 'Sábados 08:00 - 11:00 h', zoomUrl: 'https://zoom.us/j/92233445566', meetingId: '922 3344 5566', codigoZoom: 'CRIM01', grabacionesUrl: 'https://drive.google.com/', estatusMateria: 'En curso' },
        { rowNumber: 3, materia: 'Cibercriminalidad', periodo: 'Semestre 1', docente: 'Mtro. Iván Herrera Solís', correoDocente: 'iherrera@usjt.edu.mx', horario: 'Sábados 11:00 - 14:00 h', zoomUrl: 'https://zoom.us/j/93344556677', meetingId: '933 4455 6677', codigoZoom: 'CIBER26', grabacionesUrl: '', estatusMateria: 'En curso' }
      ],
      materiales: [
        { rowNumber: 2, id: 'MAT-CR-1', materia: 'Cibercriminalidad', tipo: 'Diapositivas', titulo: 'Informática Forense y Cadena de Custodia Digital', descripcion: 'Protocolo pericial visto en sesión.', url: '#drive-ciber', fecha: '20/11/2026' }
      ],
      tareas: [
        { rowNumber: 2, idTarea: 'TAR-CR-01', materia: 'Teorías Criminológicas', titulo: 'Cuadro comparativo de escuelas criminológicas', instrucciones: 'Formato PDF con referencias APA 7.', fechaLimite: '30/11/2026', puntajeMax: '100', activa: 'SI' }
      ],
      entregas: [],
      pagos: [
        { rowNumber: 2, idPago: 'CR-01', correo: 'TODOS', matricula: '', alumno: 'Todos los alumnos', concepto: 'Colegiatura Mensualidad Noviembre', periodo: 'Semestre 1', monto: '$3,100.00', fechaLimite: '30/11/2026', estatus: 'Pendiente', fechaPago: '', referencia: '', folioVoucher: '', driveUrl: '' }
      ],
      avisos: [
        { rowNumber: 2, fecha: '24/11/2026', titulo: 'Sesión práctica de Cibercriminalidad', mensaje: 'El enlace directo a Zoom ya está disponible para entrar desde cualquier dispositivo.', importante: 'SI' }
      ]
    }
  };

  function leerDB() {
    try {
      const raw = localStorage.getItem(DEMO_STATE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return JSON.parse(JSON.stringify(INITIAL_DB));
  }

  function guardarDB(db) {
    try { localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(db)); } catch (e) {}
  }

  window.__RENDER_BARRA_DEMO_ALUMNO__ = function (onSelect) {
    const box = document.createElement('div');
    box.style.cssText = 'max-width:520px;margin:0 auto 16px;padding:12px 16px;background:#2c2e30;color:#fff;border-left:4px solid #bc955c;border-radius:4px;font-size:12.5px;';
    box.innerHTML = '<div style="margin-bottom:8px;color:#ddc9a3;font-weight:700;">SIMULADOR RÁPIDO (1 CLIC SIN ESCRIBIR CONTRASEÑA):</div>';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';

    const b1 = document.createElement('button');
    b1.type = 'button';
    b1.className = 'btn btn-primary btn-sm';
    b1.textContent = 'Entrar como Alumno: Políticas Públicas';
    b1.onclick = () => onSelect(INITIAL_DB.POLITICAS.alumnoDemo);

    const b2 = document.createElement('button');
    b2.type = 'button';
    b2.className = 'btn btn-gold btn-sm';
    b2.textContent = 'Entrar como Alumna: Criminología';
    b2.onclick = () => onSelect(INITIAL_DB.CRIMINOLOGIA.alumnoDemo);

    row.append(b1, b2);
    box.append(row);
    return box;
  };

  window.__RENDER_BARRA_DEMO_ADMIN__ = function (onSelect) {
    const box = document.createElement('div');
    box.style.cssText = 'max-width:520px;margin:0 auto 16px;padding:12px 16px;background:#2c2e30;color:#fff;border-left:4px solid #ab0033;border-radius:4px;font-size:12.5px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;';
    box.innerHTML = '<div><strong style="color:#ddc9a3;">DEMO COORDINACIÓN:</strong> Prueba el perfil de Administrador con 1 clic.</div>';
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-gold btn-sm';
    b.textContent = 'Entrar como Administrador';
    b.onclick = () => onSelect({ correo: 'investigacionyposgrado@usjt.edu.mx', password: 'AdminPosgrado2026!' });
    box.append(b);
    return box;
  };

  window.__POSGRADO_DEMO_API__ = async function (payload) {
    await new Promise(r => setTimeout(r, 220));
    const db = leerDB();
    const action = payload.action;

    if (action === 'auth_login') {
      const c = (payload.correo || '').toLowerCase().trim();
      let clave = null;
      if (c === db.POLITICAS.alumnoDemo.correo.toLowerCase()) clave = 'POLITICAS';
      if (c === db.CRIMINOLOGIA.alumnoDemo.correo.toLowerCase()) clave = 'CRIMINOLOGIA';
      if (!clave) return { status: 'error', message: 'En modo simulador usa cualquiera de los 2 botones superiores.' };
      const st = db[clave];
      return {
        status: 'success',
        token: 'DEMO_TOKEN_' + clave,
        perfil: {
          alumno: st.alumnoDemo.nombre,
          correo: st.alumnoDemo.correo,
          matricula: st.alumnoDemo.matricula,
          programa: st.programa
        }
      };
    }

    if (action === 'admin_login') {
      if ((payload.correo || '').toLowerCase().trim() !== 'investigacionyposgrado@usjt.edu.mx') {
        return { status: 'error', message: 'Haz clic en el botón "Entrar como Administrador" de arriba.' };
      }
      return {
        status: 'success',
        token: 'DEMO_ADMIN_TOKEN',
        admin: {
          nombre: 'Coordinación de Posgrado',
          correo: 'investigacionyposgrado@usjt.edu.mx',
          programas: [db.POLITICAS.programa, db.CRIMINOLOGIA.programa]
        }
      };
    }

    // Acciones Admin
    if (action.indexOf('admin_') === 0) {
      const pid = payload.programaId || 'POLITICAS';
      const nodo = db[pid];
      const nextRow = (arr) => (arr.reduce((m, x) => Math.max(m, x.rowNumber || 1), 1) + 1);

      if (action === 'admin_guardar_clase') {
        const idx = nodo.clases.findIndex(x => x.materia === payload.materia);
        const obj = {
          rowNumber: idx !== -1 ? nodo.clases[idx].rowNumber : nextRow(nodo.clases),
          materia: payload.materia, periodo: payload.periodo, docente: payload.docente,
          correoDocente: payload.correoDocente, horario: payload.horario, zoomUrl: payload.zoomUrl,
          meetingId: payload.meetingId, codigoZoom: payload.codigoZoom, grabacionesUrl: payload.grabacionesUrl,
          estatusMateria: payload.estatusMateria
        };
        if (idx !== -1) nodo.clases[idx] = obj; else nodo.clases.push(obj);
        guardarDB(db);
        return { status: 'success', message: 'Clase y enlace Zoom actualizados.', ...armarPanelAdmin(nodo) };
      }

      if (action === 'admin_agregar_material') {
        nodo.materiales.unshift({
          rowNumber: nextRow(nodo.materiales),
          id: 'MAT-' + Date.now(),
          materia: payload.materia,
          tipo: payload.tipo,
          titulo: payload.titulo,
          descripcion: payload.descripcion,
          url: payload.url || '#archivo-subido-a-drive',
          fecha: new Date().toLocaleDateString('es-MX')
        });
        guardarDB(db);
        return { status: 'success', message: 'Material alojado en Drive y publicado en la materia.', ...armarPanelAdmin(nodo) };
      }

      if (action === 'admin_crear_tarea') {
        nodo.tareas.unshift({
          rowNumber: nextRow(nodo.tareas),
          idTarea: 'TAR-' + Date.now(),
          materia: payload.materia,
          titulo: payload.titulo,
          instrucciones: payload.instrucciones,
          fechaLimite: payload.fechaLimite,
          puntajeMax: '100',
          activa: 'SI'
        });
        guardarDB(db);
        return { status: 'success', message: 'Tarea publicada para los alumnos del programa.', ...armarPanelAdmin(nodo) };
      }

      if (action === 'admin_publicar_aviso') {
        nodo.avisos.unshift({
          rowNumber: nextRow(nodo.avisos),
          fecha: new Date().toLocaleDateString('es-MX'),
          titulo: payload.titulo,
          mensaje: payload.mensaje,
          importante: payload.importante ? 'SI' : 'NO'
        });
        guardarDB(db);
        return { status: 'success', message: 'Comunicado publicado.', ...armarPanelAdmin(nodo) };
      }

      if (action === 'admin_crear_pago') {
        nodo.pagos.unshift({
          rowNumber: nextRow(nodo.pagos),
          idPago: 'COL-' + Date.now(),
          correo: payload.correo,
          matricula: '',
          alumno: payload.correo === 'TODOS' ? 'Todos los alumnos' : payload.correo,
          concepto: payload.concepto,
          periodo: payload.periodo,
          monto: payload.monto,
          fechaLimite: payload.fechaLimite,
          estatus: 'Pendiente',
          fechaPago: '', referencia: '', folioVoucher: '', driveUrl: ''
        });
        guardarDB(db);
        return { status: 'success', message: 'Cargo registrado.', ...armarPanelAdmin(nodo) };
      }

      if (action === 'admin_eliminar_fila') {
        nodo[payload.coleccion] = (nodo[payload.coleccion] || []).filter(x => x.rowNumber !== payload.rowNumber);
        guardarDB(db);
        return { status: 'success', message: 'Eliminado.', ...armarPanelAdmin(nodo) };
      }

      return { status: 'success', ...armarPanelAdmin(nodo) };
    }

    // Acciones Alumno
    const claveAlumno = (payload.token || '').replace('DEMO_TOKEN_', '');
    const st = db[claveAlumno];
    if (!st) return { status: 'unauthorized', message: 'Sesión expirada.' };

    const perfil = {
      alumno: st.alumnoDemo.nombre,
      correo: st.alumnoDemo.correo,
      matricula: st.alumnoDemo.matricula,
      programa: st.programa
    };

    if (action === 'mod_sesiones') {
      return {
        status: 'success',
        perfil,
        sesiones: st.clases,
        avisos: st.avisos.map(a => ({ ...a, importante: a.importante === 'SI' }))
      };
    }

    if (action === 'mod_materias' || action === 'subir_tarea') {
      let msg = '';
      if (action === 'subir_tarea') {
        const folio = 'ENT-' + Math.floor(10000 + Math.random() * 90000);
        st.entregas.unshift({
          rowNumber: st.entregas.length + 2,
          folio,
          fechaHora: new Date().toLocaleString('es-MX'),
          alumno: st.alumnoDemo.nombre,
          matricula: st.alumnoDemo.matricula,
          correo: st.alumnoDemo.correo,
          materia: payload.materia,
          idTarea: payload.idTarea || '',
          tituloTarea: payload.tituloTarea,
          nombreArchivo: payload.archivo.nombre,
          driveUrl: '#entrega-en-drive'
        });
        guardarDB(db);
        msg = 'Trabajo enviado a carpeta privada de Drive (Folio ' + folio + ').';
      }

      const periodos = st.programa.periodos.map((ms, i) => ({
        numero: i + 1,
        titulo: st.programa.tipoPeriodo + ' ' + (i + 1),
        materias: ms.map(nom => {
          const cl = st.clases.find(c => c.materia === nom) || {};
          const mats = st.materiales.filter(m => m.materia === nom);
          const tars = st.tareas.filter(t => t.materia === nom).map(t => ({
            ...t,
            abierta: true,
            entregaAlumno: st.entregas.find(e => e.idTarea === t.idTarea) || null
          }));
          const libres = st.entregas.filter(e => e.materia === nom && !e.idTarea);
          return {
            nombre: nom,
            periodoEtiqueta: st.programa.tipoPeriodo + ' ' + (i + 1),
            calificacion: st.alumnoDemo.notas[nom] || '',
            docente: cl.docente || 'Por asignar',
            correoDocente: cl.correoDocente || '',
            horario: cl.horario || 'Por confirmar',
            zoomUrl: cl.zoomUrl || '',
            meetingId: cl.meetingId || '',
            codigoZoom: cl.codigoZoom || '',
            grabacionesUrl: cl.grabacionesUrl || '',
            estatusMateria: cl.estatusMateria || '',
            materiales: mats,
            tareas: tars,
            entregasLibres: libres
          };
        })
      }));

      return { status: 'success', message: msg, perfil, periodos };
    }

    if (action === 'mod_calificaciones') {
      const periodos = st.programa.periodos.map((ms, i) => ({
        numero: i + 1,
        titulo: st.programa.tipoPeriodo + ' ' + (i + 1),
        materias: ms.map(nom => ({ nombre: nom, calificacion: st.alumnoDemo.notas[nom] || '' }))
      }));
      return { status: 'success', perfil, periodos };
    }

    if (action === 'mod_pagos' || action === 'subir_voucher') {
      let msg = '';
      if (action === 'subir_voucher') {
        const folio = 'PAG-' + Math.floor(10000 + Math.random() * 90000);
        const idx = st.pagos.findIndex(p => p.idPago === payload.idPago || p.concepto === payload.concepto);
        if (idx !== -1) {
          st.pagos[idx].estatus = 'Pagado';
          st.pagos[idx].folioVoucher = folio;
          st.pagos[idx].fechaPago = new Date().toLocaleString('es-MX');
          st.pagos[idx].driveUrl = '#voucher-en-drive';
        } else {
          st.pagos.unshift({
            rowNumber: st.pagos.length + 2,
            idPago: folio,
            correo: st.alumnoDemo.correo,
            alumno: st.alumnoDemo.nombre,
            concepto: payload.concepto,
            periodo: payload.periodo || 'Actual',
            monto: payload.monto || '—',
            fechaLimite: '—',
            estatus: 'Pagado',
            folioVoucher: folio,
            driveUrl: '#voucher-en-drive'
          });
        }
        guardarDB(db);
        msg = 'Voucher enviado a Drive y estatus cambiado a Pagado (' + folio + ').';
      }
      return { status: 'success', message: msg, perfil, datosBancarios: st.programa.datosBancarios, pagos: st.pagos };
    }

    return { status: 'error', message: 'Acción no reconocida' };
  };

  function armarPanelAdmin(nodo) {
    return {
      programa: nodo.programa,
      clases: nodo.clases,
      materiales: nodo.materiales,
      tareas: nodo.tareas,
      entregas: nodo.entregas,
      pagos: nodo.pagos,
      avisos: nodo.avisos
    };
  }
})();
