const knex = require("../connection/connections");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
    const { nome, email, senha, nome_loja } = req.body;

    if (!nome) {
        return res.status(404).json("O campo nome é obrigatório");
    }

    if (!email) {
        return res.status(404).json("O campo email é obrigatório");
    }

    if (!senha) {
        return res.status(404).json("O campo senha é obrigatório");
    }

    if (!nome_loja) {
        return res.status(404).json("O campo nome_loja é obrigatório");
    }

    try {
        const userFound = await knex("usuarios").where({ email }).first();

        if (userFound) {
            return res.status(400).json({
                message: "Usuário já cadastrado",
            });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const usuario = await knex("usuarios")
            .insert({
                nome,
                email,
                senha: senhaCriptografada,
                nome_loja,
            })
            .returning("*");

        return res.status(201).json(usuario[0]);
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Erro interno do servidor",
        });
    }
};

module.exports = {
    registerUser,
};
