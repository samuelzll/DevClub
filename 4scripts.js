/***********************************
 * CONFIGURAÇÕES DE SERVIÇOS
 ***********************************/
function toggleInfo(id) {
  // Fecha todas as caixas .info-box (menos a de ADMIN)
  document.querySelectorAll('.info-box').forEach(box => {
      if (box.id !== id && box.id !== 'painelAgendamentos') {
          box.style.display = 'none';
      }
  });

  const box = document.getElementById(id);
  if (!box) return;

  // Alterna o display
  box.style.display = (box.style.display === 'block') ? 'none' : 'block';
}

const SERVICOS = {
  "Corte": { preco: 30, duracao: 30 },
  "Corte + Sobrancelha": { preco: 35, duracao: 35 },
  "Barba": { preco: 30, duracao: 30 },
  "Combo Corte + Barba": { preco: 50, duracao: 60 },
  "Corte + Pigmentação": { preco: 50, duracao: 60 },
  "Corte + Luzes": { preco: 90, duracao: 60 },
  "Nevou": { preco: 110, duracao: 90 }
};

/***********************************
 * CONFIG ADMIN
 ***********************************/
const ADMIN_PASSWORD = "mkadmin135"; // senha que você escolheu
const ADMIN_SESSION_KEY = "estilomk_admin";

/***********************************
 * CHAVES DE STORAGE
 ***********************************/
const STORAGE_KEY = 'agendamentos_estilomk';
const BLOCKED_SLOTS_KEY = 'blocked_slots_estilomk'; // { date, barbeiro, hora }
const BLOCKED_DAYS_KEY = 'blocked_days_estilomk'; // { date, barbeiro (opcional) }

/***********************************
 * HORÁRIOS E INTERVALO
 ***********************************/
const INTERVALO_MIN = 30; // passo para oferecer horários (30 minutos)

// Horários por dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
const HORARIOS_DIA = {
  0: null,                       // domingo fechado
  1: null,                       // segunda fechado
  2: { inicio: "09:00", fim: "19:30" },  // terça
  3: { inicio: "09:00", fim: "19:30" },  // quarta
  4: { inicio: "09:00", fim: "19:30" },  // quinta
  5: { inicio: "08:00", fim: "22:00" },  // sexta
  6: { inicio: "08:00", fim: "20:00" }   // sábado
};

/***********************************
 * ELEMENTOS DOM
 ***********************************/
const dataInput = document.getElementById('dataAgendamento');
const horaSelect = document.getElementById('horaAgendamento');
const nomeInput = document.getElementById('nomeAgendamento');
const telefoneInput = document.getElementById('telefoneAgendamento');
const servicoSelect = document.getElementById('servicoAgendamento');
const barbeiroInput = document.getElementById('barbeiroSelecionado');
const resultadoEl = document.getElementById('resultadoAgendamento');
const btnConfirm = document.getElementById('btnConfirmarAgendamento');
const btnAbrirPainel = document.getElementById('btnAbrirPainel');
const painel = document.getElementById('painelAgendamentos');
const listaEl = document.getElementById('listaAgendamentos');

/***********************************
 * POPULA SELECT DE SERVIÇOS
 ***********************************/
if (servicoSelect) {
  servicoSelect.innerHTML = "";
  for (let nome in SERVICOS) {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.innerText = `${nome} — R$${SERVICOS[nome].preco} — ${SERVICOS[nome].duracao}min`;
    servicoSelect.appendChild(opt);
  }
}

/***********************************
 * SELEÇÃO DE BARBEIRO
 ***********************************/
document.querySelectorAll(".barbeiro-card").forEach(card => {
  card.addEventListener("click", function () {
    document.querySelectorAll(".barbeiro-card")
      .forEach(c => c.classList.remove("selecionado"));

    this.classList.add("selecionado");
    barbeiroInput.value = this.getAttribute("data-barbeiro") || "";
    onDataChange();
  });
});

/***********************************
 * INICIALIZAÇÃO
 ***********************************/
function initAgendamento() {
  if (!dataInput) return;
  const hoje = new Date();
  dataInput.min = hoje.toISOString().split('T')[0];

  dataInput.addEventListener('change', onDataChange);
  if (servicoSelect) servicoSelect.addEventListener('change', onDataChange);
  if (btnConfirm) btnConfirm.addEventListener('click', onConfirmar);
  if (btnAbrirPainel) btnAbrirPainel.addEventListener('click', adminAbrirPainel);

  renderPainel();
}

/***********************************
 * ADMIN HELPERS
 ***********************************/
function isAdmin() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
}

function adminLoginFlow() {
  // tenta abrir painel se já for admin
  if (isAdmin()) return true;

  const senha = prompt("Senha de administrador:");
  if (senha === null) return false;
  if (senha === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
    alert("Acesso de administrador concedido.");
    renderPainel(); // atualiza a UI
    return true;
  } else {
    alert("Senha incorreta.");
    return false;
  }
}

function adminLogout() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  alert("Logout do administrador.");
  renderPainel();
  if (painel) painel.style.display = 'none';
}

/***********************************
 * BLOQUEIOS (localStorage)
 ***********************************/
function loadBlockedSlots() {
  try { return JSON.parse(localStorage.getItem(BLOCKED_SLOTS_KEY) || '[]'); } catch { return []; }
}
function saveBlockedSlots(arr) { localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(arr)); }

function loadBlockedDays() {
  try { return JSON.parse(localStorage.getItem(BLOCKED_DAYS_KEY) || '[]'); } catch { return []; }
}
function saveBlockedDays(arr) { localStorage.setItem(BLOCKED_DAYS_KEY, JSON.stringify(arr)); }

function bloquearSlot(date, barbeiro, hora) {
  const slots = loadBlockedSlots();
  // não duplicar
  if (!slots.find(s => s.date === date && s.barbeiro === barbeiro && s.hora === hora)) {
    slots.push({ date, barbeiro, hora });
    saveBlockedSlots(slots);
  }
  renderPainel();
  onDataChange();
}

function desbloquearSlot(date, barbeiro, hora) {
  const slots = loadBlockedSlots().filter(s => !(s.date === date && s.barbeiro === barbeiro && s.hora === hora));
  saveBlockedSlots(slots);
  renderPainel();
  onDataChange();
}

function bloquearDia(date, barbeiro) {
  const days = loadBlockedDays();
  if (!days.find(d => d.date === date && d.barbeiro === barbeiro)) {
    days.push({ date, barbeiro });
    saveBlockedDays(days);
  }
  renderPainel();
  onDataChange();
}

function desbloquearDia(date, barbeiro) {
  const days = loadBlockedDays().filter(d => !(d.date === date && d.barbeiro === barbeiro));
  saveBlockedDays(days);
  renderPainel();
  onDataChange();
}

/***********************************
 * QUANDO DATA OU SERVIÇO MUDA
 ***********************************/
function onDataChange() {
  if (!dataInput || !horaSelect) return;

  const data = dataInput.value;
  const barbeiro = barbeiroInput.value || "";

  horaSelect.innerHTML = "";

  if (!barbeiro) {
    horaSelect.innerHTML = `<option>Escolha um barbeiro primeiro</option>`;
    return;
  }

  if (!data) {
    horaSelect.innerHTML = `<option>Selecione a data primeiro</option>`;
    return;
  }

  // bloquear domingo(0) e segunda(1)
  const [y, m, d] = data.split('-').map(Number);
  const dataSelecionada = new Date(y, m - 1, d);
  const diaSemana = dataSelecionada.getDay();
  if (diaSemana === 0 || diaSemana === 1) {
    horaSelect.innerHTML = `<option>Barbearia fechada (Domingo e Segunda)</option>`;
    return;
  }

  // se dia bloqueado para este barbeiro -> sem horários
  const blockedDays = loadBlockedDays();
  if (blockedDays.find(bd => bd.date === data && bd.barbeiro === barbeiro)) {
    horaSelect.innerHTML = `<option>Dia bloqueado pelo administrador</option>`;
    return;
  }

  const horarios = gerarHorariosDisponiveis(data, barbeiro);

  if (!horarios || horarios.length === 0) {
    horaSelect.innerHTML = `<option>Nenhum horário disponível</option>`;
    return;
  }

  horaSelect.innerHTML = `<option value="">Escolha um horário</option>`;
  horarios.forEach(h => {
    const opt = document.createElement('option');
    opt.value = h;
    opt.innerText = h;
    horaSelect.appendChild(opt);
  });
}

/***********************************
 * GERAR HORÁRIOS DISPONÍVEIS
 ***********************************/
function gerarHorariosDisponiveis(isoDate, barbeiro) {
  const agendamentos = loadAgendamentos();
  const horarios = [];

  if (!servicoSelect) return horarios;
  const servicoAtual = servicoSelect.value;
  const duracao = (SERVICOS[servicoAtual] && SERVICOS[servicoAtual].duracao) || 30;

  // decompor data
  const [y, m, d] = isoDate.split('-').map(Number);
  const dataSelecionada = new Date(y, m - 1, d);

  // pegar config do dia
  const diaSemana = dataSelecionada.getDay();
  const configDia = HORARIOS_DIA[diaSemana];
  if (!configDia) return []; // dia fechado

  // parse horário de abertura/fechamento do config
  const [hInicio, minInicio] = configDia.inicio.split(':').map(Number);
  const [hFim, minFim] = configDia.fim.split(':').map(Number);

  const abertura = new Date(y, m - 1, d, hInicio, minInicio, 0);
  const fechamento = new Date(y, m - 1, d, hFim, minFim, 0);

  const blockedSlots = loadBlockedSlots();
  const blockedDays = loadBlockedDays();

  // if whole day blocked for this barber -> return []
  if (blockedDays.find(bd => bd.date === isoDate && bd.barbeiro === barbeiro)) return [];

  // iterar pelos slots (passo definido por INTERVALO_MIN)
  for (let t = abertura.getTime(); t <= fechamento.getTime(); t += INTERVALO_MIN * 60000) {
    const inicio = new Date(t);
    const fim = new Date(t + duracao * 60000);

    // se o início já é >= fechamento, pular
    if (inicio >= fechamento) continue;

    // se o fim ultrapassa o horário de fechamento, pular
    if (fim > fechamento) continue;

    const hh = String(inicio.getHours()).padStart(2, '0');
    const mm = String(inicio.getMinutes()).padStart(2, '0');
    const horarioStr = `${hh}:${mm}`;

    // verificar conflito com agendamentos existentes do barbeiro nesse dia
    if (conflita(isoDate, inicio, fim, barbeiro, agendamentos)) {
      continue;
    }

    // verificar bloqueios: slot exato ou dia global (já checado above)
    if (blockedSlots.find(s => s.date === isoDate && s.barbeiro === barbeiro && s.hora === horarioStr)) {
      continue;
    }

    horarios.push(horarioStr);
  }

  return horarios;
}

/***********************************
 * CONFLITO ENTRE INTERVALOS
 ***********************************/
function conflita(dataIso, inicio, fim, barbeiro, ags) {
  if (!ags || ags.length === 0) return false;

  // filtrar apenas agendamentos do barbeiro e do dia
  const ocupados = ags.filter(a => a.data === dataIso && a.barbeiro === barbeiro);

  for (let a of ocupados) {
    const [ah, am] = a.hora.split(':').map(Number);

    const [y, m, d] = a.data.split('-').map(Number);
    const agInicio = new Date(y, m - 1, d, ah, am, 0);
    const durAg = (SERVICOS[a.servico] && SERVICOS[a.servico].duracao) || 30;
    const agFim = new Date(agInicio.getTime() + durAg * 60000);

    if (inicio < agFim && fim > agInicio) {
      return true;
    }
  }

  return false;
}

/***********************************
 * CONFIRMAR AGENDAMENTO
 ***********************************/
function onConfirmar(e) {
  if (e && e.preventDefault) e.preventDefault();

  const nome = nomeInput.value.trim();
  const telefone = telefoneInput.value.trim();
  const servico = servicoSelect.value;
  const barbeiro = barbeiroInput.value;
  const data = dataInput.value;
  const hora = horaSelect.value;

  if (!nome || !telefone || !servico || !barbeiro || !data || !hora) {
    resultadoEl.innerText = 'Preencha todos os campos.';
    resultadoEl.style.color = 'red';
    return;
  }

  // checar novamente se slot ainda está livre (concorrência local)
  const duracao = SERVICOS[servico].duracao;
  const [y, m, d] = data.split('-').map(Number);
  const [hh, mm] = hora.split(':').map(Number);
  const inicio = new Date(y, m - 1, d, hh, mm, 0);
  const fim = new Date(inicio.getTime() + duracao * 60000);
  if (conflita(data, inicio, fim, barbeiro, loadAgendamentos())) {
    resultadoEl.innerText = 'Desculpe — horário ocupado. Escolha outro.';
    resultadoEl.style.color = 'red';
    onDataChange();
    return;
  }

  // checar bloqueios
  const blockedSlots = loadBlockedSlots();
  const blockedDays = loadBlockedDays();
  if (blockedDays.find(bd => bd.date === data && bd.barbeiro === barbeiro)) {
    resultadoEl.innerText = 'Desculpe — dia bloqueado pelo administrador.';
    resultadoEl.style.color = 'red';
    return;
  }
  if (blockedSlots.find(bs => bs.date === data && bs.barbeiro === barbeiro && bs.hora === hora)) {
    resultadoEl.innerText = 'Desculpe — horário bloqueado pelo administrador.';
    resultadoEl.style.color = 'red';
    return;
  }

  const agendamento = {
    id: gerarId(),
    nome,
    telefone,
    servico,
    barbeiro,
    data,
    hora
  };

  const ags = loadAgendamentos();
  ags.push(agendamento);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ags));

  resultadoEl.innerText = 'Agendado com sucesso! Abrindo WhatsApp...';
  resultadoEl.style.color = 'green';

  renderPainel();
  onDataChange();

  setTimeout(() => abrirWhatsAppComAgendamento(agendamento), 500);
}

/***********************************
 * WHATSAPP
 ***********************************/
function abrirWhatsAppComAgendamento(a) {
  const telefoneBarbearia = "5585988338580";
  const dataBR = new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR');

  const serv = SERVICOS[a.servico] || { preco: 0, duracao: 0 };

  const msg = encodeURIComponent(
`Olá! Gostaria de confirmar meu agendamento:

Nome: ${a.nome}
Telefone: ${a.telefone}
Serviço: ${a.servico}
Preço: R$${serv.preco}
Duração: ${serv.duracao} minutos
Barbeiro: ${a.barbeiro}
Data: ${dataBR}
Horário: ${a.hora}`
  );

  window.open(`https://wa.me/${telefoneBarbearia}?text=${msg}`, "_blank");
}

/***********************************
 * PAINEL DE AGENDAMENTOS
 ***********************************/
function loadAgendamentos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function renderPainel() {
  const ags = loadAgendamentos().sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
  if (!listaEl) return;

  // limpar e injetar controles admin no topo do painel
  listaEl.innerHTML = "";

  // topo com status e controles (injetado)
  if (painel) {
    let topo = painel.querySelector('.painel-topo');
    if (!topo) {
      topo = document.createElement('div');
      topo.className = 'painel-topo';
      topo.style.display = 'flex';
      topo.style.justifyContent = 'space-between';
      topo.style.alignItems = 'center';
      topo.style.marginBottom = '8px';
      painel.insertBefore(topo, painel.firstChild);
    }
    topo.innerHTML = `<div style="color:#ddd;font-size:14px;">Agendamentos (${ags.length})</div>`;
    // botões admin
    const ctrlDiv = document.createElement('div');
    if (isAdmin()) {
      const logoutBtn = document.createElement('button');
      logoutBtn.innerText = 'Logout Admin';
      logoutBtn.style.marginLeft = '8px';
      logoutBtn.addEventListener('click', adminLogout);
      ctrlDiv.appendChild(logoutBtn);
    } else {
      const info = document.createElement('span');
      info.style.color = '#bbb';
      info.style.fontSize = '13px';
      info.innerText = 'Faça login para gerenciar';
      ctrlDiv.appendChild(info);
    }
    topo.appendChild(ctrlDiv);
  }

  if (ags.length === 0) {
    listaEl.innerHTML = `<p style="color:#ddd;">Nenhum agendamento.</p>`;
    return;
  }

  ags.forEach(a => {
    const div = document.createElement('div');
    div.className = 'item-agendamento';
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.style.alignItems = 'center';
    div.style.padding = '8px';
    div.style.borderBottom = '1px solid #ffffff10';

    const dataBR = new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR');

    const info = document.createElement('div');
    info.className = 'item-info';
    info.innerHTML = `<strong>${a.nome}</strong><br>${a.barbeiro}<br>${a.servico}<br>${dataBR} — ${a.hora}`;

    const actions = document.createElement('div');
    actions.className = 'item-actions';
    actions.style.display = 'flex';
    actions.style.gap = '6px';

    // Botão Whats (disponível para todos)
    const btnWhats = document.createElement('button');
    btnWhats.innerText = 'Whats';
    btnWhats.addEventListener('click', () => abrirWhatsAppComAgendamento(a));
    actions.appendChild(btnWhats);

    // Botões admin: Excluir / Bloquear horário / Bloquear dia
    if (isAdmin()) {
      const btnExcluir = document.createElement('button');
      btnExcluir.innerText = 'Excluir';
      btnExcluir.addEventListener('click', () => {
        if (confirm('Excluir agendamento?')) {
          excluirAgendamento(a.id);
        }
      });
      actions.appendChild(btnExcluir);

      const btnBloqSlot = document.createElement('button');
      btnBloqSlot.innerText = 'Bloquear horário';
      btnBloqSlot.addEventListener('click', () => {
        if (confirm(`Bloquear ${a.data} ${a.hora} para ${a.barbeiro}?`)) {
          bloquearSlot(a.data, a.barbeiro, a.hora);
        }
      });
      actions.appendChild(btnBloqSlot);

      const btnBloqDia = document.createElement('button');
      btnBloqDia.innerText = 'Bloquear dia';
      btnBloqDia.addEventListener('click', () => {
        if (confirm(`Bloquear todo o dia ${a.data} para ${a.barbeiro}?`)) {
          bloquearDia(a.data, a.barbeiro);
        }
      });
      actions.appendChild(btnBloqDia);
    }

    div.appendChild(info);
    div.appendChild(actions);
    listaEl.appendChild(div);
  });

  // lista de bloqueios: mostrar para admin com opção de desbloquear
  if (isAdmin()) {
    const hr = document.createElement('hr');
    hr.style.border = 'none';
    hr.style.height = '1px';
    hr.style.background = '#ffffff20';
    hr.style.margin = '8px 0';
    listaEl.appendChild(hr);

    const blocoTitulo = document.createElement('div');
    blocoTitulo.style.color = '#ddd';
    blocoTitulo.style.marginBottom = '6px';
    blocoTitulo.innerText = 'Bloqueios (slots e dias)';
    listaEl.appendChild(blocoTitulo);

    const slots = loadBlockedSlots();
    if (slots.length === 0) {
      const p = document.createElement('p');
      p.style.color = '#bbb';
      p.innerText = 'Nenhum slot bloqueado.';
      listaEl.appendChild(p);
    } else {
      slots.forEach(s => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.padding = '6px 0';
        const left = document.createElement('div');
        left.style.color = '#eee';
        left.innerText = `${s.date} — ${s.hora} — ${s.barbeiro}`;
        const right = document.createElement('div');
        const btn = document.createElement('button');
        btn.innerText = 'Desbloquear';
        btn.addEventListener('click', () => {
          if (confirm('Desbloquear este horário?')) {
            desbloquearSlot(s.date, s.barbeiro, s.hora);
          }
        });
        right.appendChild(btn);
        row.appendChild(left);
        row.appendChild(right);
        listaEl.appendChild(row);
      });
    }

    const hr2 = document.createElement('hr');
    hr2.style.border = 'none';
    hr2.style.height = '1px';
    hr2.style.background = '#ffffff20';
    hr2.style.margin = '8px 0';
    listaEl.appendChild(hr2);

    const days = loadBlockedDays();
    if (days.length === 0) {
      const p2 = document.createElement('p');
      p2.style.color = '#bbb';
      p2.innerText = 'Nenhum dia bloqueado.';
      listaEl.appendChild(p2);
    } else {
      days.forEach(d => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.padding = '6px 0';
        const left = document.createElement('div');
        left.style.color = '#eee';
        left.innerText = `${d.date} — ${d.barbeiro}`;
        const right = document.createElement('div');
        const btn = document.createElement('button');
        btn.innerText = 'Desbloquear dia';
        btn.addEventListener('click', () => {
          if (confirm('Desbloquear este dia?')) {
            desbloquearDia(d.date, d.barbeiro);
          }
        });
        right.appendChild(btn);
        row.appendChild(left);
        row.appendChild(right);
        listaEl.appendChild(row);
      });
    }
  }
}

function excluirAgendamento(id) {
  if (!isAdmin()) {
    alert("Apenas administrador pode excluir agendamentos.");
    return;
  }
  const novo = loadAgendamentos().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(novo));
  renderPainel();
  onDataChange();
}

function togglePainel() {
  if (!painel) return;
  painel.style.display = (painel.style.display === 'block') ? 'none' : 'block';
}

/***********************************
 * ADMIN ABRIR PAINEL (com prompt)
 ***********************************/
function adminAbrirPainel() {
  // Se já é admin, só alterna
  if (isAdmin()) {
    togglePainel();
    return;
  }

  // tenta login
  const ok = adminLoginFlow();
  if (ok) togglePainel();
}

/***********************************
 * UTIL
 ***********************************/
function gerarId() {
  return 'ag-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
}

/***********************************
 * START
 ***********************************/
document.addEventListener('DOMContentLoaded', () => {
  initAgendamento();
  // se você tem slides/galeria, manter as funções originais
  try { mostrarSlide(0); iniciarAutoSlide(); } catch {}
});

/***********************************
 * (restante do seu código: galerias e partículas)
 * Copie abaixo as funções que você já tinha:
 ***********************************/

/***********************************
 * MODAIS DA GALERIA DE CORTES
 ***********************************/
let indiceSlide = 0;
function abrirSlide(ind) {
  indiceSlide = ind;
  const mg = document.getElementById("modalGaleria");
  const ms = document.getElementById("modalSlide");
  if (mg) mg.style.display = "none";
  if (ms) ms.style.display = "flex";
  mostrarSlide(indiceSlide);
}

function fecharSlide() {
  const ms = document.getElementById("modalSlide");
  if (ms) ms.style.display = "none";
}

function abrirGaleria() {
  const mg = document.getElementById("modalGaleria");
  if (mg) mg.style.display = "flex";
}

/***********************************
 * PARTÍCULAS NO FUNDO
 ***********************************/
const canvas = document.getElementById("fundoParticulas");
if (canvas) {
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const quantidade = 80;

  for (let i = 0; i < quantidade; i++) {
      particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 2,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5
      });
  }

  function animar() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;

          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
          ctx.fill();

          for (let j = index + 1; j < particles.length; j++) {
              const p2 = particles[j];
              const dist = Math.hypot(p.x - p2.x, p.y - p2.y);

              if (dist < 120) {
                  ctx.strokeStyle = "rgba(255,255,255,0.1)";
                  ctx.lineWidth = 1;
                  ctx.beginPath();
                  ctx.moveTo(p.x, p.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.stroke();
              }
          }
      });

      requestAnimationFrame(animar);
  }

  animar();

  window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  });
}

document.querySelectorAll('.mosaico-cortes .foto').forEach((foto, indice) => {
    foto.addEventListener('click', () => abrirSlide(indice));
});
