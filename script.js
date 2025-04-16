// === Utilitários ===
function salvarLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function carregarLocal(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// === EPIs ===
function adicionarEPI(nome, quantidade, categoria, tamanho) {
  const epis = carregarLocal('epis');
  const novo = {
    id: Date.now(),
    nome,
    quantidade: parseInt(quantidade),
    categoria,
    tamanho: tamanho || '-',
    data: new Date().toISOString() // Adiciona a data de adição
  };
  
  // Verifica se o EPI já existe e soma a quantidade se necessário
  const epiExistente = epis.find(e => e.nome === nome && e.tamanho === novo.tamanho);
  if (epiExistente) {
    epiExistente.quantidade += novo.quantidade;
  } else {
    epis.push(novo);
  }

  salvarLocal('epis', epis);
  renderizarEpis();
}

function deletarEPI(id) {
  let epis = carregarLocal('epis');
  epis = epis.filter(e => e.id !== id);
  salvarLocal('epis', epis);
  renderizarEpis();
}

function renderizarEpis() {
  const tbody = document.querySelector('#tabelaEpis tbody');
  if (!tbody) return;
  const epis = carregarLocal('epis');
  tbody.innerHTML = '';
  epis.forEach(e => {
    const dataFormatada = new Date(e.data).toLocaleString(); // Formata a data
    tbody.innerHTML += `
      <tr>
        <td>${e.id}</td>
        <td>${e.nome}</td>
        <td>${e.quantidade}</td>
        <td>${e.categoria}</td>
        <td>${e.tamanho || '-'}</td>
        <td>${dataFormatada}</td> <!-- Exibe a data formatada -->
        <td><button onclick="deletarEPI(${e.id})">Excluir</button></td>
      </tr>
    `;
  });
}

// === Retiradas ===
async function registrarRetirada(ldap, nome_epi, quantidade, tamanho) {
  const retiradas = carregarLocal('retiradas');
  const nova = {
    id: Date.now(),
    ldap,
    nome_epi,
    quantidade: parseInt(quantidade),
    tamanho: tamanho || '-',
    data: new Date().toISOString()
  };
  
  // Envia os dados para o Google Sheets via Web App
  const scriptURL = 'https://script.google.com/a/macros/ext.leroymerlin.com.br/s/AKfycbxsZwNJbScOBtogU_NZJtQl3HgLd2UmQZfFo9bBq-xrPqrPN6Q1eBrEoI_A5-29-_gFFA/exec'; // Substitua com a URL do seu Web App
  
  try {
    const res = await fetch(scriptURL, {
      method: 'POST',
      body: JSON.stringify(nova),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      alert("RETIRADA REGISTRADA COM SUCESSO!");
      retiradas.push(nova); // Se o envio for bem-sucedido, salva localmente
      salvarLocal('retiradas', retiradas);
      renderizarRetiradas();
    } else {
      alert("ERRO AO REGISTRAR RETIRADA.");
    }
  } catch (error) {
    alert("FALHA NA CONEXÃO COM O SERVIDOR.");
    console.error(error);
  }
}

function deletarRetirada(id) {
  let retiradas = carregarLocal('retiradas');
  retiradas = retiradas.filter(r => r.id !== id);
  salvarLocal('retiradas', retiradas);
  renderizarRetiradas();
}

function renderizarRetiradas() {
  const tbody = document.querySelector('#tabelaRetiradas tbody');
  if (!tbody) return;
  const retiradas = carregarLocal('retiradas');
  tbody.innerHTML = '';
  retiradas.forEach(r => {
    const dataFormatada = new Date(r.data).toLocaleString();
    tbody.innerHTML += `
      <tr>
        <td>${dataFormatada}</td>
        <td>${r.ldap}</td>
        <td>${r.nome_epi}</td>
        <td>${r.quantidade}</td>
        <td>${r.tamanho}</td>
        <td><button onclick="deletarRetirada(${r.id})">Excluir</button></td>
      </tr>
    `;
  });
}

// === Eventos ===
document.addEventListener('DOMContentLoaded', () => {
  // Formulário de Estoque
  const formAdicionar = document.querySelector('#formAdicionar');
  if (formAdicionar) {
    renderizarEpis();
    formAdicionar.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      adicionarEPI(form.nome.value, form.quantidade.value, form.categoria.value, form.tamanho.value);
      form.reset();
    });
  }

  // Formulário de Retiradas
  const formRetirada = document.querySelector('#formRetirada');
  if (formRetirada) {
    renderizarRetiradas();
    formRetirada.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      registrarRetirada(form.ldap.value, form.nome_epi.value, form.quantidade.value, form.tamanho.value);
      form.reset();
    });
  }
});

  
