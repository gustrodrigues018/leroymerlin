// === Utilitários ===
function salvarLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function carregarLocal(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function resetarRetiradas() {
  localStorage.removeItem('retiradas');
  renderizarRetiradas();
}

function resetarEstoque() {
  localStorage.removeItem('epis');
  renderizarEpis();
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
    data: new Date().toISOString()
  };
  epis.push(novo);
  salvarLocal('epis', epis);
  renderizarEpis();
}

function deletarEPI(id) {
  let epis = carregarLocal('epis');
  epis = epis.filter(e => e.id !== id);
  salvarLocal('epis', epis);
  renderizarEpis();
}

// === Modal de Edição ===
function abrirModalEdicao(epi) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <h2>Editar EPI</h2>
      <label>Nome: <input type="text" id="edit-nome" value="${epi.nome}" /></label>
      <label>Quantidade: <input type="number" id="edit-quantidade" value="${epi.quantidade}" /></label>
      <label>Categoria: <input type="text" id="edit-categoria" value="${epi.categoria}" /></label>
      <label>Tamanho: <input type="text" id="edit-tamanho" value="${epi.tamanho}" /></label>
      <div class="modal-buttons">
        <button id="salvarEdicao">Salvar</button>
        <button id="cancelarEdicao">Cancelar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('salvarEdicao').onclick = () => {
    epi.nome = document.getElementById('edit-nome').value;
    epi.quantidade = parseInt(document.getElementById('edit-quantidade').value);
    epi.categoria = document.getElementById('edit-categoria').value;
    epi.tamanho = document.getElementById('edit-tamanho').value;
    const epis = carregarLocal('epis');
    const index = epis.findIndex(e => e.id === epi.id);
    if (index !== -1) {
      epis[index] = epi;
      salvarLocal('epis', epis);
      renderizarEpis();
    }
    modal.remove();
  };

  document.getElementById('cancelarEdicao').onclick = () => {
    modal.remove();
  };
}

function editarEPI(id) {
  const epis = carregarLocal('epis');
  const epi = epis.find(e => e.id === id);
  if (epi) abrirModalEdicao(epi);
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
        <td>
          <button class="btn-editar" onclick="editarEPI(${e.id})">EDITAR</button>
          <button onclick="deletarEPI(${e.id})">EXCLUIR</button>
        </td>
      </tr>
    `;
  });
}

// === Retiradas === (sem alterações)
function registrarRetirada(ldap, nome_colaborador, nome_epi, quantidade, tamanho) {
  const epis = carregarLocal('epis');
  const epi = epis.find(e => e.nome === nome_epi && e.tamanho === tamanho);

  if (epi) {
    if (epi.quantidade >= quantidade) {
      epi.quantidade -= parseInt(quantidade);
      const retiradas = carregarLocal('retiradas');
      const nova = {
        id: Date.now(),
        ldap,
        nome_colaborador,
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
    }

    retiradas = retiradas.filter(r => r.id !== id);
    salvarLocal('retiradas', retiradas);
    salvarLocal('epis', epis);
    renderizarRetiradas();
    renderizarEpis();
  }
}

function editarRetirada(id) {
  const retiradas = carregarLocal('retiradas');
  const retirada = retiradas.find(r => r.id === id);

  if (retirada) {
    const novoLdap = prompt("Nova matrícula:", retirada.ldap);
    const novoNome = prompt("Novo nome do colaborador:", retirada.nome_colaborador);
    const novoEpi = prompt("Novo nome do EPI:", retirada.nome_epi);
    const novaQtd = parseInt(prompt("Nova quantidade:", retirada.quantidade));
    const novoTam = prompt("Novo tamanho:", retirada.tamanho);

    if (novoLdap && novoNome && novoEpi && novaQtd) {
      retirada.ldap = novoLdap;
      retirada.nome_colaborador = novoNome;
      retirada.nome_epi = novoEpi;
      retirada.quantidade = novaQtd;
      retirada.tamanho = novoTam;
      salvarLocal('retiradas', retiradas);
      renderizarRetiradas();
    }
  }
}

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
        <td>${r.nome_colaborador}</td>
        <td>${r.nome_epi}</td>
        <td>${r.quantidade}</td>
        <td>${r.tamanho}</td>
        <td>
          <button onclick="editarRetirada(${r.id})">EDITAR</button>
          <button onclick="deletarRetirada(${r.id})">EXCLUIR</button>
        </td>
      </tr>
    `;
  });
}

// === Eventos ===
document.addEventListener('DOMContentLoaded', () => {
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

  const formRetirada = document.querySelector('#formRetirada');
  if (formRetirada) {
    renderizarRetiradas();
    formRetirada.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      registrarRetirada(
        form.ldap.value,
        form.nome_colaborador.value,
        form.nome_epi.value,
        form.quantidade.value,
        form.tamanho.value
      );
      form.reset();
    });
  }

  const botaoResetarRetiradas = document.querySelector('#resetarRetiradas');
  if (botaoResetarRetiradas) {
    botaoResetarRetiradas.addEventListener('click', () => {
      resetarRetiradas();
    });
  }

  const botaoResetarEstoque = document.querySelector('#resetarEstoque');
  if (botaoResetarEstoque) {
    botaoResetarEstoque.addEventListener('click', () => {
      resetarEstoque();
    });
  }

  const campoBusca = document.querySelector('#buscaLdap');
  if (campoBusca) {
    campoBusca.addEventListener('input', (e) => {
      const filtro = e.target.value.trim();
      renderizarRetiradas(filtro);
    });
  }
});
