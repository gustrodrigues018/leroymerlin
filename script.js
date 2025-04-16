

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
// === Utilitários ===
function salvarLocal(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  
  function carregarLocal(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  }
  
  // Função para resetar apenas as retiradas
  function resetarRetiradas() {
    localStorage.removeItem('retiradas'); // Remove as retiradas do localStorage
    renderizarRetiradas(); // Atualiza a tabela de retiradas
  }
  
  // Função para resetar apenas o estoque
  function resetarEstoque() {
    localStorage.removeItem('epis'); // Remove os EPIs do localStorage
    renderizarEpis(); // Atualiza a tabela de EPIs
  }
  
  // === EPIs ===
  function adicionarEPI(nome, quantidade, categoria, tamanho) {
    const epis = carregarLocal('epis');
    const epiExistente = epis.find(e => e.nome === nome && e.tamanho === tamanho); // Verifica se o EPI já existe
    
    if (epiExistente) {
      // Se já existir, soma a quantidade
      epiExistente.quantidade += parseInt(quantidade);
    } else {
      // Se não existir, cria um novo EPI
      const novo = {
        id: Date.now(),
        nome,
        quantidade: parseInt(quantidade),
        categoria,
        tamanho: tamanho || '-',
        data: new Date().toISOString() // Adiciona a data de adição
      };
      epis.push(novo);
    }
    
    salvarLocal('epis', epis);
    renderizarEpis();
  }
  
  function deletarEPI(id) {
    let epis = carregarLocal('epis');
    // Filtra todos os EPIs que não têm o ID correspondente
    epis = epis.filter(e => e.id !== id);
    salvarLocal('epis', epis); // Salva o novo array sem o EPI excluído
    renderizarEpis(); // Re-renderiza a tabela para refletir a exclusão
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
  function registrarRetirada(ldap, nome_epi, quantidade, tamanho) {
    const epis = carregarLocal('epis');
    const epi = epis.find(e => e.nome === nome_epi && e.tamanho === tamanho); // Encontra o EPI que está sendo retirado
    
    if (epi) {
      if (epi.quantidade >= quantidade) {
        epi.quantidade -= parseInt(quantidade); // Subtrai a quantidade do estoque
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
        salvarLocal('epis', epis); // Atualiza o estoque com a nova quantidade
        renderizarRetiradas();
        renderizarEpis();
      } else {
        alert("Quantidade insuficiente em estoque para essa retirada.");
      }
    } else {
      alert("EPI não encontrado no estoque.");
    }
  }
  
  function deletarRetirada(id) {
    let retiradas = carregarLocal('retiradas');
    const retirada = retiradas.find(r => r.id === id); // Encontra a retirada a ser excluída
    
    if (retirada) {
      // Encontra o EPI correspondente à retirada
      const epis = carregarLocal('epis');
      const epi = epis.find(e => e.nome === retirada.nome_epi && e.tamanho === retirada.tamanho);
      
      if (epi) {
        // Adiciona de volta ao estoque
        epi.quantidade += retirada.quantidade;
        // Exclui a retirada
        retiradas = retiradas.filter(r => r.id !== id);
        salvarLocal('retiradas', retiradas);
        salvarLocal('epis', epis); // Atualiza o estoque
        renderizarRetiradas();
        renderizarEpis();
      }
    }
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
          <td><button onclick="deletarRetirada(${r.id})">Excluir Retirada</button></td>
        </tr>
      `;
    });
  }
  
  // === Eventos ===
  document.addEventListener('DOMContentLoaded', () => {
    // Estoque
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
  
    // Retiradas
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
  
    // Botão para resetar apenas as retiradas
    const botaoResetarRetiradas = document.querySelector('#resetarRetiradas');
    if (botaoResetarRetiradas) {
      botaoResetarRetiradas.addEventListener('click', () => {
        resetarRetiradas();
      });
    }
  
    // Botão para resetar apenas o estoque
    const botaoResetarEstoque = document.querySelector('#resetarEstoque');
    if (botaoResetarEstoque) {
      botaoResetarEstoque.addEventListener('click', () => {
        resetarEstoque();
      });
    }
  });
