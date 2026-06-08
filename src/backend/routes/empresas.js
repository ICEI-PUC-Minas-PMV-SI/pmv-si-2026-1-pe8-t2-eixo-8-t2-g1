const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Empresa } = require("../models");
const { isIntegerGreaterThanZero } = require("../utils/utils");
const autenticarCookie = require("../middlewares/auth");
const {
    AUTH_COOKIE_NAME,
    getAuthCookieOptions,
    getClearAuthCookieOptions,
    hashPassword,
    signJwt,
    verifyJwt,
    verifyPassword,
} = require("../utils/auth");

const router = express.Router();

// Configurar multer para upload de arquivos
const uploadsDir = path.join(__dirname, "../uploads");

// Criar diretório se não existir
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Gerar nome único para o arquivo
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `logo-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Aceitar apenas imagens
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Apenas arquivos de imagem são permitidos (JPEG, PNG, GIF, WebP)"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// GET - Obter dados da empresa (sempre retorna o primeiro registro)
router.get("/", async (req, res) => {
    try {
        const empresa = await Empresa.findByPk(1);

        if (!empresa) {
            return res.status(404).json({
                message: "Dados da empresa não configurados"
            });
        }

        return res.json(empresa);
    } catch (error) {
        return res.status(500).json({
            message: "Erro interno ao buscar dados da empresa"
        });
    }
});

// POST - Upload de logotipo
router.post("/upload-logo", upload.single("logo"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Nenhum arquivo foi enviado"
            });
        }

        // Retornar caminho relativo do arquivo
        const logoPath = `/uploads/${req.file.filename}`;

        return res.json({
            message: "Logotipo enviado com sucesso",
            logoPath,
            filename: req.file.filename
        });
    } catch (error) {
        if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    message: "Arquivo muito grande. Máximo 5MB"
                });
            }
        }

        return res.status(500).json({
            message: "Erro ao fazer upload do logotipo"
        });
    }
});

router.get("/logotipo", async (req, res) => {
    try {
        const empresa = await Empresa.findByPk(1);

        if (!empresa || !empresa.logotipo) {
            return res.status(404).json({
                message: "Logotipo não encontrado"
            });
        }

        // Construir caminho absoluto
        const filePath = path.join(__dirname, '..', empresa.logotipo);

        // Enviar arquivo
        return res.sendFile(filePath);
    } catch (error) {
        return res.status(500).json({
            message: "Erro interno ao buscar logotipo"
        });
    }
});


// POST - Criar dados da empresa (se não existir)
router.post("/", async (req, res) => {
    try {
        const {
            nome,
            apelido,
            cnpj,
            logotipo,
            email,
            telefone,
            logradouro,
            numero,
            complemente,
            bairro,
            cidade,
            uf,
            cep,
            pais
        } = req.body;

        // Validar campos obrigatórios (logotipo agora é opcional)
        if (!nome || !apelido || !cnpj || !email || !telefone ||
            !logradouro || !numero || !bairro || !cidade || !uf || !cep || !pais) {
            return res.status(400).json({
                message: "Todos os campos obrigatórios devem ser preenchidos"
            });
        }

        // Verificar se já existe registro
        const empresaExistente = await Empresa.findByPk(1);

        if (empresaExistente) {
            return res.status(409).json({
                message: "Dados da empresa já foram configurados. Use PUT para atualizar."
            });
        }

        const empresa = await Empresa.create({
            id: 1,
            nome,
            apelido,
            cnpj,
            logotipo: logotipo || "",
            email,
            telefone,
            logradouro,
            numero,
            complemente: complemente || "",
            bairro,
            cidade,
            uf,
            cep,
            pais
        });

        return res.status(201).json(empresa);
    } catch (error) {
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Erro de validação",
                errors: error.errors.map((err) => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        return res.status(500).json({
            message: "Erro interno ao criar dados da empresa"
        });
    }
});

// PUT - Atualizar dados da empresa (upsert)
router.put("/:id", async (req, res) => {
    try {
        const {
            nome,
            apelido,
            cnpj,
            logotipo,
            email,
            telefone,
            logradouro,
            numero,
            complemente,
            bairro,
            cidade,
            uf,
            cep,
            pais
        } = req.body;

        let empresa = await Empresa.findByPk(1);

        if (!empresa) {
            // Se não existir, criar novo registro
            empresa = await Empresa.create({
                id: 1,
                nome: nome || "",
                apelido: apelido || "",
                cnpj: cnpj || "",
                logotipo: logotipo || "",
                email: email || "",
                telefone: telefone || "",
                logradouro: logradouro || "",
                numero: numero || 0,
                complemente: complemente || "",
                bairro: bairro || "",
                cidade: cidade || "",
                uf: uf || "",
                cep: cep || "",
                pais: pais || ""
            });

            return res.status(201).json(empresa);
        }

        // Se existir, atualizar
        const empresaAtualizada = await empresa.update({
            nome: nome ?? empresa.nome,
            apelido: apelido ?? empresa.apelido,
            cnpj: cnpj ?? empresa.cnpj,
            logotipo: logotipo ?? empresa.logotipo,
            email: email ?? empresa.email,
            telefone: telefone ?? empresa.telefone,
            logradouro: logradouro ?? empresa.logradouro,
            numero: numero ?? empresa.numero,
            complemente: complemente ?? empresa.complemente,
            bairro: bairro ?? empresa.bairro,
            cidade: cidade ?? empresa.cidade,
            uf: uf ?? empresa.uf,
            cep: cep ?? empresa.cep,
            pais: pais ?? empresa.pais
        });

        return res.json(empresaAtualizada);
    } catch (error) {
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Erro de validação",
                errors: error.errors.map((err) => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        return res.status(500).json({
            message: "Erro interno ao atualizar dados da empresa"
        });
    }
});

module.exports = router;
