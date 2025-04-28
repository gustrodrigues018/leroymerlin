// Estoque
let estoque = [];

function carregarEstoque() {
  const dados = localStorage.getItem("estoqueEPI");
  estoque = dados ? JSON.parse(dados) : [];
}

function salvarEstoque() {
  localStorage.setItem("estoqueEPI", JSON.stringify(estoque));
}

function renderizarEstoque() {
  const tbody = document.querySelector('#tabelaEstoque tbody');
  tbody.innerHTML = '';

  estoque.forEach((epi, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${epi.nome}</td>
      <td>${epi.quantidade}</td>
      <td>${epi.categoria}</td>
      <td>${epi.tamanho || '-'}</td>
      <td>
        <button onclick="editarEpi(${index})">Editar</button>
        <button onclick="removerEpi(${index})">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function enviarEpiParaGoogleSheets(epi) {
  const url = 'https://script.google.com/a/macros/ext.leroymerlin.com.br/s/AKfycbwlP_ymtYxVoafaW8Ca7vF2h0473uLeEV9czNpttLOSt42fqDGOEjUs3HqJwo9pdGIXQA/exec';
  
  try {
    const resposta = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(epi),
      headers: { 'Content-Type': 'application/json' }
    });

    if (resposta.ok) {
      console.log('EPI enviado para o Google Sheets com sucesso!');
    } else {
      console.error('Falha ao enviar para o Google Sheets.');
    }
  } catch (error) {
    console.error('Erro de conexão com o Google Sheets:', error);
  }
}

function adicionarOuSomarEPI(epi) {
  const existente = estoque.find(e =>
    e.nome === epi.nome &&
    e.categoria === epi.categoria &&
    e.tamanho === epi.tamanho
  );

  if (existente) {
    existente.quantidade += epi.quantidade;
  } else {
    estoque.push(epi);
  }

  salvarEstoque();
  renderizarEstoque();

  // Enviar o novo EPI para o Google Sheets
  enviarEpiParaGoogleSheets(epi);
}

function removerEpi(index) {
  estoque.splice(index, 1);
  salvarEstoque();
  renderizarEstoque();
}

function editarEpi(index) {
  const epi = estoque[index];
  const novoNome = prompt("Novo nome:", epi.nome);
  if (novoNome === null) return;

  const novaQuantidade = prompt("Nova quantidade:", epi.quantidade);
  if (novaQuantidade === null) return;

  const novaCategoria = prompt("Nova categoria:", epi.categoria);
  if (novaCategoria === null) return;

  const novoTamanho = prompt("Novo tamanho:", epi.tamanho);
  if (novoTamanho === null) return;

  epi.nome = novoNome;
  epi.quantidade = parseInt(novaQuantidade);
  epi.categoria = novaCategoria;
  epi.tamanho = novoTamanho;

  salvarEstoque();
  renderizarEstoque();
}

// Retiradas
let retiradas = [];

function carregarRetiradas() {
  const dados = localStorage.getItem("historicoRetirada");
  retiradas = dados ? JSON.parse(dados) : [];
}

function salvarRetiradas() {
  localStorage.setItem("historicoRetirada", JSON.stringify(retiradas));
}

function renderizarRetiradas() {
  const tbody = document.querySelector('#tabelaRetiradas tbody');
  tbody.innerHTML = '';

  retiradas.forEach((r, index) => {
    const data = new Date(r.data).toLocaleString();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data}</td>
      <td>${r.ldap}</td>
      <td>${r.nome_colaborador}</td>
      <td>${r.nome_epi}</td>
      <td>${r.quantidade}</td>
      <td>${r.tamanho || '-'}</td>
      <td>
        <button onclick="editarRetirada(${index})">Editar</button>
        <button onclick="removerRetirada(${index})">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function adicionarRetirada(retirada) {
  retiradas.push(retirada);
  salvarRetiradas();
  renderizarRetiradas();
}

function removerRetirada(index) {
  retiradas.splice(index, 1);
  salvarRetiradas();
  renderizarRetiradas();
}

function editarRetirada(index) {
  const r = retiradas[index];
  const novoNome = prompt("Novo nome do colaborador:", r.nome_colaborador);
  if (novoNome === null) return;

  const novoEpi = prompt("Novo nome do EPI:", r.nome_epi);
  if (novoEpi === null) return;

  const novaQuantidade = prompt("Nova quantidade:", r.quantidade);
  if (novaQuantidade === null) return;

  const novoTamanho = prompt("Novo tamanho:", r.tamanho);
  if (novoTamanho === null) return;

  r.nome_colaborador = novoNome;
  r.nome_epi = novoEpi;
  r.quantidade = parseInt(novaQuantidade);
  r.tamanho = novoTamanho;

  salvarRetiradas();
  renderizarRetiradas();
}

// Filtros
function aplicarFiltroEstoque(valor) {
  const filtro = valor.toLowerCase();
  const linhas = document.querySelectorAll('#tabelaEstoque tbody tr');
  linhas.forEach(linha => {
    const nome = linha.cells[0].textContent.toLowerCase();
    const categoria = linha.cells[2].textContent.toLowerCase();
    const tamanho = linha.cells[3].textContent.toLowerCase();
    const corresponde = nome.includes(filtro) || categoria.includes(filtro) || tamanho.includes(filtro);
    linha.style.display = corresponde ? '' : 'none';
  });
}

function aplicarFiltroRetiradas(valor) {
  const filtro = valor.toLowerCase();
  const linhas = document.querySelectorAll('#tabelaRetiradas tbody tr');
  linhas.forEach(linha => {
    const matricula = linha.cells[1].textContent.toLowerCase();
    linha.style.display = matricula.includes(filtro) ? '' : 'none';
  });
}
