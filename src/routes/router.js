const express = require("express");
const routers = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const filterLogin = require("../middleware/filterLogin");
const { registerUser } = require("../controllers/users");

routers.post("/usuarios", registerUser);

// login
routers.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(404).json("É obrigatório email e senha");
    }

    try {
        const usuario = await knex("usuarios").where({ email }).first();

        if (!usuario) {
            return res.status(404).json("O usuario não foi encontrado");
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(400).json("Email e senha não confere");
        }

        const token = jwt.sign({ id: usuario.id }, hash, { expiresIn: "8h" });

        const { senha: _, ...dadosUsuario } = usuario;

        return res.status(200).json({
            usuario: dadosUsuario,
            token,
        });
    } catch (error) {
        return res.status(400).json(error.message);
    }
});

// filtro para verificar usuario logado
routers.use(filterLogin);

// obter perfil do usuario logado pelo token
routers.get("/perfil", async (req, res) => {
    return res.status(200).json(req.usuario);
});

// atualizar perfil do usuario logado
routers.put("/perfil", async (req, res) => {
    let { nome, email, senha, nome_loja } = req.body;
    const { id } = req.usuario;

    if (!nome && !email && !senha && !nome_loja) {
        return res
            .status(404)
            .json("É obrigatório informar ao menos um campo para atualização");
    }

    try {
        const usuarioExiste = await knex("usuarios").where({ id }).first();

        if (!usuarioExiste) {
            return res.status(404).json("Usuario não encontrado");
        }

        if (senha) {
            senha = await bcrypt.hash(senha, 10);
        }

        if (email !== req.usuario.email) {
            const emailUsuarioExiste = await knex("usuarios")
                .where({ email })
                .first();

            if (emailUsuarioExiste) {
                res.status(404).json("O Email já existe.");
                return;
            }
        }

        const usuarioAtualizado = await knex("usuarios").where({ id }).update({
            nome,
            email,
            senha,
            nome_loja,
        });

        if (!usuarioAtualizado) {
            return res.status(400).json("O usuario não foi atualizado");
        }

        res.status(200).json("Usuario foi atualizado com sucesso.");
        return;
    } catch (error) {
        return res.status(400).json(error.message);
    }
});

module.exports = routers;
