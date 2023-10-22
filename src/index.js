require("dotenv").config();
const express = require("express");
const routers = require("./Routes/router");

const app = express();
app.use(express.json());
app.use(routers);

app.listen(process.env.PORT, () =>
    console.log(`Rodando na porta ${process.env.PORT} `)
);
