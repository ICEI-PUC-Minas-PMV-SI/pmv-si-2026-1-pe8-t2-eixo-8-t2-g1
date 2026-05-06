const express = require("express");
const { Usuario } = require("../models");
const { isValidEmail, tratarErroSequelize } = require("../utils/utils");
const { hashPassword, signJwt, verifyPassword } = require("../utils/auth");

const router = express.Router();

const perfisValidos = ["Administrador", "Supervisor", "Padrão"];
const statusValidos = ["Ativo", "Inativo"];

function validarUsuario({ nome, email, perfil, status, senha }, obrigatorio = true) {
  if (obrigatorio && (!nome || !email || !perfil || !status || !senha)) {
    return "nome, email, perfil, status e senha são obrigatórios";
  }

  if (email !== undefined && !isValidEmail(email)) {
    return "email deve ser válido";
  }

  if (perfil !== undefined && !perfisValidos.includes(perfil)) {
    return "perfil deve ser Administrador, Supervisor ou Padrão";
  }

  if (status !== undefined && !statusValidos.includes(status)) {
    return "status deve ser Ativo ou Inativo";
  }

  if (senha !== undefined && String(senha).length < 6) {
    return "senha deve ter pelo menos 6 caracteres";
  }

  return null;
}

router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        message: "email e senha são obrigatórios",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "email deve ser válido",
      });
    }

    const usuario = await Usuario.findOne({
      where: { email },
    });

    if (!usuario || !verifyPassword(senha, usuario.senhaHash)) {
      return res.status(401).json({
        message: "Email ou senha inválidos",
      });
    }

    if (usuario.status !== "Ativo") {
      return res.status(403).json({
        message: "Usuário inativo",
      });
    }

    const token = signJwt({
      sub: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    });

    return res.json({
      token,
      usuario,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao realizar login",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      order: [["dataCriacao", "DESC"]],
    });

    return res.json(usuarios);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar usuários",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        message: "Usuário não encontrado",
      });
    }

    return res.json(usuario);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar usuário",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nome, email, perfil, status, senha } = req.body;
    const erroValidacao = validarUsuario({ nome, email, perfil, status, senha });

    if (erroValidacao) {
      return res.status(400).json({
        message: erroValidacao,
      });
    }

    const usuario = await Usuario.create({
      nome,
      email,
      perfil,
      status,
      senhaHash: hashPassword(senha),
    });

    return res.status(201).json(usuario);
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro interno ao cadastrar usuário");
  }
});

router.put("/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        message: "Usuário não encontrado",
      });
    }

    const { nome, email, perfil, status, senha } = req.body;
    const erroValidacao = validarUsuario({ nome, email, perfil, status, senha }, false);

    if (erroValidacao) {
      return res.status(400).json({
        message: erroValidacao,
      });
    }

    const usuarioAtualizado = await usuario.update({
      nome: nome ?? usuario.nome,
      email: email ?? usuario.email,
      perfil: perfil ?? usuario.perfil,
      status: status ?? usuario.status,
      senhaHash: senha !== undefined ? hashPassword(senha) : usuario.senhaHash,
    });

    return res.json(usuarioAtualizado);
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro interno ao atualizar usuário");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        message: "Usuário não encontrado",
      });
    }

    await usuario.destroy();

    return res.status(200).json({
      message: "Usuário deletado com sucesso",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao deletar usuário",
    });
  }
});

module.exports = router;
