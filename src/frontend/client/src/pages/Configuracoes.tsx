'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Breadcrumbs from '@/components/Breadcrumbs';
import { toast } from 'sonner';
import { empresaApi, uploadLogotipo, getLogotipo, smtpApi } from '@/api';
import type { EmpresaApi, SmtpApi } from '@/api/types';
import { PERMISSIONS } from '@/constants/permissions';
import { useAuth } from '@/contexts/AuthContext';

// Função para formatar CNPJ com máscara: XX.XXX.XXX/XXXX-XX
const formatCNPJ = (value: string): string => {
  // Remove tudo que não é número
  const cleaned = value.replace(/\D/g, '');
  
  // Aplica a máscara
  if (cleaned.length <= 2) {
    return cleaned;
  } else if (cleaned.length <= 5) {
    return cleaned.replace(/(\d{2})(\d+)/, '$1.$2');
  } else if (cleaned.length <= 8) {
    return cleaned.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
  } else if (cleaned.length <= 12) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
  } else {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
  }
};

// Função para remover máscara do CNPJ (apenas números)
const unformatCNPJ = (value: string): string => {
  return value.replace(/\D/g, '');
};

export default function Configuracoes() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission(PERMISSIONS.CONFIG.EDIT);

  // State para SMTP
  const [smtp, setSmtp] = useState<SmtpApi | null>(null);
  const [loadingSmtp, setLoadingSmtp] = useState(false);

  // State para Empresa
  const [empresa, setEmpresa] = useState<EmpresaApi | null>(null);
  const [loadingEmpresa, setLoadingEmpresa] = useState(false);

  // State para edição
  const [smtpEditando, setSmtpEditando] = useState<SmtpApi | null>(null);
  const [empresaEditando, setEmpresaEditando] = useState<EmpresaApi | null>(null);

  // State para upload de logotipo
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoArquivo, setLogoArquivo] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoadingSmtp(true);
      setLoadingEmpresa(true);

      // Carregar SMTP
      try {
        const smtpResponse = await smtpApi.getAll();
        const smtpData = Array.isArray(smtpResponse) ? smtpResponse[0] : smtpResponse;
        if (smtpData) {
          setSmtp(smtpData);
          setSmtpEditando({ ...smtpData });
        }
      } catch (error) {
        console.log('SMTP não configurado ainda');
      }

      // Carregar Empresa
      try {
        const empresaResponse = await empresaApi.getAll();
        const empresaData = Array.isArray(empresaResponse) ? empresaResponse[0] : empresaResponse;
        if (empresaData) {
          // Formatar CNPJ ao carregar
          const empresaFormatada = {
            ...empresaData,
            cnpj: formatCNPJ(empresaData.cnpj || ''),
          };
          setEmpresa(empresaData);
          setEmpresaEditando(empresaFormatada);
          // Carregar preview do logotipo se existir
          if (empresaData.logotipo) {
            try {
              const logoBlob = await getLogotipo();
              const logoUrl = URL.createObjectURL(logoBlob);
              setLogoPreview(logoUrl);
            } catch (error) {
              console.log('Erro ao carregar logotipo');
            }
          }
        }
      } catch (error) {
        console.log('Empresa não configurada ainda');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao carregar configurações';
      toast.error(message);
    } finally {
      setLoadingSmtp(false);
      setLoadingEmpresa(false);
    }
  };

  // Handler para seleção de arquivo de logotipo
  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;

    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem não pode ser maior que 5MB');
      return;
    }

    // Armazenar arquivo e mostrar preview
    setLogoArquivo(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload do logotipo (chamado antes de salvar empresa)
  const handleUploadLogotipo = async (): Promise<string | null> => {
    if (!canEdit) return null;

    if (!logoArquivo) {
      // Se não há arquivo novo, retorna o logotipo atual
      return empresaEditando?.logotipo || null;
    }

    try {
      setUploadingLogo(true);
      const logoPath = await uploadLogotipo(logoArquivo);
      toast.success('Logotipo enviado com sucesso!');
      return logoPath;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer upload do logotipo';
      toast.error(message);
      return null;
    } finally {
      setUploadingLogo(false);
    }
  };

  // Remover logotipo
  const handleRemoveLogo = () => {
    if (!canEdit) return;

    setLogoPreview(null);
    setLogoArquivo(null);
    if (empresaEditando) {
      setEmpresaEditando({
        ...empresaEditando,
        logotipo: '',
      });
    }
  };

  // Handlers para SMTP
  const handleSaveSmtp = async () => {
    if (!canEdit) return;

    if (!smtpEditando) return;

    if (!smtpEditando.host || !smtpEditando.email || !smtpEditando.porta || !smtpEditando.seguranca) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoadingSmtp(true);

      let smtpSalvo: SmtpApi;

      if (smtp) {
        // Atualizar
        smtpSalvo = await smtpApi.update(smtp.id, {
          host: smtpEditando.host,
          email: smtpEditando.email,
          senha: smtpEditando.senha,
          porta: smtpEditando.porta,
          seguranca: smtpEditando.seguranca,
        });
      } else {
        // Criar
        smtpSalvo = await smtpApi.create({
          host: smtpEditando.host,
          email: smtpEditando.email,
          senha: smtpEditando.senha,
          porta: smtpEditando.porta,
          seguranca: smtpEditando.seguranca,
        });
      }

      setSmtp(smtpSalvo);
      setSmtpEditando({ ...smtpSalvo });
      toast.success('Configurações SMTP salvas com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar SMTP';
      toast.error(message);
    } finally {
      setLoadingSmtp(false);
    }
  };

  const handleCancelSmtp = () => {
    if (smtp) {
      setSmtpEditando({ ...smtp });
    } else {
      setSmtpEditando(null);
    }
  };

  // Handlers para Empresa
  const handleSaveEmpresa = async () => {
    if (!canEdit) return;

    if (!empresaEditando) return;

    if (!empresaEditando.nome || !empresaEditando.apelido || !empresaEditando.cnpj || 
        !empresaEditando.email || !empresaEditando.telefone || !empresaEditando.logradouro || 
        !empresaEditando.numero || !empresaEditando.bairro || !empresaEditando.cidade || 
        !empresaEditando.uf || !empresaEditando.cep || !empresaEditando.pais) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoadingEmpresa(true);

      // 1. Fazer upload do logotipo se houver arquivo novo
      let logoPath = empresaEditando.logotipo || '';
      if (logoArquivo) {
        const uploadedPath = await handleUploadLogotipo();
        if (uploadedPath) {
          logoPath = uploadedPath;
        } else {
          // Se falhar no upload, não continua
          return;
        }
      }

      // 2. Salvar empresa com o caminho do logotipo
      // IMPORTANTE: Remover máscara do CNPJ antes de enviar para o backend
      let empresaSalva: EmpresaApi;

      if (empresa) {
        // Atualizar
        empresaSalva = await empresaApi.update(empresa.id, {
          nome: empresaEditando.nome,
          apelido: empresaEditando.apelido,
          cnpj: unformatCNPJ(empresaEditando.cnpj), // Remove máscara, envia apenas números
          logotipo: logoPath,
          email: empresaEditando.email,
          telefone: empresaEditando.telefone,
          logradouro: empresaEditando.logradouro,
          numero: empresaEditando.numero,
          complemente: empresaEditando.complemente || '',
          bairro: empresaEditando.bairro,
          cidade: empresaEditando.cidade,
          uf: empresaEditando.uf,
          cep: empresaEditando.cep,
          pais: empresaEditando.pais,
        });
      } else {
        // Criar
        empresaSalva = await empresaApi.create({
          nome: empresaEditando.nome,
          apelido: empresaEditando.apelido,
          cnpj: unformatCNPJ(empresaEditando.cnpj), // Remove máscara, envia apenas números
          logotipo: logoPath,
          email: empresaEditando.email,
          telefone: empresaEditando.telefone,
          logradouro: empresaEditando.logradouro,
          numero: empresaEditando.numero,
          complemente: empresaEditando.complemente || '',
          bairro: empresaEditando.bairro,
          cidade: empresaEditando.cidade,
          uf: empresaEditando.uf,
          cep: empresaEditando.cep,
          pais: empresaEditando.pais,
        });
      }

      // Formatar CNPJ na resposta para exibição
      const empresaSalvaFormatada = {
        ...empresaSalva,
        cnpj: formatCNPJ(empresaSalva.cnpj || ''),
      };

      setEmpresa(empresaSalva);
      setEmpresaEditando(empresaSalvaFormatada);
      setLogoArquivo(null); // Limpar arquivo após salvar
      // Atualizar preview para usar a função getLogotipo
      if (empresaSalva.logotipo) {
        try {
          const logoBlob = await getLogotipo();
          const logoUrl = URL.createObjectURL(logoBlob);
          setLogoPreview(logoUrl);
        } catch (error) {
          console.log('Erro ao carregar logotipo atualizado');
        }
      }
      toast.success('Dados da empresa salvos com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar empresa';
      toast.error(message);
    } finally {
      setLoadingEmpresa(false);
    }
  };

  const handleCancelEmpresa = () => {
    if (empresa) {
      // Formatar CNPJ ao cancelar
      const empresaFormatada = {
        ...empresa,
        cnpj: formatCNPJ(empresa.cnpj || ''),
      };
      setEmpresaEditando(empresaFormatada);
      if (empresa.logotipo) {
        try {
          getLogotipo().then((logoBlob) => {
            const logoUrl = URL.createObjectURL(logoBlob);
            setLogoPreview(logoUrl);
          });
        } catch (error) {
          console.log('Erro ao carregar logotipo');
        }
      }
    } else {
      setEmpresaEditando(null);
      setLogoPreview(null);
    }
    setLogoArquivo(null);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Configurações' }]} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      <Tabs defaultValue="empresa" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
          <TabsTrigger value="smtp">Configurações SMTP</TabsTrigger>
        </TabsList>

        {/* Aba: Dados da Empresa */}
        <TabsContent value="empresa" className="space-y-6">
          {empresaEditando ? (
            <fieldset disabled={!canEdit}>
              <Card className="p-6 space-y-6">
              {/* Upload de Logotipo */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-2 block">Logotipo da Empresa</Label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoSelect}
                        disabled={loadingEmpresa || uploadingLogo}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        {uploadingLogo ? 'Enviando...' : 'Formatos aceitos: JPG, PNG, GIF, WebP (máximo 5MB)'}
                      </p>
                    </div>
                    {logoPreview && (
                      <div className="flex flex-col items-center gap-2">
                        <img 
                          src={logoPreview} 
                          alt="Preview do logotipo" 
                          className="w-24 h-24 object-contain border rounded"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveLogo}
                          disabled={loadingEmpresa || uploadingLogo}
                        >
                          Remover
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dados Básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-semibold mb-2 block">Nome da Empresa *</Label>
                  <Input
                    value={empresaEditando.nome || ''}
                    onChange={(e) =>
                      setEmpresaEditando({
                        ...empresaEditando,
                        nome: e.target.value,
                      })
                    }
                    disabled={loadingEmpresa}
                    placeholder="Nome completo da empresa"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2 block">Apelido *</Label>
                  <Input
                    value={empresaEditando.apelido || ''}
                    onChange={(e) =>
                      setEmpresaEditando({
                        ...empresaEditando,
                        apelido: e.target.value,
                      })
                    }
                    disabled={loadingEmpresa}
                    placeholder="Apelido da empresa"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2 block">CNPJ *</Label>
                  <Input
                    value={empresaEditando.cnpj || ''}
                    onChange={(e) =>
                      setEmpresaEditando({
                        ...empresaEditando,
                        cnpj: formatCNPJ(e.target.value), // Aplica máscara em tempo real
                      })
                    }
                    disabled={loadingEmpresa}
                    placeholder="00.000.000/0000-00"
                    maxLength={18} // Máximo de caracteres com máscara
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2 block">Email *</Label>
                  <Input
                    type="email"
                    value={empresaEditando.email || ''}
                    onChange={(e) =>
                      setEmpresaEditando({
                        ...empresaEditando,
                        email: e.target.value,
                      })
                    }
                    disabled={loadingEmpresa}
                    placeholder="contato@empresa.com"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2 block">Telefone *</Label>
                  <Input
                    value={empresaEditando.telefone || ''}
                    onChange={(e) =>
                      setEmpresaEditando({
                        ...empresaEditando,
                        telefone: e.target.value,
                      })
                    }
                    disabled={loadingEmpresa}
                    placeholder="(11) 98765-4321"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2 block">CEP *</Label>
                  <Input
                    value={empresaEditando.cep || ''}
                    onChange={(e) =>
                      setEmpresaEditando({
                        ...empresaEditando,
                        cep: e.target.value,
                      })
                    }
                    disabled={loadingEmpresa}
                    placeholder="00000-000"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-semibold mb-2 block">Logradouro *</Label>
                    <Input
                      value={empresaEditando.logradouro || ''}
                      onChange={(e) =>
                        setEmpresaEditando({
                          ...empresaEditando,
                          logradouro: e.target.value,
                        })
                      }
                      disabled={loadingEmpresa}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-2 block">Número *</Label>
                    <Input
                      value={empresaEditando.numero || ''}
                      onChange={(e) =>
                        setEmpresaEditando({
                          ...empresaEditando,
                          numero: Number(e.target.value),
                        })
                      }
                      disabled={loadingEmpresa}
                      placeholder="123"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-2 block">Complemento</Label>
                    <Input
                      value={empresaEditando.complemente || ''}
                      onChange={(e) =>
                        setEmpresaEditando({
                          ...empresaEditando,
                          complemente: e.target.value,
                        })
                      }
                      disabled={loadingEmpresa}
                      placeholder="Apto, Sala, etc."
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-2 block">Bairro *</Label>
                    <Input
                      value={empresaEditando.bairro || ''}
                      onChange={(e) =>
                        setEmpresaEditando({
                          ...empresaEditando,
                          bairro: e.target.value,
                        })
                      }
                      disabled={loadingEmpresa}
                      placeholder="Nome do bairro"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-2 block">Cidade *</Label>
                    <Input
                      value={empresaEditando.cidade || ''}
                      onChange={(e) =>
                        setEmpresaEditando({
                          ...empresaEditando,
                          cidade: e.target.value,
                        })
                      }
                      disabled={loadingEmpresa}
                      placeholder="Nome da cidade"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-2 block">UF *</Label>
                    <Input
                      value={empresaEditando.uf || ''}
                      onChange={(e) =>
                        setEmpresaEditando({
                          ...empresaEditando,
                          uf: e.target.value.toUpperCase(),
                        })
                      }
                      disabled={loadingEmpresa}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-2 block">País *</Label>
                    <Input
                      value={empresaEditando.pais || ''}
                      onChange={(e) =>
                        setEmpresaEditando({
                          ...empresaEditando,
                          pais: e.target.value,
                        })
                      }
                      disabled={loadingEmpresa}
                      placeholder="Brasil"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4 pt-6">
                <Button
                  onClick={handleSaveEmpresa}
                  disabled={loadingEmpresa || uploadingLogo}
                  className="flex-1"
                >
                  {loadingEmpresa ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEmpresa}
                  disabled={loadingEmpresa || uploadingLogo}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
              </Card>
            </fieldset>
          ) : (
            <Card className="p-6">
              <p className="text-gray-500">Nenhuma empresa configurada. Crie uma nova empresa para começar.</p>
              {canEdit && (
                <Button
                  onClick={() =>
                    setEmpresaEditando({
                      id: 0,
                      nome: '',
                      apelido: '',
                      cnpj: '',
                      logotipo: '',
                      email: '',
                      telefone: '',
                      logradouro: '',
                      numero: 0,
                      complemente: '',
                      bairro: '',
                      cidade: '',
                      uf: '',
                      cep: '',
                      pais: '',
                    })
                  }
                  className="mt-4"
                >
                  Criar Empresa
                </Button>
              )}
            </Card>
          )}
        </TabsContent>

        {/* Aba: Configurações SMTP */}
        <TabsContent value="smtp" className="space-y-6">
          {smtpEditando ? (
            <fieldset disabled={!canEdit}>
              <Card className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-semibold mb-2 block">Host SMTP *</Label>
                  <Input
                    value={smtpEditando.host || ''}
                    onChange={(e) =>
                      setSmtpEditando({
                        ...smtpEditando,
                        host: e.target.value,
                      })
                    }
                    disabled={loadingSmtp}
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2 block">Porta *</Label>
                  <Input
                    type="number"
                    value={smtpEditando.porta || ''}
                    onChange={(e) =>
                      setSmtpEditando({
                        ...smtpEditando,
                        porta: parseInt(e.target.value),
                      })
                    }
                    disabled={loadingSmtp}
                    placeholder="587"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2 block">Email *</Label>
                  <Input
                    type="email"
                    value={smtpEditando.email || ''}
                    onChange={(e) =>
                      setSmtpEditando({
                        ...smtpEditando,
                        email: e.target.value,
                      })
                    }
                    disabled={loadingSmtp}
                    placeholder="seu-email@gmail.com"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2 block">Senha</Label>
                  <Input
                    type="password"
                    value={smtpEditando.senha || ''}
                    onChange={(e) =>
                      setSmtpEditando({
                        ...smtpEditando,
                        senha: e.target.value,
                      })
                    }
                    disabled={loadingSmtp}
                    placeholder=""
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2 block">Segurança *</Label>
                  <Select
                    value={smtpEditando.seguranca || ''}
                    onValueChange={(value) =>
                      setSmtpEditando({
                        ...smtpEditando,
                        seguranca: value,
                      })
                    }
                  >
                    <SelectTrigger disabled={loadingSmtp}>
                      <SelectValue placeholder="Selecione o tipo de segurança" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TLS">TLS</SelectItem>
                      <SelectItem value="SSL">SSL</SelectItem>
                      <SelectItem value="Nenhuma">Nenhuma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4 pt-6">
                <Button
                  onClick={handleSaveSmtp}
                  disabled={loadingSmtp}
                  className="flex-1"
                >
                  {loadingSmtp ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelSmtp}
                  disabled={loadingSmtp}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
              </Card>
            </fieldset>
          ) : (
            <Card className="p-6">
              <p className="text-gray-500">Nenhuma configuração SMTP. Crie uma nova para começar.</p>
              {canEdit && (
                <Button
                  onClick={() =>
                    setSmtpEditando({
                      id: 0,
                      host: '',
                      email: '',
                      senha: '',
                      porta: 587,
                      seguranca: 'TLS',
                    })
                  }
                  className="mt-4"
                >
                  Criar Configuração SMTP
                </Button>
              )}
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
