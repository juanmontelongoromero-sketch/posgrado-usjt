/**
 * MÓDULO 4: PAGOS Y ENVÍO PRIVADO DE VOUCHERS (js/mod-pagos.js)
 * Código exclusivo para la página de Pagos en Google Sites.
 */
document.addEventListener('DOMContentLoaded', () => {
  const { el, iniciarModuloAlumno, leerArchivoBase64 } = window.PosgradoCore;

  iniciarModuloAlumno({
    tituloModulo: 'Pagos y Comprobantes',
    actionCarga: 'mod_pagos',
    render: function renderPagos(container, data, ctx) {
      container.replaceChildren();

      asegurarModalVoucher(ctx, (res) => {
        ctx.notificarExito(res.message || 'Comprobante enviado y estatus actualizado a Pagado.');
        renderPagos(container, { ...data, pagos: res.pagos }, ctx);
      });

      // Referencias bancarias
      const b = data.datosBancarios || {};
      const bankCard = el('div', 'panel-card');
      bankCard.style.background = '#f6f1e7';
      bankCard.style.borderLeft = '4px solid #bc955c';
      bankCard.append(el('h3', '', 'Datos para Depósito o Transferencia'));
      const infoTxt = [
        b.banco ? 'Banco: ' + b.banco : '',
        b.beneficiario ? 'Beneficiario: ' + b.beneficiario : '',
        b.clabe ? 'CLABE: ' + b.clabe : '',
        b.convenio ? b.convenio : ''
      ].filter(Boolean).join('   |   ');
      bankCard.append(el('p', 'course-meta', infoTxt));
      if (b.notas) bankCard.append(el('p', 'course-meta', b.notas));
      container.append(bankCard);

      // Tabla de pagos
      const card = el('div', 'panel-card');
      const h3 = el('h3');
      h3.append(el('span', '', 'Estado de Cuenta del Alumno'));
      const btnNuevo = el('button', 'btn btn-primary btn-sm', 'Enviar comprobante de pago');
      btnNuevo.type = 'button';
      btnNuevo.onclick = () => abrirModalVoucher({});
      h3.append(btnNuevo);
      card.append(h3);

      const pagos = data.pagos || [];
      if (pagos.length === 0) {
        card.append(el('div', 'empty-state', 'No hay cargos registrados. Usa el botón superior para enviar un comprobante.'));
      } else {
        const wrap = el('div', 'table-wrap');
        const tbl = el('table', 'portal-table');
        tbl.innerHTML = '<thead><tr><th>Concepto</th><th>Periodo</th><th>Monto</th><th>Fecha límite</th><th>Estatus</th><th>Acción / Folio</th></tr></thead>';
        const tbody = el('tbody');

        pagos.forEach(p => {
          const tr = el('tr');
          const pagado = (p.estatus || '').toLowerCase() === 'pagado';
          tr.append(
            el('td', '', p.concepto),
            el('td', '', p.periodo || '—'),
            el('td', '', p.monto || '—'),
            el('td', '', p.fechaLimite || '—')
          );
          const tdEst = el('td');
          tdEst.append(el('span', 'status-pill ' + (pagado ? 'status-paid' : 'status-pending'), pagado ? 'Pagado' : p.estatus));
          tr.append(tdEst);

          const tdAcc = el('td');
          if (pagado) {
            tdAcc.append(el('span', 'course-meta', 'Voucher recibido' + (p.folioVoucher ? ' · ' + p.folioVoucher : '')));
          } else {
            const btn = el('button', 'btn btn-primary btn-sm', 'Subir voucher');
            btn.type = 'button';
            btn.onclick = () => abrirModalVoucher(p);
            tdAcc.append(btn);
          }
          tr.append(tdAcc);
          tbody.append(tr);
        });

        tbl.append(tbody);
        wrap.append(tbl);
        card.append(wrap);
      }

      container.append(card);
    }
  });

  let callbackVoucher = null;
  function asegurarModalVoucher(ctx, onSuccess) {
    callbackVoucher = onSuccess;
    if (document.getElementById('mod-dlg-voucher')) return;

    const backdrop = el('div', 'modal-backdrop');
    backdrop.id = 'mod-dlg-voucher';
    backdrop.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Enviar Comprobante de Pago (Voucher)</h3>
          <button class="modal-close" type="button" id="dlg-v-close">×</button>
        </div>
        <div class="modal-body">
          <div class="field-group">
            <label>Concepto de pago</label>
            <input id="dlg-v-concepto" type="text" placeholder="Ej. Colegiatura Mensualidad 1">
            <input id="dlg-v-id" type="hidden">
            <input id="dlg-v-per" type="hidden">
          </div>
          <div class="form-grid-2">
            <div class="field-group">
              <label>Monto pagado</label>
              <input id="dlg-v-monto" type="text" placeholder="Ej. $2,800.00">
            </div>
            <div class="field-group">
              <label>Referencia / Autorización</label>
              <input id="dlg-v-ref" type="text" placeholder="Ej. SPEI-839201">
            </div>
          </div>
          <div class="field-group" style="margin-bottom:0;">
            <label>Archivo del Voucher (PDF o Imagen · Máx. 12 MB)</label>
            <div class="dropzone-box" id="dlg-v-drop">
              <strong>Haz clic aquí para seleccionar tu voucher</strong>
              <p class="course-meta" style="margin-top:4px;">Actualiza tu estatus a Pagado inmediatamente sin mostrar carpetas de Drive</p>
              <div id="dlg-v-pill" class="selected-file-pill"></div>
            </div>
            <input id="dlg-v-file" type="file" accept=".pdf,image/*" style="display:none;">
          </div>
          <div id="dlg-v-err" class="alert-box alert-error"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline-slate" type="button" id="dlg-v-cancel">Cancelar</button>
          <button class="btn btn-primary" type="button" id="dlg-v-send">Enviar voucher</button>
        </div>
      </div>
    `;
    document.body.append(backdrop);

    const cerrar = () => backdrop.classList.remove('open');
    document.getElementById('dlg-v-close').onclick = cerrar;
    document.getElementById('dlg-v-cancel').onclick = cerrar;
    document.getElementById('dlg-v-drop').onclick = () => document.getElementById('dlg-v-file').click();
    document.getElementById('dlg-v-file').onchange = (e) => {
      const f = e.target.files[0];
      const pill = document.getElementById('dlg-v-pill');
      if (f) {
        pill.textContent = f.name + ' (' + (f.size / 1048576).toFixed(2) + ' MB)';
        pill.style.display = 'inline-block';
      } else {
        pill.style.display = 'none';
      }
    };

    document.getElementById('dlg-v-send').onclick = async () => {
      const idPago = document.getElementById('dlg-v-id').value.trim();
      const periodo = document.getElementById('dlg-v-per').value.trim();
      const concepto = document.getElementById('dlg-v-concepto').value.trim();
      const monto = document.getElementById('dlg-v-monto').value.trim();
      const referencia = document.getElementById('dlg-v-ref').value.trim();
      const fileInput = document.getElementById('dlg-v-file');
      const err = document.getElementById('dlg-v-err');
      const btn = document.getElementById('dlg-v-send');

      err.classList.remove('show');
      if (!concepto || !fileInput.files[0]) {
        err.textContent = 'Indica el concepto y adjunta tu comprobante.';
        err.classList.add('show');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Enviando comprobante...';
      try {
        const archivo = await leerArchivoBase64(fileInput.files[0]);
        const res = await ctx.apiCall({ action: 'subir_voucher', idPago, periodo, concepto, monto, referencia, archivo });
        btn.disabled = false;
        btn.textContent = 'Enviar voucher';
        if (res.status === 'success') {
          cerrar();
          if (callbackVoucher) callbackVoucher(res);
        } else {
          err.textContent = res.message || 'Error al subir comprobante.';
          err.classList.add('show');
        }
      } catch (ex) {
        btn.disabled = false;
        btn.textContent = 'Enviar voucher';
        err.textContent = ex.message || 'Error de conexión.';
        err.classList.add('show');
      }
    };
  }

  function abrirModalVoucher(p) {
    document.getElementById('dlg-v-id').value = p.idPago || '';
    document.getElementById('dlg-v-per').value = p.periodo || '';
    const c = document.getElementById('dlg-v-concepto');
    c.value = p.concepto || '';
    c.readOnly = Boolean(p.concepto);
    document.getElementById('dlg-v-monto').value = p.monto || '';
    document.getElementById('dlg-v-ref').value = '';
    document.getElementById('dlg-v-file').value = '';
    document.getElementById('dlg-v-pill').style.display = 'none';
    document.getElementById('dlg-v-err').classList.remove('show');
    document.getElementById('mod-dlg-voucher').classList.add('open');
  }
});
