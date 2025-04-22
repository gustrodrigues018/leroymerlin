const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Banco de dados MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'leroycotroll'
});

db.connect(err => {
  if (err) throw err;
  console.log('🟢 Conectado ao MySQL');
});

app.use(cors());
app.use(express.json());

// === EPIs ===
app.get('/api/epis', (req, res) => {
  db.query('SELECT * FROM epis', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post('/api/epis', (req, res) => {
  const { nome, quantidade, categoria, tamanho } = req.body;
  db.query(
    'SELECT * FROM epis WHERE nome = ? AND tamanho = ? AND categoria = ?',
    [nome, tamanho, categoria],
    (err, results) => {
      if (err) return res.status(500).send(err);

      if (results.length > 0) {
        // EPI já existe, somar
        const epi = results[0];
        const novaQuantidade = epi.quantidade + quantidade;
        db.query(
          'UPDATE epis SET quantidade = ? WHERE id = ?',
          [novaQuantidade, epi.id],
          (err2) => {
            if (err2) return res.status(500).send(err2);
            res.sendStatus(200);
          }
        );
      } else {
        // Novo EPI
        db.query(
          'INSERT INTO epis (nome, quantidade, categoria, tamanho, data) VALUES (?, ?, ?, ?, NOW())',
          [nome, quantidade, categoria, tamanho],
          (err2) => {
            if (err2) return res.status(500).send(err2);
            res.sendStatus(201);
          }
        );
      }
    }
  );
});

app.delete('/api/epis/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM epis WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

// === Retiradas ===
app.get('/api/retiradas', (req, res) => {
  db.query('SELECT * FROM retiradas', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post('/api/retiradas', (req, res) => {
  const { ldap, nome_colaborador, nome_epi, quantidade, tamanho } = req.body;
  db.query(
    'SELECT * FROM epis WHERE nome = ? AND tamanho = ?',
    [nome_epi, tamanho],
    (err, results) => {
      if (err) return res.status(500).send(err);

      if (results.length === 0) {
        return res.status(400).send("EPI não encontrado");
      }

      const epi = results[0];
      if (epi.quantidade < quantidade) {
        return res.status(400).send("Quantidade insuficiente");
      }

      // Subtrai do estoque
      db.query(
        'UPDATE epis SET quantidade = quantidade - ? WHERE id = ?',
        [quantidade, epi.id],
        (err2) => {
          if (err2) return res.status(500).send(err2);

          // Registra a retirada
          db.query(
            'INSERT INTO retiradas (ldap, nome_colaborador, nome_epi, quantidade, tamanho, data) VALUES (?, ?, ?, ?, ?, NOW())',
            [ldap, nome_colaborador, nome_epi, quantidade, tamanho],
            (err3) => {
              if (err3) return res.status(500).send(err3);
              res.sendStatus(201);
            }
          );
        }
      );
    }
  );
});

app.delete('/api/retiradas/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM retiradas WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send("Retirada não encontrada");

    const retirada = results[0];
    db.query(
      'UPDATE epis SET quantidade = quantidade + ? WHERE nome = ? AND tamanho = ?',
      [retirada.quantidade, retirada.nome_epi, retirada.tamanho],
      (err2) => {
        if (err2) return res.status(500).send(err2);

        db.query('DELETE FROM retiradas WHERE id = ?', [id], (err3) => {
          if (err3) return res.status(500).send(err3);
          res.sendStatus(200);
        });
      }
    );
  });
});

// === Iniciar servidor ===
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
