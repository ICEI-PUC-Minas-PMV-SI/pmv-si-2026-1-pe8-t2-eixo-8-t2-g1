const express = require("express");
const { Cliente } = require("../models");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const fornecedores = await Cliente.findAll({
      where: {
        isFornecedor: true,
      },
    });

    return res.json(fornecedores);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar fornecedores",
    });
  }
});

module.exports = router;