// === Utilitários ===
async function getEpis() {
  const res = await fetch('/api/epis');
  return await res.json();
}

async function getRetiradas() {
  const res = await fetch('/api/retiradas');
  return await res.json();
}

// === EPIs ===
async function adicionarEPI(nome, quantidade, categoria, tamanho) {
  await fetch('/api/epis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome,
      quantidade: parseInt(quantidade),
      categoria,
      tamanho: tamanho || '-'
    })
  });
  renderizarEpis();
}

async function deletarEPI(id) {
  await fetch(`/api/epis/${id}`, { method: 'DELETE' });
  renderizarEpis();
}

async function renderizarEpis() {
  const tbody = document.querySelector('#tabelaEpis tbody');
  if (!tbody) return;
  const epis = await getEpis();
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
          <button onclick="deletarEPI(${e.id})">EXCLUIR</button>
        </td>
      </tr>
    `;
  });
}

// === Retiradas ===
async function registrarRetirada(ldap, nome_colaborador, nome_epi, quantidade, tamanho) {
  const res = await fetch('/api/retiradas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ldap,
      nome_colaborador,
      nome_epi,
      quantidade: parseInt(quantidade),
      tamanho: tamanho || '-'
    })
  });

  if (res.ok) {
    renderizarRetiradas();
    renderizarEpis();
  } else {
    const erro = await res.text();
    alert(erro);
  }
}

async function deletarRetirada(id) {
  await fetch(`/api/retiradas/${id}`, { method: 'DELETE' });
  renderizarRetiradas();
  renderizarEpis();
}

// === Renderizar retiradas com filtro por LDAP ===
async function renderizarRetiradas(filtroLdap = '') {
  const tbody = document.querySelector('#tabelaRetiradas tbody');
  if (!tbody) return;
  const retiradas = await getRetiradas();
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
          <button onclick="deletarRetirada(${r.id})">EXCLUIR</button>
        </td>
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

  // Os botões de reset estão obsoletos com MySQL, podem ser removidos
});
