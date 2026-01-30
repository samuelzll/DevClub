/************************************************
 * FIREBASE CONFIG (COMPAT - CORRETO)
 ************************************************/
const firebaseConfig = {
  apiKey: "AIzaSyCXmDR5KJMlyz3yH-PNq8lvNAOrp8fARSg",
  authDomain: "controle-de-contas-ffd6e.firebaseapp.com",
  projectId: "controle-de-contas-ffd6e",
  storageBucket: "controle-de-contas-ffd6e.firebasestorage.app",
  messagingSenderId: "598837042980",
  appId: "1:598837042980:web:41347081f0faeac28f1db1"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


/************************************************
 * VARIÁVEIS GLOBAIS
 ************************************************/
let dados = {
    entrada: 0,
    credito: [],
    demais: []
};

let chart = null;

/************************************************
 * ELEMENTOS DOM (CORREÇÃO IMPORTANTE)
 ************************************************/
const mesInput = document.getElementById("mes");
const entradaInput = document.getElementById("entrada");

const ccDesc = document.getElementById("ccDesc");
const ccValor = document.getElementById("ccValor");
const ccParcela = document.getElementById("ccParcela");

const dDesc = document.getElementById("dDesc");
const dValor = document.getElementById("dValor");
const dParcela = document.getElementById("dParcela");

const listaCredito = document.getElementById("listaCredito");
const listaDemais = document.getElementById("listaDemais");

const totalCreditoEl = document.getElementById("totalCredito");
const totalDemaisEl = document.getElementById("totalDemais");
const somaTotalEl = document.getElementById("somaTotal");
const saldoFinalEl = document.getElementById("saldoFinal");

const graficoMensal = document.getElementById("graficoMensal");

/************************************************
 * CARREGAR / SALVAR
 ************************************************/
async function carregar() {
    const mes = mesInput.value;
    const user = auth.currentUser;

    // Se não tiver mês ou usuário logado, para tudo
    if (!mes || !user) return; 

    // Mostra que está carregando (opcional, mas recomendado)
    somaTotalEl.textContent = "Carregando...";

    try {
        // Busca no caminho: usuarios -> ID do usuario -> meses -> 2024-01
        const docRef = db.collection("usuarios").doc(user.uid).collection("meses").doc(mes);
        const doc = await docRef.get();

        if (doc.exists) {
            dados = doc.data();
        } else {
            // Se não existir dados para esse mês, inicia zerado
            dados = {
                entrada: 0,
                credito: [],
                demais: []
            };
        }
        
        entradaInput.value = dados.entrada || 0;
        render(); // Atualiza a tela com os dados da nuvem

    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        alert("Erro ao carregar dados. Verifique sua internet.");
    }
}


function salvar() {
    const user = auth.currentUser;
    const mes = mesInput.value;

    if (!mes || !user) return;

    dados.entrada = Number(entradaInput.value) || 0;

    // Salva no Firestore
    db.collection("usuarios").doc(user.uid).collection("meses").doc(mes)
        .set(dados)
        .then(() => {
            console.log("Salvo com sucesso na nuvem!");
        })
        .catch((error) => {
            console.error("Erro ao salvar: ", error);
        });
}


/************************************************
 * PARCELAS AUTOMÁTICAS
 ************************************************/
async function gerarParcelas(tipo, item) {
    if (item.parcelas <= 1) return;
    const user = auth.currentUser;
    if (!user) return;

    // Loop pelas próximas parcelas
    for (let i = 2; i <= item.parcelas; i++) {
        const data = new Date(mesInput.value + "-01T12:00:00"); // Fix fuso horário
        data.setMonth(data.getMonth() + (i - 1));
        const novoMes = data.toISOString().slice(0, 7);

        const docRef = db.collection("usuarios").doc(user.uid).collection("meses").doc(novoMes);

        try {
            // 1. Pega os dados do mês futuro
            const docSnapshot = await docRef.get();
            let futuro;

            if (docSnapshot.exists) {
                futuro = docSnapshot.data();
            } else {
                futuro = { entrada: 0, credito: [], demais: [] };
            }

            // 2. Adiciona a parcela
            futuro[tipo].push({
                desc: item.desc,
                valor: item.valor,
                parcelas: item.parcelas,
                parcelasAtual: i
            });

            // 3. Salva de volta na nuvem
            await docRef.set(futuro, { merge: true });
            console.log(`Parcela ${i} salva em ${novoMes}`);

        } catch (error) {
            console.error("Erro ao gerar parcelas:", error);
        }
    }
}



/************************************************
 * ADICIONAR ITENS
 ************************************************/
function addCredito() {
    if (!ccDesc.value || !ccValor.value) return;

    const parcelas = Number(ccParcela.value) || 1;
    const valor = Number(ccValor.value);

    const item = {
        desc: ccDesc.value.trim(),
        valor: valor,              // 🔥 valor cheio
        parcelas: parcelas,
        parcelaAtual: 1
    };

    dados.credito.push(item);
    gerarParcelas("credito", item);

    limparInputs();
    salvar();
    render();
}


function addDemais() {
    if (!dDesc.value || !dValor.value) return;

    const parcelas = Number(dParcela.value) || 1;

    const item = {
        desc: dDesc.value.trim(),
        valor: Number(dValor.value), // 🔥 valor cheio
        parcelas: parcelas,
        parcelaAtual: 1
    };

    dados.demais.push(item);
    gerarParcelas("demais", item);

    limparInputs();
    salvar();
    render();
}


/************************************************
 * EDITAR / REMOVER
 ************************************************/
function remover(tipo, index) {
    if (!confirm("Remover este item?")) return;
    dados[tipo].splice(index, 1);
    salvar();
    render();
}

function editar(tipo, index) {
    const item = dados[tipo][index];

    const novaDesc = prompt("Descrição:", item.desc);
    if (novaDesc === null) return;

    const novoValor = prompt("Valor:", item.valor);
    if (novoValor === null || isNaN(novoValor)) return;

    const novaParcela = prompt("Parcelas (ex: 1/5):", item.parcelas || "");

    item.desc = novaDesc.trim();
    item.valor = Number(novoValor);
    item.parcela = novaParcela.trim();

    salvar();
    render();
}

/************************************************
 * RENDERIZAÇÃO
 ************************************************/
function render() {
    listaCredito.innerHTML = "";
    listaDemais.innerHTML = "";

    let totalCredito = 0;
    let totalDemais = 0;

    let htmlCredito = "";
    let htmlDemais = "";

    dados.credito.forEach((i, idx) => {
        totalCredito += i.valor;
        htmlCredito += `
            <div class="item">
                <span>${i.desc} - ${i.valor.toFixed(2)} ${
    i.parcelas > 1 ? `(${i.parcelaAtual}/${i.parcelas})` : "(À vista)"
}
</span>
                <div class="acoes">
                    <button onclick="editar('credito', ${idx})">✏️</button>
                    <button onclick="remover('credito', ${idx})">❌</button>
                </div>
            </div>
        `;
    });

dados.demais.forEach((i, idx) => {
    totalDemais += i.valor;
    htmlDemais += `
        <div class="item">
            <span>
                ${i.desc} - ${i.valor.toFixed(2)}
                ${i.parcelas > 1 ? `(${i.parcelaAtual}/${i.parcelas})` : "(À vista)"}
            </span>
            <div class="acoes">
                <button onclick="editar('demais', ${idx})">✏️</button>
                <button onclick="remover('demais', ${idx})">❌</button>
            </div>
        </div>
    `;
});


    listaCredito.innerHTML = htmlCredito;
    listaDemais.innerHTML = htmlDemais;

    atualizarTotais(totalCredito, totalDemais);
    atualizarGrafico(totalCredito, totalDemais);
}

/************************************************
 * TOTAIS / SALDO
 ************************************************/
function atualizarTotais(tc, td) {
    totalCreditoEl.textContent = tc.toFixed(2).replace(".", ",");
    totalDemaisEl.textContent = td.toFixed(2).replace(".", ",");

    const soma = tc + td;
    somaTotalEl.textContent = soma.toFixed(2).replace(".", ",");

    const saldo = (Number(entradaInput.value) || 0) - soma;
    saldoFinalEl.textContent = saldo.toFixed(2).replace(".", ",");

    saldoFinalEl.className = saldo < 0 ? "negativo" : "positivo";

}

/************************************************
 * GRÁFICO
 ************************************************/
function atualizarGrafico(tc, td) {
    if (typeof Chart === "undefined") return;

    if (chart) chart.destroy();

    chart = new Chart(graficoMensal, {
        type: "bar",
        data: {
            labels: ["Cartão", "Demais"],
            datasets: [{
                data: [tc, td]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

/************************************************
 * EXPORTAR PDF / EXCEL
 ************************************************/
function exportarPDF() {
    const texto = `
MÊS: ${mesInput.value}
ENTRADA: ${dados.entrada}

--- CARTÃO ---
${dados.credito.map(i => `${i.desc} - ${i.valor}`).join("\n")}

--- DEMAIS ---
${dados.demais.map(i => `${i.desc} - ${i.valor}`).join("\n")}

TOTAL: ${somaTotalEl.textContent}
SALDO: ${saldoFinalEl.textContent}
`;

    const blob = new Blob([texto], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "controle-mensal.txt";
    a.click();
}

function exportarExcel() {
    let csv = "Tipo,Descrição,Valor,Parcelas\n";

    dados.credito.forEach(i => {
        csv += `Cartão,${i.desc},${i.valor},${i.parcela || ""}\n`;
    });

    dados.demais.forEach(i => {
        csv += `Demais,${i.desc},${i.valor},${i.parcela || ""}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "controle-mensal.csv";
    a.click();
}

/************************************************
 * UTILIDADES
 ************************************************/
function limparInputs() {
    ccDesc.value = "";
    ccValor.value = "";
    ccParcela.value = "1";
    dDesc.value = "";
    dValor.value = "";
    dParcela.value = "1";
}


/************************************************
 * EVENTOS
 ************************************************/
mesInput.addEventListener("change", carregar);

entradaInput.addEventListener("input", () => {
    dados.entrada = Number(entradaInput.value) || 0;
    salvar();
    render();
});


function login() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
        alert("Preencha email e senha");
        return;
    }

    auth.signInWithEmailAndPassword(email, senha)
        .then(() => {
            document.querySelector(".login").style.display = "none";
        })
        .catch(err => {
            alert("Erro: " + err.message);
        });
}

auth.onAuthStateChanged(user => {
    const loginBox = document.getElementById("loginBox");
    const appContent = document.getElementById("appContent");
    const authBar = document.getElementById("authBar");
    const userEmail = document.getElementById("userEmail");

    if (user) {
        loginBox.style.display = "none";
        appContent.style.display = "block";
        authBar.style.display = "flex";
        userEmail.textContent = user.email;
        
        // 🔥 ADICIONE ISTO: Carrega os dados assim que logar
        carregar(); 
    } else {
        loginBox.style.display = "block";
        appContent.style.display = "none";
        authBar.style.display = "none";
    }
});



function logout() {
    auth.signOut();
}

function registrar() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
        alert("Preencha email e senha");
        return;
    }

    auth.createUserWithEmailAndPassword(email, senha)
        .then(() => {
            alert("Conta criada com sucesso!");
        })
        .catch(error => {
            alert(error.message);
        });
}