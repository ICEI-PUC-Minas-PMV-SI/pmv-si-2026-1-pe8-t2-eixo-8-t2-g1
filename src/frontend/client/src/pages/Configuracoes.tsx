import { useState } from 'react';
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
import type { ConfigSMTP, ConfigEmpresa, Endereco } from '@/types';

export default function Configuracoes() {
  const [smtp, setSMTP] = useState<ConfigSMTP>({
    host: 'smtp.gmail.com',
    email: 'noreply@empresa.com',
    password: '••••••••••',
    porta: 587,
    seguranca: 'TLS',
  });

  const [empresa, setEmpresa] = useState<ConfigEmpresa>({
    nome: 'Minha Empresa',
    cnpj: '12.345.678/0001-90',
    logotipo: '',
    endereco: {
      logradouro: 'Rua Principal',
      numero: '100',
      complemento: '',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      pais: 'Brasil',
      cep: '01310-100',
    },
    email: 'contato@empresa.com',
    telefone: '(11) 3000-0000',
  });

  const handleSaveSMTP = () => {
    toast.success('Configurações SMTP salvas com sucesso!');
  };

  const handleSaveEmpresa = () => {
    toast.success('Dados da empresa salvos com sucesso!');
  };

  const handleSMTPChange = (field: keyof ConfigSMTP, value: any) => {
    setSMTP((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmpresaChange = (field: keyof ConfigEmpresa, value: any) => {
    setEmpresa((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEnderecoChange = (field: string, value: string) => {
    setEmpresa((prev) => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        [field]: value,
      },
    }));
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="host">Host *</Label>
                <Input
                  id="host"
                  value={smtp.host}
                  onChange={(e) => handleSMTPChange('host', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={smtp.email}
                  onChange={(e) => handleSMTPChange('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={smtp.password}
                  onChange={(e) => handleSMTPChange('password', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="porta">Porta *</Label>
                  <Input
                    id="porta"
                    type="number"
                    value={smtp.porta}
                    onChange={(e) => handleSMTPChange('porta', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="seguranca">Segurança *</Label>
                  <Select
                    value={smtp.seguranca}
                    onValueChange={(value) => handleSMTPChange('seguranca', value)}
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
                <Button variant="outline">Cancelar</Button>
                <Button onClick={handleSaveSMTP}>Salvar Configurações</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Empresa Tab */}
        <TabsContent value="empresa" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-6">Dados da Empresa</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nomeEmpresa">Nome da Empresa *</Label>
                <Input
                  id="nomeEmpresa"
                  value={empresa.nome}
                  onChange={(e) => handleEmpresaChange('nome', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={empresa.cnpj}
                  onChange={(e) => handleEmpresaChange('cnpj', e.target.value)}
                  placeholder="12.345.678/0001-90"
                />
              </div>
              <div>
                <Label htmlFor="logotipo">Logotipo</Label>
                <Input
                  id="logotipo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleEmpresaChange('logotipo', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="emailEmpresa">E-mail *</Label>
                <Input
                  id="emailEmpresa"
                  type="email"
                  value={empresa.email}
                  onChange={(e) => handleEmpresaChange('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="telefoneEmpresa">Telefone *</Label>
                <Input
                  id="telefoneEmpresa"
                  value={empresa.telefone}
                  onChange={(e) => handleEmpresaChange('telefone', e.target.value)}
                  placeholder="(11) 3000-0000"
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
                      value={empresa.endereco.logradouro}
                      onChange={(e) => handleEnderecoChange('logradouro', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="numero">Número *</Label>
                    <Input
                      id="numero"
                      value={empresa.endereco.numero}
                      onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={empresa.endereco.complemento}
                      onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input
                      id="bairro"
                      value={empresa.endereco.bairro}
                      onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      value={empresa.endereco.cidade}
                      onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="uf">UF *</Label>
                    <Input
                      id="uf"
                      maxLength={2}
                      value={empresa.endereco.uf}
                      onChange={(e) => handleEnderecoChange('uf', e.target.value.toUpperCase())}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      value={empresa.endereco.cep}
                      onChange={(e) => handleEnderecoChange('cep', e.target.value)}
                      placeholder="01310-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pais">País *</Label>
                    <Input
                      id="pais"
                      value={empresa.endereco.pais}
                      onChange={(e) => handleEnderecoChange('pais', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-border">
                <Button variant="outline">Cancelar</Button>
                <Button onClick={handleSaveEmpresa}>Salvar Dados</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
