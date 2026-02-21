require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
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

app.post('/users', async (req,res) =>{
  try{
    const {name,email,password,role} = req.body;

    if(!name || !email || !password || !role){
      return res.status(400).json({erro: 'todos os campos são obrigatórios'});
    }
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password,salt);

  const query = `
   INSERT INTO users (name, email, password_hash, role)
   VALUES ($1, $2, $3, $4)
   RETURNING id, name, email, role, created_at;
  `;

  const values = [name, email, passwordHash, role];
  const result = await pool.query(query, values);

  res.status(201).json({
    mensagem: 'Usuário criado com sucesso!',
    usuario: result.rows[0]
  })
}catch(erro){
  console.error('erro ao criar usuário', erro);
  if (erro.code === '23505'){
    return res.status(409).json({erro: 'Este e-mail já está em uso'});
  }
  res.status(500).json ({ erro: 'Erro interno no servidor ao criar usuário'})
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`servidor rodando na porta ${PORT}`)
})