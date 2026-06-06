import { useState, useEffect } from 'react';
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
import { empresaApi, smtpApi } from '@/api';
import type { EmpresaApi, SmtpApi } from '@/api/types';

export default function Configuracoes() {
  // State para SMTP
  const [smtp, setSmtp] = useState<SmtpApi | null>(null);
  const [loadingSmtp, setLoadingSmtp] = useState(false);

  // State para Empresa
  const [empresa, setEmpresa] = useState<EmpresaApi | null>(null);
  const [loadingEmpresa, setLoadingEmpresa] = useState(false);

  // State para edição
  const [smtpEditando, setSmtpEditando] = useState<SmtpApi | null>(null);
  const [empresaEditando, setEmpresaEditando] = useState<EmpresaApi | null>(null);

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoadingSmtp(true);
      setLoadingEmpresa(true);

      const [smtpResponse, empresaResponse] = await Promise.all([
        smtpApi.getAll().catch(() => null),
        empresaApi.getAll().catch(() => null),
      ]);

      if (smtpResponse && smtpResponse.length > 0) {
        setSmtp(smtpResponse[0]);
        setSmtpEditando({ ...smtpResponse[0] });
      }

      if (empresaResponse && empresaResponse.length > 0) {
        setEmpresa(empresaResponse[0]);
        setEmpresaEditando({ ...empresaResponse[0] });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao carregar configurações';
      toast.error(message);
    } finally {
      setLoadingSmtp(false);
      setLoadingEmpresa(false);
    }
  };

  // Handlers para SMTP
  const handleSaveSmtp = async () => {
    if (!smtpEditando) return;

    if (!smtpEditando.host || !smtpEditando.email || !smtpEditando.senha || !smtpEditando.porta || !smtpEditando.seguranca) {
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
      setSmtpEditando(smtpSalvo);
      toast.success('Configurações SMTP salvas com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar configurações SMTP';
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

  const handleSmtpChange = (field: keyof SmtpApi, value: any) => {
    if (smtpEditando) {
      setSmtpEditando((prev) => ({
        ...prev!,
        [field]: value,
      }));
    }
  };

  // Handlers para Empresa
  const handleSaveEmpresa = async () => {
    if (!empresaEditando) return;

    if (
      !empresaEditando.nome ||
      !empresaEditando.apelido ||
      !empresaEditando.cnpj ||
      !empresaEditando.email ||
      !empresaEditando.telefone ||
      !empresaEditando.logradouro ||
      !empresaEditando.numero ||
      !empresaEditando.bairro ||
      !empresaEditando.cidade ||
      !empresaEditando.uf ||
      !empresaEditando.cep ||
      !empresaEditando.pais
    ) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoadingEmpresa(true);

      let empresaSalva: EmpresaApi;

      if (empresa) {
        // Atualizar
        empresaSalva = await empresaApi.update(empresa.id, {
          nome: empresaEditando.nome,
          apelido: empresaEditando.apelido,
          cnpj: empresaEditando.cnpj,
          logotipo: empresaEditando.logotipo,
          email: empresaEditando.email,
          telefone: empresaEditando.telefone,
          logradouro: empresaEditando.logradouro,
          numero: empresaEditando.numero,
          complemente: empresaEditando.complemente,
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
          cnpj: empresaEditando.cnpj,
          logotipo: empresaEditando.logotipo,
          email: empresaEditando.email,
          telefone: empresaEditando.telefone,
          logradouro: empresaEditando.logradouro,
          numero: empresaEditando.numero,
          complemente: empresaEditando.complemente,
          bairro: empresaEditando.bairro,
          cidade: empresaEditando.cidade,
          uf: empresaEditando.uf,
          cep: empresaEditando.cep,
          pais: empresaEditando.pais,
        });
      }

      setEmpresa(empresaSalva);
      setEmpresaEditando(empresaSalva);
      toast.success('Dados da empresa salvos com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar dados da empresa';
      toast.error(message);
    } finally {
      setLoadingEmpresa(false);
    }
  };

  const handleCancelEmpresa = () => {
    if (empresa) {
      setEmpresaEditando({ ...empresa });
    } else {
      setEmpresaEditando(null);
    }
  };

  const handleEmpresaChange = (field: keyof EmpresaApi, value: any) => {
    if (empresaEditando) {
      setEmpresaEditando((prev) => ({
        ...prev!,
        [field]: value,
      }));
    }
  };

  const handleEnderecoChange = (field: string, value: string) => {
    if (empresaEditando) {
      setEmpresaEditando((prev) => ({
        ...prev!,
        [field]: value,
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'Configurações' }]} />

      {/* Header */}
      <div>
        <h1>Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerenciamento de configurações do sistema</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="smtp" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="smtp">SMTP</TabsTrigger>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
        </TabsList>

        {/* SMTP Tab */}
        <TabsContent value="smtp" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-6">Configuração de SMTP</h3>
            {loadingSmtp ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : smtpEditando ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="host">Host *</Label>
                  <Input
                    id="host"
                    value={smtpEditando.host}
                    onChange={(e) => handleSmtpChange('host', e.target.value)}
                    placeholder="smtp.gmail.com"
                    disabled={loadingSmtp}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={smtpEditando.email}
                    onChange={(e) => handleSmtpChange('email', e.target.value)}
                    disabled={loadingSmtp}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={smtpEditando.senha}
                    onChange={(e) => handleSmtpChange('senha', e.target.value)}
                    disabled={loadingSmtp}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="porta">Porta *</Label>
                    <Input
                      id="porta"
                      type="number"
                      value={smtpEditando.porta}
                      onChange={(e) => handleSmtpChange('porta', parseInt(e.target.value))}
                      disabled={loadingSmtp}
                    />
                  </div>
                  <div>
                    <Label htmlFor="seguranca">Segurança *</Label>
                    <Select
                      value={smtpEditando.seguranca}
                      onValueChange={(value) => handleSmtpChange('seguranca', value)}
                      disabled={loadingSmtp}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SSL">SSL</SelectItem>
                        <SelectItem value="TLS">TLS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-border">
                  <Button variant="outline" onClick={handleCancelSmtp} disabled={loadingSmtp}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveSmtp} disabled={loadingSmtp}>
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Nenhuma configuração SMTP encontrada</div>
            )}
          </Card>
        </TabsContent>

        {/* Empresa Tab */}
        <TabsContent value="empresa" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-6">Dados da Empresa</h3>
            {loadingEmpresa ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : empresaEditando ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nomeEmpresa">Nome da Empresa *</Label>
                  <Input
                    id="nomeEmpresa"
                    value={empresaEditando.nome}
                    onChange={(e) => handleEmpresaChange('nome', e.target.value)}
                    disabled={loadingEmpresa}
                  />
                </div>
                <div>
                  <Label htmlFor="apelidoEmpresa">Apelido *</Label>
                  <Input
                    id="apelidoEmpresa"
                    value={empresaEditando.apelido}
                    onChange={(e) => handleEmpresaChange('apelido', e.target.value)}
                    disabled={loadingEmpresa}
                  />
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={empresaEditando.cnpj}
                    onChange={(e) => handleEmpresaChange('cnpj', e.target.value)}
                    placeholder="12.345.678/0001-90"
                    disabled={loadingEmpresa}
                  />
                </div>
                <div>
                  <Label htmlFor="logotipo">Logotipo</Label>
                  <Input
                    id="logotipo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleEmpresaChange('logotipo', e.target.value)}
                    disabled={loadingEmpresa}
                  />
                </div>
                <div>
                  <Label htmlFor="emailEmpresa">E-mail *</Label>
                  <Input
                    id="emailEmpresa"
                    type="email"
                    value={empresaEditando.email}
                    onChange={(e) => handleEmpresaChange('email', e.target.value)}
                    disabled={loadingEmpresa}
                  />
                </div>
                <div>
                  <Label htmlFor="telefoneEmpresa">Telefone *</Label>
                  <Input
                    id="telefoneEmpresa"
                    value={empresaEditando.telefone}
                    onChange={(e) => handleEmpresaChange('telefone', e.target.value)}
                    placeholder="(11) 3000-0000"
                    disabled={loadingEmpresa}
                  />
                </div>

                {/* Endereço */}
                <div className="pt-4 border-t border-border">
                  <h4 className="font-semibold mb-4">Endereço</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="logradouro">Logradouro *</Label>
                      <Input
                        id="logradouro"
                        value={empresaEditando.logradouro}
                        onChange={(e) => handleEnderecoChange('logradouro', e.target.value)}
                        disabled={loadingEmpresa}
                      />
                    </div>
                    <div>
                      <Label htmlFor="numero">Número *</Label>
                      <Input
                        id="numero"
                        value={empresaEditando.numero}
                        onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                        disabled={loadingEmpresa}
                      />
                    </div>
                    <div>
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        value={empresaEditando.complemente}
                        onChange={(e) => handleEnderecoChange('complemente', e.target.value)}
                        disabled={loadingEmpresa}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bairro">Bairro *</Label>
                      <Input
                        id="bairro"
                        value={empresaEditando.bairro}
                        onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                        disabled={loadingEmpresa}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cidade">Cidade *</Label>
                      <Input
                        id="cidade"
                        value={empresaEditando.cidade}
                        onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                        disabled={loadingEmpresa}
                      />
                    </div>
                    <div>
                      <Label htmlFor="uf">UF *</Label>
                      <Input
                        id="uf"
                        maxLength={2}
                        value={empresaEditando.uf}
                        onChange={(e) => handleEnderecoChange('uf', e.target.value.toUpperCase())}
                        disabled={loadingEmpresa}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cep">CEP *</Label>
                      <Input
                        id="cep"
                        value={empresaEditando.cep}
                        onChange={(e) => handleEnderecoChange('cep', e.target.value)}
                        placeholder="01310-100"
                        disabled={loadingEmpresa}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pais">País *</Label>
                      <Input
                        id="pais"
                        value={empresaEditando.pais}
                        onChange={(e) => handleEnderecoChange('pais', e.target.value)}
                        disabled={loadingEmpresa}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border">
                  <Button variant="outline" onClick={handleCancelEmpresa} disabled={loadingEmpresa}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveEmpresa} disabled={loadingEmpresa}>
                    Salvar Dados
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Nenhuma configuração de empresa encontrada</div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
