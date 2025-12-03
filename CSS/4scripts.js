/***********************************
 * Galeria + AUTO SLIDE (CORRIGIDO)
 ***********************************/
let indiceSlide = 0;
let intervaloSlide;

// Inicia autoplay
function iniciarAutoSlide() {
  pararAutoSlide();
  intervaloSlide = setInterval(() => {
    indiceSlide++;
    mostrarSlide(indiceSlide);
  }, 3000);
}

// Para autoplay
function pararAutoSlide() {
  clearInterval(intervaloSlide);
}

// Abrir modal
function abrirModal(indice = 0) {
  document.getElementById("modalGaleria").style.display = "flex";
  indiceSlide = indice;
  mostrarSlide(indiceSlide);
  iniciarAutoSlide();
}

// Fechar modal
function fecharModal() {
  document.getElementById("modalGaleria").style.display = "none";
  pararAutoSlide();
}

// Setas do slide
function mudarImagem(n) {
  pararAutoSlide();
  indiceSlide += n;
  mostrarSlide(indiceSlide);
  iniciarAutoSlide();
}

// Miniaturas + autoplay
function mostrarSlide(n) {
  const slides = document.getElementsByClassName("imagem-slide");
  const thumbs = document.querySelectorAll(".miniaturas img");

  // Corrige looping
  if (n >= slides.length) indiceSlide = 0;
  if (n < 0) indiceSlide = slides.length - 1;

  // Esconde todos
  for (let slide of slides) slide.style.display = "none";
  for (let t of thumbs) t.classList.remove("ativo");

  // Mostra slide atual
  slides[indiceSlide].style.display = "block";
  thumbs[indiceSlide].classList.add("ativo");
}

/***********************************
 * Toggle das info-box
 ***********************************/
function toggleInfo(id) {
  const boxes = document.querySelectorAll('.info-box');

  boxes.forEach(box => {
    if (box.id !== id) box.style.display = 'none';
  });

  const box = document.getElementById(id);
  box.style.display = (box.style.display === 'block') ? 'none' : 'block';
}

/***********************************
 * Sistema Avançado de Agendamento
 ***********************************/
const STORAGE_KEY = 'agendamentos_estilomk';

// Configurações
const HORA_INICIO = 9;   
const HORA_FIM = 19;     
const INTERVALO_MIN = 30;

// Elementos
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
 * Seleção de Barbeiro
 ***********************************/
document.querySelectorAll(".barbeiro-card").forEach(card => {
  card.addEventListener("click", function () {
    document.querySelectorAll(".barbeiro-card")
      .forEach(c => c.classList.remove("selecionado"));

    this.classList.add("selecionado");

    barbeiroInput.value = this.getAttribute("data-barbeiro");

    onDataChange();
  });
});

/***********************************
 * Inicialização
 ***********************************/
function initAgendamento() {
  const hoje = new Date();
  dataInput.min = hoje.toISOString().split('T')[0];

  dataInput.addEventListener('change', onDataChange);
  btnConfirm.addEventListener('click', onConfirmar);
  btnAbrirPainel.addEventListener('click', togglePainel);

  renderPainel();
}

/***********************************
 * Atualiza horários ao escolher data
 ***********************************/
function onDataChange() {
  const data = dataInput.value;
  const barbeiro = barbeiroInput.value;

  horaSelect.innerHTML = "";

  if (!barbeiro) {
    horaSelect.innerHTML = `<option>Escolha um barbeiro primeiro</option>`;
    return;
  }

  if (!data) {
    horaSelect.innerHTML = `<option>Selecione a data primeiro</option>`;
    return;
  }

  const horarios = gerarHorariosDisponiveis(data, barbeiro);

  if (horarios.length === 0) {
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
 * Horários disponíveis por barbeiro
 ***********************************/
function gerarHorariosDisponiveis(isoDate, barbeiro) {
  const agendamentos = loadAgendamentos();
  const horarios = [];

  const [y, m, d] = isoDate.split('-').map(Number);
  const dataSelecionada = new Date(y, m - 1, d);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (dataSelecionada < hoje) return [];

  for (let h = HORA_INICIO; h <= HORA_FIM; h++) {
    for (let min = 0; min < 60; min += INTERVALO_MIN) {
      const hh = String(h).padStart(2, '0');
      const mm = String(min).padStart(2, '0');
      const horario = `${hh}:${mm}`;

      if (!isSlotBooked(isoDate, horario, barbeiro, agendamentos)) {
        horarios.push(horario);
      }
    }
  }

  return horarios;
}

/***********************************
 * Verifica se horário está ocupado
 ***********************************/
function isSlotBooked(dateIso, hora, barbeiro, agendamentos = null) {
  if (!agendamentos) agendamentos = loadAgendamentos();
  return agendamentos.some(a =>
    a.data === dateIso &&
    a.hora === hora &&
    a.barbeiro === barbeiro
  );
}

/***********************************
 * Confirmar agendamento
 ***********************************/
function onConfirmar(e) {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const telefone = telefoneInput.value.trim();
  const servico = servicoSelect.value;
  const barbeiro = barbeiroInput.value;
  const data = dataInput.value;
  const hora = horaSelect.value;

  if (!barbeiro) {
    resultadoEl.innerText = 'Escolha um barbeiro.';
    resultadoEl.style.color = 'red';
    return;
  }

  if (!nome || !data || !hora) {
    resultadoEl.innerText = 'Preencha nome, barbeiro, data e horário.';
    resultadoEl.style.color = 'red';
    return;
  }

  if (isSlotBooked(data, hora, barbeiro)) {
    resultadoEl.innerText = 'Este horário já foi reservado.';
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
    hora,
    criadoEm: new Date().toISOString()
  };

  const agendamentos = loadAgendamentos();
  agendamentos.push(agendamento);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agendamentos));

  resultadoEl.innerText = 'Agendamento salvo! Abrindo WhatsApp...';
  resultadoEl.style.color = 'green';

  onDataChange();
  renderPainel();

  setTimeout(() => {
    abrirWhatsAppComAgendamento(agendamento);
  }, 600);
}

/***********************************
 * WhatsApp
 ***********************************/
function abrirWhatsAppComAgendamento(agendamento) {
  const telefoneBarbearia = "5585988338580";

  const dataBR = new Date(agendamento.data + 'T00:00:00')
    .toLocaleDateString('pt-BR');

  const mensagem = encodeURIComponent(
`Olá, gostaria de confirmar meu agendamento:

Nome: ${agendamento.nome}
Barbeiro: ${agendamento.barbeiro}
Data: ${dataBR}
Hora: ${agendamento.hora}
Serviço: ${agendamento.servico}
${agendamento.telefone ? `Telefone: ${agendamento.telefone}` : ''}`
  );

  window.open(`https://wa.me/${telefoneBarbearia}?text=${mensagem}`, '_blank');
}

/***********************************
 * Painel
 ***********************************/
function loadAgendamentos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function renderPainel() {
  const agendamentos = loadAgendamentos().sort((a, b) => {
    if (a.data === b.data) return a.hora.localeCompare(b.hora);
    return a.data.localeCompare(b.data);
  });

  listaEl.innerHTML = "";

  if (agendamentos.length === 0) {
    listaEl.innerHTML = '<p style="color:#ddd;">Nenhum agendamento.</p>';
    return;
  }

  agendamentos.forEach(a => {
    const item = document.createElement('div');
    item.className = 'item-agendamento';

    const info = document.createElement('div');
    info.className = 'item-info';

    const dataBR = new Date(a.data + 'T00:00:00')
      .toLocaleDateString('pt-BR');

    info.innerHTML =
      `<strong>${a.nome}</strong><br>
       <b>${a.barbeiro}</b><br>
       ${dataBR} — ${a.hora}<br>
       ${a.servico}${a.telefone ? ' • ' + a.telefone : ''}`;

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const btnExcluir = document.createElement('button');
    btnExcluir.innerText = 'Excluir';
    btnExcluir.addEventListener('click', () => excluirAgendamento(a.id));

    const btnWhats = document.createElement('button');
    btnWhats.style.marginLeft = '8px';
    btnWhats.innerText = 'Whats';
    btnWhats.addEventListener('click', () => abrirWhatsAppComAgendamento(a));

    actions.appendChild(btnExcluir);
    actions.appendChild(btnWhats);

    item.appendChild(info);
    item.appendChild(actions);

    listaEl.appendChild(item);
  });
}

function excluirAgendamento(id) {
  const agendamentos = loadAgendamentos().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agendamentos));
  renderPainel();

  if (dataInput.value) onDataChange();
}

/***********************************
 * Utils
 ***********************************/
function gerarId() {
  return 'ag-' + Date.now() + '-' + Math.floor(Math.random() * 9000 + 1000);
}

function togglePainel() {
  painel.style.display = painel.style.display === 'block' ? 'none' : 'block';
}

/***********************************
 * Start
 ***********************************/
document.addEventListener('DOMContentLoaded', () => {
  initAgendamento();
  mostrarSlide(0);
  iniciarAutoSlide(); // agora inicia corretamente
});



function abrirSlide(indice) {
  indiceSlide = indice;
  document.getElementById("modalGaleria").style.display = "none";
  document.getElementById("modalSlide").style.display = "flex";
  mostrarSlide(indiceSlide);
}

function fecharSlide() {
  document.getElementById("modalSlide").style.display = "none";
}

function abrirGaleria() {
  document.getElementById("modalGaleria").style.display = "flex";
}

