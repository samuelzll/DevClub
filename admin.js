function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  auth.signInWithEmailAndPassword(email, senha)
    .then(() => {
      window.location.href = "painel.html";
    })
    .catch(error => {
      alert("Erro no login: " + error.message);
    });
}

auth.onAuthStateChanged(user => {
  if (!user && window.location.pathname.includes("painel")) {
    window.location.href = "login.html";
  }
});


// PROTEÇÃO DO PAINEL
if (window.location.pathname.includes("painel")) {
}
const db = window.db;



// ENTRADA
function novaEntrada() {
  const descricao = descEntrada.value;
  const valor = Number(valorEntrada.value);

  if (!descricao || !valor) return alert("Preencha os campos");

  db.collection("financeiro")
    .doc("registros")
    .collection("itens")
    .add({
      tipo: "entrada",
      descricao,
      valor,
      data: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      descEntrada.value = "";
      valorEntrada.value = "";
    });
}



// SAÍDA
function novaSaida() {
  const descricao = descSaida.value;
  const valor = Number(valorSaida.value);

  if (!descricao || !valor) return alert("Preencha os campos");

  db.collection("financeiro")
    .doc("registros")
    .collection("itens")
    .add({
      tipo: "saida",
      descricao,
      valor,
      data: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      descSaida.value = "";
      valorSaida.value = "";
    });
}


function ouvirFinanceiro() {

  const lista = document.getElementById("listaRegistros");

  if (!lista) return; // 🔥 evita crash

  db.collection("financeiro")
    .doc("registros")
    .collection("itens")
    .orderBy("data", "desc")
    .onSnapshot(snapshot => {

      lista.innerHTML = "";

      let entradas = 0;
      let saidas = 0;

      snapshot.forEach(doc => {
        const item = doc.data();

        if (item.tipo === "entrada") entradas += item.valor;
        if (item.tipo === "saida") saidas += item.valor;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.tipo === "entrada" ? "Entrada" : "Saída"}</td>
          <td>${item.descricao}</td>
          <td>R$ ${item.valor.toFixed(2)}</td>
          <td>
            <button onclick="excluirRegistro('${doc.id}')">🗑️</button>
          </td>
        `;

        lista.appendChild(tr);
      });

      document.getElementById("totalEntradas").innerText = entradas.toFixed(2);
      document.getElementById("totalSaidas").innerText = saidas.toFixed(2);
      document.getElementById("lucro").innerText = (entradas - saidas).toFixed(2);

    });
}



function excluirRegistro(id) {
  if (!confirm("Deseja excluir?")) return;

  db.collection("financeiro")
    .doc("registros")
    .collection("itens")
    .doc(id)
    .delete();
}


function logout() {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
}
  function ouvirVendasSite() {
  db.collection("pedidos")
    .onSnapshot(snapshot => {

      let totalVendasSite = 0;

      snapshot.forEach(doc => {
        const pedido = doc.data();
        totalVendasSite += pedido.total;
      });

      // soma com entradas manuais
      const entradasAtuais = Number(document.getElementById("totalEntradas").innerText);
      document.getElementById("totalEntradas").innerText =
        (entradasAtuais + totalVendasSite).toFixed(2);

      document.getElementById("lucro").innerText =
        (entradasAtuais + totalVendasSite - Number(totalSaidas.innerText)).toFixed(2);
    });
}
ouvirFinanceiro();
ouvirVendasSite();
