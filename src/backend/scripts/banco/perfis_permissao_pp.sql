BEGIN;

INSERT INTO perfis (id, nome)
VALUES
  (1, 'Administrador'),
  (3, 'Padrão'),
  (2, 'Supervisor')
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome;

INSERT INTO permissoes (id, chave, descricao)
VALUES
  (1, 'CLIENTES_VISUALIZAR', 'Visualizar clientes'),
  (2, 'CLIENTES_CRIAR', 'Criar clientes'),
  (3, 'CLIENTES_EDITAR', 'Editar clientes'),
  (4, 'CLIENTES_EXCLUIR', 'Excluir clientes'),
  (5, 'VEICULOS_VISUALIZAR', 'Visualizar veículos'),
  (6, 'VEICULOS_CRIAR', 'Criar veículos'),
  (7, 'VEICULOS_EDITAR', 'Editar veículos'),
  (8, 'VEICULOS_EXCLUIR', 'Excluir veículos'),
  (9, 'OS_VISUALIZAR', 'Visualizar ordens de serviço'),
  (10, 'OS_CRIAR', 'Criar ordens de serviço'),
  (11, 'OS_EDITAR', 'Editar ordens de serviço'),
  (12, 'OS_EXCLUIR', 'Excluir ordens de serviço'),
  (13, 'PRODUTOS_VISUALIZAR', 'Visualizar produtos'),
  (14, 'PRODUTOS_CRIAR', 'Criar produtos'),
  (15, 'PRODUTOS_EDITAR', 'Editar produtos'),
  (16, 'PRODUTOS_EXCLUIR', 'Excluir produtos'),
  (17, 'USUARIOS_VISUALIZAR', 'Visualizar usuários'),
  (18, 'USUARIOS_CRIAR', 'Criar usuários'),
  (19, 'USUARIOS_EDITAR', 'Editar usuários'),
  (20, 'USUARIOS_EXCLUIR', 'Excluir usuários'),
  (21, 'RELATORIOS_VISUALIZAR', 'Visualizar relatórios')
ON CONFLICT (id) DO UPDATE SET
  chave = EXCLUDED.chave,
  descricao = EXCLUDED.descricao;

INSERT INTO perfil_permissao (id_perfil, id_permissao)
VALUES
  (1, 1),
  (1, 2),
  (1, 3),
  (1, 4),
  (1, 5),
  (1, 6),
  (1, 7),
  (1, 8),
  (1, 9),
  (1, 10),
  (1, 11),
  (1, 12),
  (1, 13),
  (1, 14),
  (1, 15),
  (1, 16),
  (1, 17),
  (1, 18),
  (1, 19),
  (1, 20),
  (1, 21),

  (3, 1),
  (3, 5),
  (3, 9),
  (3, 13),
  (3, 17),
  (3, 21),
  (3, 2),
  (3, 3),
  (3, 6),
  (3, 7),
  (3, 10),
  (3, 11),

  (2, 11),
  (2, 12),
  (2, 10),
  (2, 2),
  (2, 15),
  (2, 13),
  (2, 21),
  (2, 5),
  (2, 8),
  (2, 6),
  (2, 16),
  (2, 4),
  (2, 1),
  (2, 3),
  (2, 14),
  (2, 9),
  (2, 7)
ON CONFLICT DO NOTHING;

COMMIT;