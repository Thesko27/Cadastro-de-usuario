const jwt = require("jsonwebtoken");
const knex = require("../connection/connections");
const hash = process.env.JWT_HASH;

const filterLogin = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({
            message: "Não autorizado",
        });
    }

    const token = authorization.replace("Bearer ", "").trim();
    try {
        const { id } = jwt.verify(token, hash);

        const usuarioExiste = await knex("usuarios").where({ id }).first();

        if (!usuarioExiste) {
            return res.status(404).json({
                message: "Usuário não existe",
            });
        }

        const { senha, ...usuario } = usuarioExiste;

        req.usuario = usuario;

        next();
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Erro interno do servidor",
        });
    }
};

module.exports = filterLogin;
