require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.get("/teste-banco", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS hora_atual");
    res.json({
      mensagem: "Conexão com o banco bem-sucedida!",
      hora_banco: result.rows[0].hora_atual,
    });
  } catch (erro) {
    console.error("Erro ao conectar ao banco: ", erro);
    res.status(500).json({
      erro: "Falha na conexão com o banco de dados",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`servidor rodando na porta ${PORT}`)
})