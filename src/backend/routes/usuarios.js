const express = require("express");
const { Usuario, Perfil, Permissao } = require("../models");
const { isIntegerGreaterThanZero, isValidEmail, tratarErroSequelize } = require("../utils/utils");
const { hashPassword, signJwt, verifyPassword } = require("../utils/auth");

const router = express.Router();

const statusValidos = ["Ativo", "Inativo"];

const usuarioInclude = [
  {
    model: Perfil,
    as: "perfilInfo",
    attributes: ["id", "nome"],
  },
];

function validarUsuario({ nome, email, status, senha }, obrigatorio = true) {
  if (obrigatorio && (!nome || !email || !status || !senha)) {
    return "nome, email, status e senha são obrigatórios";
  }

  if (email !== undefined && !isValidEmail(email)) {
    return "email deve ser válido";
  }

  if (status !== undefined && !statusValidos.includes(status)) {
    return "status deve ser Ativo ou Inativo";
  }

  if (senha !== undefined && String(senha).length < 6) {
    return "senha deve ter pelo menos 6 caracteres";
  }

  return null;
}

async function resolverIdPerfil({ perfil, idPerfil }, obrigatorio = true) {
  if (idPerfil !== undefined) {
    const idPerfilNumero = Number(idPerfil);

    if (!isIntegerGreaterThanZero(idPerfilNumero)) {
      return {
        erro: "idPerfil deve ser um número inteiro maior que zero",
      };
    }

    const perfilEncontrado = await Perfil.findByPk(idPerfilNumero);

    if (!perfilEncontrado) {
      return {
        erro: "Perfil não encontrado",
      };
    }

    return {
      idPerfil: idPerfilNumero,
    };
  }

  if (perfil !== undefined) {
    const perfilEncontrado = await Perfil.findOne({
      where: {
        nome: perfil,
      },
    });

    if (!perfilEncontrado) {
      return {
        erro: "Perfil não encontrado",
      };
    }

    return {
      idPerfil: perfilEncontrado.id,
    };
  }

  if (obrigatorio) {
    return {
      erro: "perfil ou idPerfil é obrigatório",
    };
  }

  return {
    idPerfil: undefined,
  };
}

async function buscarUsuarioCompleto(id) {
  return Usuario.findByPk(id, {
    attributes: { exclude: ['senhaHash'] },
    include: usuarioInclude,
  });
}

async function buscarChavesPermissoes(idPerfil) {
  const perfil = await Perfil.findByPk(idPerfil, {
    include: [
      {
        model: Permissao,
        as: "permissoes",
        attributes: ["chave"],
        through: {
          attributes: [],
        },
      },
    ],
  });

  return perfil?.permissoes?.map((permissao) => permissao.chave) || [];
}

async function buscarUsuarioRole(idPerfil) {
  const perfil = await Perfil.findByPk(idPerfil, {
    attributes: ["nome"]
  })
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
      where: { 
        email 
      },
      include: usuarioInclude,
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

    const usuarioJson = usuario.toJSON();
    const token = signJwt({
      sub: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      idPerfil: usuario.idPerfil,
      perfil: usuarioJson.perfil,
    });

    const permissoes = await buscarChavesPermissoes(usuario.idPerfil);

    return res.json({
      token,
      usuario: usuarioJson,
      permissoes,
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
      include: usuarioInclude,
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
    const usuario = await buscarUsuarioCompleto(req.params.id);

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
    const { nome, email, perfil, status, senha, idPerfil } = req.body;
    const erroValidacao = validarUsuario({ nome, email, status, senha });

    if (erroValidacao) {
      return res.status(400).json({
        message: erroValidacao,
      });
    }

    const { erro, idPerfil: idPerfilResolvido } = await resolverIdPerfil({ perfil, idPerfil });

    if (erro) {
      return res.status(400).json({
        message: erro,
      });
    }

    const usuario = await Usuario.create({
      nome,
      email,
      status,
      senhaHash: hashPassword(senha),
      idPerfil: idPerfilResolvido
    });

    const usuarioCompleto = await buscarUsuarioCompleto(usuario.id);

    return res.status(201).json(usuarioCompleto);
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

    const { nome, email, perfil, idPerfil, status, senha } = req.body;
    const erroValidacao = validarUsuario({ nome, email, status, senha }, false);

    if (erroValidacao) {
      return res.status(400).json({
        message: erroValidacao,
      });
    }

    const { erro, idPerfil: idPerfilResolvido } = await resolverIdPerfil({ perfil, idPerfil }, false);

    if (erro) {
      return res.status(400).json({
        message: erro,
      });
    }

    const usuarioAtualizado = await usuario.update({
      nome: nome ?? usuario.nome,
      email: email ?? usuario.email,
      idPerfil: idPerfilResolvido ?? usuario.idPerfil,
      status: status ?? usuario.status,
      senhaHash: senha !== undefined ? hashPassword(senha) : usuario.senhaHash,
    });

    const usuarioCompleto = await buscarUsuarioCompleto(usuarioAtualizado.id);

    return res.json(usuarioCompleto);
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
