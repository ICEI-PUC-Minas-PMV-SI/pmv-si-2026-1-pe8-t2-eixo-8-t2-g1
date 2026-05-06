function isIntegerGreaterThanZero(valor) {
  return Number.isInteger(valor) && valor > 0;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(String(email).trim());
}

function tratarErroSequelize(error, res, mensagemPadrao) {
  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: "Erro de validação",
      errors: error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      })),
    });
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      message: "Email já cadastrado",
      errors: error.errors.map((err) => ({
        field: err.path,
        message: err.message,
        value: err.value,
      })),
    });
  }

  return res.status(500).json({
    message: mensagemPadrao,
  });
}

module.exports = {
  isIntegerGreaterThanZero,
  isValidEmail,
  tratarErroSequelize
};
