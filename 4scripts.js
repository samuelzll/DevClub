/***********************************
 * CONFIGURAÇÕES DE SERVIÇOS
 ***********************************/
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
 * GALERIA + AUTO SLIDE
 ***********************************/
let indiceSlide = 0;
let intervaloSlide;

function iniciarAutoSlide() {
  pararAutoSlide();
  intervaloSlide = setInterval(() => {
    indiceSlide++;
    mostrarSlide(indiceSlide);
  }, 3000);
}

function pararAutoSlide() {
  clearInterval(intervaloSlide);
}

function abrirModal(indice = 0) {
  const modal = document.getElementById("modalGaleria");
  if (!modal) return;
  modal.style.display = "flex";
  indiceSlide = indice;
  mostrarSlide(indiceSlide);
  iniciarAutoSlide();
}

function fecharModal() {
  const modal = document.getElementById("modalGaleria");
  if (!modal) return;
  modal.style.display = "none";
  pararAutoSlide();
}

function mudarImagem(n) {
  pararAutoSlide();
  indiceSlide += n;
  mostrarSlide(indiceSlide);
  iniciarAutoSlide();
}

function mostrarSlide(n) {
  const slides = document.getElementsByClassName("imagem-slide");
  if (!slides || slides.length === 0) return;

  if (n >= slides.length) indiceSlide = 0;
  if (n < 0) indiceSlide = slides.length - 1;

  for (let slide of slides) slide.style.display = "none";
  slides[indiceSlide].style.display = "block";
}

/***********************************
 * TOGGLE INFO
 ***********************************/

function toggleInfo(id) {
  document.querySelectorAll('.info-box').forEach(box => {
    if (box.id !== id) box.style.display = 'none';
  });

  const box = document.getElementById(id);
  if (!box) return;
  box.style.display = (box.style.display === 'block') ? 'none' : 'block';
}

/***********************************
 * SISTEMA DE AGENDAMENTO
 ***********************************/
const STORAGE_KEY = 'agendamentos_estilomk';

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

/* Elementos DOM */
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
  if (btnAbrirPainel) btnAbrirPainel.addEventListener('click', togglePainel);

  renderPainel();
}

/***********************************
 * QUANDO DATA OU SERVIÇO MUDA
 * (bloqueia domingo e segunda)
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
 * considera a duração do serviço e horários por dia
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
    if (!conflita(isoDate, inicio, fim, barbeiro, agendamentos)) {
      horarios.push(horarioStr);
    }
  }

  return horarios;
}

/***********************************
 * CONFLITO ENTRE INTERVALOS
 * retorna true se houver conflito
 ***********************************/
function conflita(dataIso, inicio, fim, barbeiro, ags) {
  if (!ags || ags.length === 0) return false;

  // filtrar apenas agendamentos do barbeiro e do dia
  const ocupados = ags.filter(a => a.data === dataIso && a.barbeiro === barbeiro);

  for (let a of ocupados) {
    // a.hora é string "HH:MM"
    const [ah, am] = a.hora.split(':').map(Number);

    // construir Date do início do agendamento existente (respeita timezone local)
    const [y, m, d] = a.data.split('-').map(Number);
    const agInicio = new Date(y, m - 1, d, ah, am, 0);
    const durAg = (SERVICOS[a.servico] && SERVICOS[a.servico].duracao) || 30;
    const agFim = new Date(agInicio.getTime() + durAg * 60000);

    // se os intervalos se sobrepõem -> conflito
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
  listaEl.innerHTML = "";

  if (!listaEl) return;

  if (ags.length === 0) {
    listaEl.innerHTML = `<p style="color:#ddd;">Nenhum agendamento.</p>`;
    return;
  }

  ags.forEach(a => {
    const div = document.createElement('div');
    div.className = 'item-agendamento';

    const dataBR = new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR');

    const info = document.createElement('div');
    info.className = 'item-info';
    info.innerHTML = `<strong>${a.nome}</strong><br>${a.barbeiro}<br>${a.servico}<br>${dataBR} — ${a.hora}`;

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const btnExcluir = document.createElement('button');
    btnExcluir.innerText = 'Excluir';
    btnExcluir.addEventListener('click', () => {
      excluirAgendamento(a.id);
    });

    const btnWhats = document.createElement('button');
    btnWhats.innerText = 'Whats';
    btnWhats.addEventListener('click', () => abrirWhatsAppComAgendamento(a));

    actions.appendChild(btnExcluir);
    actions.appendChild(btnWhats);

    div.appendChild(info);
    div.appendChild(actions);
    listaEl.appendChild(div);
  });
}

function excluirAgendamento(id) {
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
  mostrarSlide(0);
  iniciarAutoSlide();
});

/***********************************
 * MODAIS DA GALERIA DE CORTES
 ***********************************/
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