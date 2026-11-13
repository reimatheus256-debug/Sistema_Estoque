
// LER OS DADOS SALVOS

function carregarLista(chave) {

    try {

        let lista = JSON.parse(localStorage.getItem(chave));

        if (Array.isArray(lista)) {
            return lista;
        }

    } catch (erro) {

        console.log("Dados inválidos em " + chave + ". Lista reiniciada.");

    }

    return [];

}

// LISTAS DO SISTEMA

let produtos = carregarLista("produtos");
let movimentos = carregarLista("movimentos");

let produtoEditando = -1;


// SALVAR OS DADOS

function salvarDados() {

    localStorage.setItem("produtos", JSON.stringify(produtos));
    localStorage.setItem("movimentos", JSON.stringify(movimentos));

}


// MOSTRAR AS TELAS

function mostrarTela(tela) {

    if (produtoEditando != -1 && tela != "produtos") {
        cancelarEdicao();
    }

    document.getElementById("inicio").style.display = "none";
    document.getElementById("produtos").style.display = "none";
    document.getElementById("movimentacoes").style.display = "none";
    document.getElementById("painel").style.display = "none";

    document.getElementById(tela).style.display = "block";

    atualizarSistema();

}


// CADASTRAR E EDITAR PRODUTOS

function cadastrarProduto() {

    let codigo = document.getElementById("codigo").value.trim();
    let nome = document.getElementById("nome").value.trim();

    let campoQuantidade = document.getElementById("quantidade");
    let quantidade = Number(campoQuantidade.value);

    if (codigo == "" || nome == "") {
        alert("Preencha o código e o nome do produto!");
        return;
    }

    if (campoQuantidade.value == "" ||
        quantidade < 0 ||
        !Number.isInteger(quantidade)) {

        alert("Informe uma quantidade válida!");
        return;

    }

    for (let i = 0; i < produtos.length; i++) {

        if (produtos[i].codigo == codigo && i != produtoEditando) {
            alert("Este código já está cadastrado!");
            return;
        }

    }

    if (produtoEditando == -1) {

        let produto = {
            codigo: codigo,
            nome: nome,
            quantidade: quantidade
        };

        produtos.push(produto);

        alert("Produto cadastrado com sucesso!");

    } else {

        produtos[produtoEditando].codigo = codigo;
        produtos[produtoEditando].nome = nome;

        produtoEditando = -1;

        document.getElementById("quantidade").disabled = false;

        alert("Produto atualizado com sucesso!");

    }

    limparFormulario();
    salvarDados();
    atualizarSistema();

}


// LIMPAR O FORMULÁRIO

function limparFormulario() {

    document.getElementById("codigo").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("quantidade").value = "";

}


// CANCELAR EDIÇÃO

function cancelarEdicao() {

    produtoEditando = -1;

    document.getElementById("quantidade").disabled = false;

    limparFormulario();

}


// EDITAR PRODUTO

function editarProduto(indice) {

    document.getElementById("codigo").value = produtos[indice].codigo;
    document.getElementById("nome").value = produtos[indice].nome;
    document.getElementById("quantidade").value = produtos[indice].quantidade;

    produtoEditando = indice;

    document.getElementById("quantidade").disabled = true;

    mostrarTela("produtos");

}


// EXCLUIR PRODUTO

function excluirProduto(indice) {

    let confirmar = confirm("Deseja excluir este produto?");

    if (confirmar == true) {

        if (produtoEditando != -1) {
            cancelarEdicao();
        }

        produtos.splice(indice, 1);

        salvarDados();
        atualizarSistema();

    }

}


// REGISTRAR ENTRADA OU SAÍDA

function registrarMovimento() {

    let indice = document.getElementById("produtoMovimento").value;
    let tipo = document.getElementById("tipoMovimento").value;

    let campoQuantidade = document.getElementById("quantidadeMovimento");
    let quantidade = Number(campoQuantidade.value);

    if (indice == "" || campoQuantidade.value == "" ||
        quantidade <= 0 || !Number.isInteger(quantidade)) {

        alert("Selecione um produto e informe uma quantidade válida!");
        return;

    }

    indice = Number(indice);

    let produto = produtos[indice];

    if (tipo == "saida" && quantidade > produto.quantidade) {

        alert("Não há quantidade suficiente em estoque!");
        return;

    }

    if (tipo == "entrada") {
        produto.quantidade = produto.quantidade + quantidade;
    } else {
        produto.quantidade = produto.quantidade - quantidade;
    }

    let movimento = {

        data: new Date().toLocaleString("pt-BR"),
        codigo: produto.codigo,
        nome: produto.nome,
        tipo: tipo,
        quantidade: quantidade

    };

    movimentos.push(movimento);

    document.getElementById("produtoMovimento").value = "";
    campoQuantidade.value = "";

    salvarDados();
    atualizarSistema();

    alert("Movimentação registrada com sucesso!");

}


// ATUALIZAR O SISTEMA

function atualizarSistema() {

    atualizarTabelaProdutos();
    atualizarListaMovimentos();
    atualizarPainel();
    atualizarSelecaoProdutos();

}


// MOSTRAR OS PRODUTOS

function atualizarTabelaProdutos() {

    let tabela = document.getElementById("listaProdutos");

    tabela.innerHTML = "";

    for (let i = 0; i < produtos.length; i++) {

        let linha = tabela.insertRow();

        linha.insertCell(0).innerText = produtos[i].codigo;
        linha.insertCell(1).innerText = produtos[i].nome;
        linha.insertCell(2).innerText = produtos[i].quantidade;

        let acoes = linha.insertCell(3);

        let botaoEditar = document.createElement("button");

        botaoEditar.innerText = "Editar";
        botaoEditar.className = "editar";

        botaoEditar.onclick = function () {
            editarProduto(i);
        };

        let botaoExcluir = document.createElement("button");

        botaoExcluir.innerText = "Excluir";
        botaoExcluir.className = "excluir";

        botaoExcluir.onclick = function () {
            excluirProduto(i);
        };

        acoes.appendChild(botaoEditar);
        acoes.appendChild(botaoExcluir);

    }

}


// ATUALIZAR A LISTA DE PRODUTOS

function atualizarSelecaoProdutos() {

    let selecao = document.getElementById("produtoMovimento");

    let valorSelecionado = selecao.value;

    selecao.innerHTML = '<option value="">Selecione um produto</option>';

    for (let i = 0; i < produtos.length; i++) {

        let opcao = document.createElement("option");

        opcao.value = i;
        opcao.textContent = produtos[i].codigo + " - " + produtos[i].nome;

        selecao.appendChild(opcao);

    }

    if (valorSelecionado != "" && produtos[Number(valorSelecionado)]) {
        selecao.value = valorSelecionado;
    }

}


// MOSTRAR O HISTÓRICO

function atualizarListaMovimentos() {

    let tabela = document.getElementById("listaMovimentos");

    tabela.innerHTML = "";

    for (let i = movimentos.length - 1; i >= 0; i--) {

        let linha = tabela.insertRow();

        linha.insertCell(0).innerText = movimentos[i].data;
        linha.insertCell(1).innerText = movimentos[i].codigo;
        linha.insertCell(2).innerText = movimentos[i].nome;

        let tipo = linha.insertCell(3);

        if (movimentos[i].tipo == "entrada") {
            tipo.innerText = "Entrada";
        } else {
            tipo.innerText = "Saída";
        }

        linha.insertCell(4).innerText = movimentos[i].quantidade;

    }

}


// ATUALIZAR O PAINEL

function atualizarPainel() {

    let total = 0;

    for (let i = 0; i < produtos.length; i++) {
        total = total + produtos[i].quantidade;
    }

    document.getElementById("totalProdutos").innerText = produtos.length;
    document.getElementById("totalQuantidade").innerText = total;

}


// CARREGAR AS INFORMAÇÕES AO ABRIR O SISTEMA

atualizarSistema();
