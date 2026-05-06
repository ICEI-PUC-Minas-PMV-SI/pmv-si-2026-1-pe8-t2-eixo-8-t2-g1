import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UsuarioApi, UsuarioPayload } from '@/api';

interface UsuarioFormProps {
  onSubmit: (usuario: UsuarioPayload) => void;
  onCancel: () => void;
  initialData?: UsuarioApi;
}

interface FormDataState {
  nome: string;
  email: string;
  senha: string;
  perfil: 'Administrador' | 'Supervisor' | 'Padrão';
  status: 'Ativo' | 'Inativo';
}

export default function UsuarioForm({
  onSubmit,
  onCancel,
  initialData,
}: UsuarioFormProps) {
  const [formData, setFormData] = useState<FormDataState>(() => ({
    nome: initialData?.nome || '',
    email: initialData?.email || '',
    senha: '',
    perfil: initialData?.perfil || 'Padrão',
    status: initialData?.status || 'Ativo',
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nome: formData.nome,
      email: formData.email,
      perfil: formData.perfil,
      status: formData.status,
      senha: formData.senha || undefined,
    });
  };

  const handleInputChange = (field: keyof FormDataState, value: FormDataState[keyof FormDataState]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Informações do Usuário</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-1">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Nome completo"
              required
            />
          </div>
          <div className="md:col-span-1">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="usuario@example.com"
              required
            />
          </div>
          <div className="md:col-span-1">
            <Label htmlFor="senha">Senha *</Label>
            <Input
              id="senha"
              type="password"
              value={formData.senha}
              onChange={(e) => handleInputChange('senha', e.target.value)}
              placeholder="Senha com no mínimo 6 caracteres"
              required={!initialData}
            />
          </div>
          <div className="md:col-span-1">
            <Label htmlFor="perfil">Perfil *</Label>
            <Select
              value={formData.perfil}
              onValueChange={(value: FormDataState['perfil']) => handleInputChange('perfil', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
                <SelectItem value="Padrão">Padrão</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: FormDataState['status']) => handleInputChange('status', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar Usuário</Button>
      </div>
    </form>
  );
}
