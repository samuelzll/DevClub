function toggleInfo(id) {
    const box = document.getElementById(id);
    if (!box) return;

    document.querySelectorAll(".info-box").forEach(el => {
        if (el !== box) el.classList.remove("ativo");
    });

    box.classList.toggle("ativo");
}


document.addEventListener("DOMContentLoaded", () => {

    // INFO LINKS
    document.querySelectorAll(".informacoes a").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            toggleInfo(link.dataset.info);
        });
    });

    // GALERIA (apenas imagem)
    document.querySelectorAll(".foto-trufas img").forEach(img => {
        img.addEventListener("click", () => {
            abrirModal(img.src);
        });
    });

});



let carrinho = {};

function adicionarCarrinho(nome, preco) {
    if (!carrinho[nome]) {
        carrinho[nome] = { nome, preco, qtd: 1 };
    } else {
        carrinho[nome].qtd++;
    }

    atualizarContador();
    mostrarToast("Produto adicionado ao carrinho 🛒");
}



function atualizarContador() {
    const contador = document.getElementById("contador");
    let totalItens = 0;

    Object.values(carrinho).forEach(item => {
        totalItens += item.qtd;
    });

    contador.innerText = totalItens;

    contador.classList.remove("pulse");
    void contador.offsetWidth;
    contador.classList.add("pulse");
}


function abrirCarrinho() {
    document.getElementById("modalCarrinho").classList.add("ativo");
    renderCarrinho();
}

function fecharCarrinho() {
    document.getElementById("modalCarrinho").classList.remove("ativo");
}


function renderCarrinho() {
    const lista = document.getElementById("listaCarrinho");
    const totalEl = document.getElementById("totalCarrinho");

    lista.innerHTML = "";

    const itens = Object.values(carrinho);

    if (itens.length === 0) {
        lista.innerHTML = "<p>Seu carrinho está vazio 🛒</p>";
        totalEl.innerText = "R$ 0,00";
        return;
    }

    let total = 0;

    itens.forEach(item => {
        total += item.preco * item.qtd;

        const div = document.createElement("div");
        div.className = "item-carrinho";

        div.innerHTML = `
            <div class="item-info">
                <strong>${item.nome}</strong>
                <span>R$ ${item.preco.toFixed(2)}</span>
            </div>

            <div class="controle-qtd">
                <button onclick="diminuir('${item.nome}')">−</button>
                <span>${item.qtd}</span>
                <button onclick="aumentar('${item.nome}')">+</button>
            </div>
        `;

        lista.appendChild(div);
    });

    totalEl.innerText = `R$ ${total.toFixed(2)}`;
}

function aumentar(nome) {
    carrinho[nome].qtd++;
    atualizarContador();
    renderCarrinho();
}

function diminuir(nome) {
    carrinho[nome].qtd--;

    if (carrinho[nome].qtd <= 0) {
        delete carrinho[nome];
    }

    atualizarContador();
    renderCarrinho();
}


function finalizarPedido() {
    const nome = document.getElementById("nome").value;
    const endereco = document.getElementById("endereco").value;
    const telefone = document.getElementById("telefone").value;

    if (!nome || !endereco || !telefone) {
        alert("Preencha todos os dados!");
        return;
    }

    let mensagem = ` *Novo Pedido VS Trufas*%0A%0A`;
    mensagem += ` Nome: ${nome}%0A`;
    mensagem += ` Endereço: ${endereco}%0A`;
    mensagem += ` WhatsApp: ${telefone}%0A%0A`;
    mensagem += ` Itens:%0A`;

    let total = 0;
    Object.values(carrinho).forEach(item => {
    mensagem += `- ${item.nome} x${item.qtd} (R$ ${(item.preco * item.qtd).toFixed(2)})%0A`;
    total += item.preco * item.qtd;
    });


    mensagem += `%0A Total: R$ ${total.toFixed(2)}`;
    mensagem += `%0A Pagamento na entrega`;

    window.open(`https://wa.me/5585988338580?text=${mensagem}`);

    carrinho = {};
    atualizarContador();
    fecharCarrinho();
}

function abrirModal(src) {
    const modal = document.getElementById("modalImagem");
    const img = document.getElementById("imagemAmpliada");

    img.src = src;
    modal.classList.add("ativo");
}


document.querySelector("#modalImagem .fechar")
    ?.addEventListener("click", () => {
        document.getElementById("modalImagem").classList.remove("ativo");
    });

document.getElementById("modalImagem").addEventListener("click", (e) => {
    if (e.target.id === "modalImagem") {
        e.currentTarget.classList.remove("ativo");
    }
});

function mostrarToast(mensagem) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = mensagem;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 50);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function animarBotao(btn) {
    btn.classList.add("animar");
    setTimeout(() => btn.classList.remove("animar"), 400);
}

function animarCarrinho() {
    if (!btnCarrinho) return;

    btnCarrinho.classList.remove("shake");
    void btnCarrinho.offsetWidth; // força reflow
    btnCarrinho.classList.add("shake");

    setTimeout(() => {
        btnCarrinho.classList.remove("shake");
    }, 350);
}
