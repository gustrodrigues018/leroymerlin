// === Utilitários ===
function salvarLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function carregarLocal(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// Função para resetar apenas as retiradas
function resetarRetiradas() {
  localStorage.removeItem('retiradas');
  renderizarRetiradas();
}

// Função para resetar apenas o estoque
function resetarEstoque() {
  localStorage.removeItem('epis');
  renderizarEpis();
}

// === EPIs ===
function adicionarEPI(nome, quantidade, categoria, tamanho) {
  const epis = carregarLocal('epis');
  const epiExistente = epis.find(e => e.nome === nome && e.tamanho === tamanho);

  if (epiExistente) {
    epiExistente.quantidade += parseInt(quantidade);
  } else {
    const novo = {
      id: Date.now(),
      nome,
      quantidade: parseInt(quantidade),
      categoria,
      tamanho: tamanho || '-',
      data: new Date().toISOString()
    };
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
    const dataFormatada = new Date(e.data).toLocaleString();
    tbody.innerHTML += `
      <tr>
        <td>${e.id}</td>
        <td>${e.nome}</td>
        <td>${e.quantidade}</td>
        <td>${e.categoria}</td>
        <td>${e.tamanho || '-'}</td>
        <td>${dataFormatada}</td>
        <td><button onclick="deletarEPI(${e.id})">EXCLUIR</button></td>
      </tr>
    `;
  });
}

// === Retiradas ===
function registrarRetirada(ldap, nome_epi, quantidade, tamanho) {
  const epis = carregarLocal('epis');
  const epi = epis.find(e => e.nome === nome_epi && e.tamanho === tamanho);

  if (epi) {
    if (epi.quantidade >= quantidade) {
      epi.quantidade -= parseInt(quantidade);
      const retiradas = carregarLocal('retiradas');
      const nova = {
        id: Date.now(),
        ldap,
        nome_epi,
        quantidade: parseInt(quantidade),
        tamanho: tamanho || '-',
        data: new Date().toISOString()
      };
      retiradas.push(nova);
      salvarLocal('retiradas', retiradas);
      salvarLocal('epis', epis);
      renderizarRetiradas();
      renderizarEpis();
    } else {
      alert("QUANTIDADE INSUFICIENTE EM ESTOQUE PARA ESSA RETIRADA.");
    }
  } else {
    alert("EPI NÃO ENCONTRADO NO ESTOQUE.");
  }
}

function deletarRetirada(id) {
  let retiradas = carregarLocal('retiradas');
  const retirada = retiradas.find(r => r.id === id);

  if (retirada) {
    const epis = carregarLocal('epis');
    const epi = epis.find(e => e.nome === retirada.nome_epi && e.tamanho === retirada.tamanho);

    if (epi) {
      epi.quantidade += retirada.quantidade;
      retiradas = retiradas.filter(r => r.id !== id);
      salvarLocal('retiradas', retiradas);
      salvarLocal('epis', epis);
      renderizarRetiradas();
      renderizarEpis();
    }
  }
}

// Modificação: renderizarRetiradas com filtro por LDAP
function renderizarRetiradas(filtroLdap = '') {
  const tbody = document.querySelector('#tabelaRetiradas tbody');
  if (!tbody) return;
  const retiradas = carregarLocal('retiradas');
  const retiradasFiltradas = retiradas.filter(r =>
    r.ldap.toLowerCase().includes(filtroLdap.toLowerCase())
  );
  tbody.innerHTML = '';
  retiradasFiltradas.forEach(r => {
    const dataFormatada = new Date(r.data).toLocaleString();
    tbody.innerHTML += `
      <tr>
        <td>${dataFormatada}</td>
        <td>${r.ldap}</td>
        <td>${r.nome_epi}</td>
        <td>${r.quantidade}</td>
        <td>${r.tamanho}</td>
        <td><button onclick="deletarRetirada(${r.id})">EXCLUIR RETIRADA</button></td>
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

  // Botão de resetar retiradas
  const botaoResetarRetiradas = document.querySelector('#resetarRetiradas');
  if (botaoResetarRetiradas) {
    botaoResetarRetiradas.addEventListener('click', () => {
      resetarRetiradas();
    });
  }

  // Botão de resetar estoque
  const botaoResetarEstoque = document.querySelector('#resetarEstoque');
  if (botaoResetarEstoque) {
    botaoResetarEstoque.addEventListener('click', () => {
      resetarEstoque();
    });
  }

  // Campo de busca por LDAP
  const campoBusca = document.querySelector('#buscaLdap');
  if (campoBusca) {
    campoBusca.addEventListener('input', (e) => {
      const filtro = e.target.value.trim();
      renderizarRetiradas(filtro);
    });
  }
});

