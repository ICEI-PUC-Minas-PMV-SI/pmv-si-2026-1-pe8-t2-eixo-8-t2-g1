import { useState } from "react";
import {
  Document,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import { Download, FileText, Printer } from "lucide-react";
import type { ItemServicoApi, ProdutoApi, ServicoApi } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

const pdfStyles = StyleSheet.create({
  page: {
    padding: 32,
    color: "#1f2937",
    fontFamily: "Helvetica",
    fontSize: 9,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#111827",
    marginBottom: 16,
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 10,
    marginTop: 4,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    backgroundColor: "#f3f4f6",
    borderRadius: 3,
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
    padding: 6,
  },
  fields: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  field: {
    marginBottom: 7,
    paddingRight: 10,
    width: "50%",
  },
  fullField: {
    marginBottom: 7,
    width: "100%",
  },
  label: {
    color: "#6b7280",
    fontSize: 8,
    marginBottom: 2,
  },
  value: {
    fontSize: 9,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 8,
    paddingBottom: 8,
  },
  itemTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 6,
  },
});

type Field = {
  label: string;
  value: string;
};

type DialogPdfProps = {
  open: boolean;
  ordem: ServicoApi | null;
  onOpenChange: (open: boolean) => void;
};

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function displayDate(value?: string | null) {
  return value ? formatDate(value) : "-";
}

function getOsFields(ordem: ServicoApi): Field[] {
  return [
    { label: "ID", value: displayValue(ordem.id) },
    { label: "Status", value: displayValue(ordem.status) },
    { label: "Data de entrada", value: displayDate(ordem.dataInicio) },
    { label: "Data de conclusao", value: displayDate(ordem.dataFim) },
    {
      label: "Valor total",
      value: formatCurrency(Number(ordem.valorTotal || 0)),
    },
    { label: "ID do veiculo", value: displayValue(ordem.idVeiculo) },
  ];
}

function getVehicleFields(ordem: ServicoApi): Field[] {
  const veiculo = ordem.veiculo;

  if (!veiculo) {
    return [{ label: "Veiculo", value: "Nao informado" }];
  }

  return [
    { label: "ID", value: displayValue(veiculo.id) },
    { label: "ID do cliente", value: displayValue(veiculo.idCliente) },
    { label: "Placa", value: displayValue(veiculo.placa) },
    { label: "Modelo", value: displayValue(veiculo.modelo) },
    { label: "Ano", value: displayValue(veiculo.ano) },
    { label: "Cor", value: displayValue(veiculo.cor) },
    {
      label: "Quilometragem",
      value: displayValue(veiculo.quilometragem),
    },
    { label: "Tipo", value: displayValue(veiculo.tipoVeiculo) },
    { label: "Motorizacao", value: displayValue(veiculo.motorizacao) },
    { label: "Chassi", value: displayValue(veiculo.numeroChasse) },
    {
      label: "Combustivel",
      value: displayValue(veiculo.tipoCombustivel),
    },
    {
      label: "Ultima revisao",
      value: displayDate(veiculo.dataUltimaRevisao),
    },
    { label: "Criado em", value: displayDate(veiculo.dataCriacao) },
    { label: "Atualizado em", value: displayDate(veiculo.dataAtualizacao) },
  ];
}

function getClientFields(ordem: ServicoApi): Field[] {
  const cliente = ordem.veiculo?.cliente;

  if (!cliente) {
    return [{ label: "Cliente", value: "Nao informado" }];
  }

  return [
    { label: "ID", value: displayValue(cliente.id) },
    { label: "Nome", value: displayValue(cliente.nomeCompleto) },
    { label: "Genero", value: displayValue(cliente.genero) },
    { label: "Nascimento", value: displayDate(cliente.dataNascimento) },
    { label: "Tipo", value: displayValue(cliente.tipo) },
    { label: "Telefone", value: displayValue(cliente.telefone) },
    { label: "E-mail", value: displayValue(cliente.email) },
    {
      label: "Fornecedor",
      value: cliente.isFornecedor ? "Sim" : "Nao",
    },
    { label: "Observacao", value: displayValue(cliente.observacao) },
    { label: "Criado em", value: displayDate(cliente.dataCriacao) },
    { label: "Atualizado em", value: displayDate(cliente.dataAtualizacao) },
  ];
}

function getAddressFields(ordem: ServicoApi): Field[] {
  const endereco = ordem.veiculo?.cliente?.endereco;

  if (!endereco) {
    return [{ label: "Endereco", value: "Nao informado" }];
  }

  return [
    { label: "Logradouro", value: displayValue(endereco.logradouro) },
    { label: "Numero", value: displayValue(endereco.numero) },
    { label: "Complemento", value: displayValue(endereco.complemento) },
    { label: "Bairro", value: displayValue(endereco.bairro) },
    { label: "Cidade", value: displayValue(endereco.cidade) },
    { label: "UF", value: displayValue(endereco.uf) },
    { label: "Pais", value: displayValue(endereco.pais) },
    { label: "CEP", value: displayValue(endereco.cep) },
  ];
}

function getRelatedTitle(relation?: { titulo: string } | null) {
  return displayValue(relation?.titulo);
}

function getSupplierName(relation?: { nomeCompleto: string } | null) {
  return displayValue(relation?.nomeCompleto);
}

function getProductFields(
  produto: ProdutoApi | null | undefined,
  quantidade: number
): Field[] {
  if (!produto) {
    return [
      { label: "Produto", value: "-" },
      { label: "Descricao", value: "-" },
      { label: "SKU", value: "-" },
      { label: "Tipo do item", value: "-" },
      { label: "Preco unitario", value: "-" },
      { label: "Estoque atual", value: "-" },
      { label: "ID da marca", value: "-" },
      { label: "Marca", value: "-" },
      { label: "ID da categoria", value: "-" },
      { label: "Categoria", value: "-" },
      { label: "ID do fornecedor", value: "-" },
      { label: "Fornecedor", value: "-" },
      { label: "Subtotal", value: "-" },
    ];
  }

  return [
    { label: "Produto", value: displayValue(produto.titulo) },
    { label: "Descricao", value: displayValue(produto.descricao) },
    { label: "SKU", value: displayValue(produto.codigoSku) },
    { label: "Tipo do item", value: displayValue(produto.tipoItem) },
    {
      label: "Preco unitario",
      value: formatCurrency(Number(produto.preco || 0)),
    },
    { label: "Estoque atual", value: displayValue(produto.estoqueAtual) },
    { label: "ID da marca", value: displayValue(produto.idMarca) },
    { label: "Marca", value: getRelatedTitle(produto.marca) },
    { label: "ID da categoria", value: displayValue(produto.idCategoria) },
    { label: "Categoria", value: getRelatedTitle(produto.categoria) },
    { label: "ID do fornecedor", value: displayValue(produto.idFornecedor) },
    {
      label: "Fornecedor",
      value: getSupplierName(produto.fornecedor),
    },
    {
      label: "Subtotal",
      value: formatCurrency(quantidade * Number(produto.preco || 0)),
    },
  ];
}

function getItemFields(item: ItemServicoApi): Field[] {
  const quantidade = Number(item.quantidadeUtilizada);
  const produto = item.produto;

  return [
    { label: "ID do item", value: displayValue(item.id) },
    { label: "ID da OS", value: displayValue(item.idServico) },
    { label: "ID do produto", value: displayValue(item.idProduto) },
    {
      label: "Quantidade utilizada",
      value: displayValue(item.quantidadeUtilizada),
    },
    ...getProductFields(produto, quantidade),
  ];
}

function PdfFields({ fields }: { fields: Field[] }) {
  return (
    <View style={pdfStyles.fields}>
      {fields.map(field => (
        <View key={field.label} style={pdfStyles.field}>
          <Text style={pdfStyles.label}>{field.label}</Text>
          <Text style={pdfStyles.value}>{field.value}</Text>
        </View>
      ))}
    </View>
  );
}

function PdfSection({
  title,
  fields,
}: {
  title: string;
  fields: Field[];
}) {
  return (
    <View style={pdfStyles.section}>
      <Text style={pdfStyles.sectionTitle}>{title}</Text>
      <PdfFields fields={fields} />
    </View>
  );
}

function OrdemServicoPdf({ ordem }: { ordem: ServicoApi }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Ordem de Servico #{ordem.id}</Text>
          <Text style={pdfStyles.subtitle}>
            Relatorio completo da ordem de servico
          </Text>
        </View>

        <PdfSection title="Dados da OS" fields={getOsFields(ordem)} />

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Solicitacao</Text>
          <View style={pdfStyles.fullField}>
            <Text style={pdfStyles.value}>{ordem.descricao}</Text>
          </View>
        </View>

        <PdfSection title="Veiculo" fields={getVehicleFields(ordem)} />
        <PdfSection title="Cliente" fields={getClientFields(ordem)} />
        <PdfSection title="Endereco" fields={getAddressFields(ordem)} />

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Itens</Text>
          {ordem.itens?.length ? (
            ordem.itens.map((item, index) => (
              <View key={item.id} style={pdfStyles.item} wrap={false}>
                <Text style={pdfStyles.itemTitle}>Item {index + 1}</Text>
                <PdfFields fields={getItemFields(item)} />
              </View>
            ))
          ) : (
            <Text style={pdfStyles.value}>Nenhum item vinculado</Text>
          )}
        </View>
      </Page>
    </Document>
  );
}

function PreviewSection({
  title,
  fields,
}: {
  title: string;
  fields: Field[];
}) {
  return (
    <section className="space-y-3">
      <h3 className="border-b pb-2 font-semibold">{title}</h3>
      <div className="grid gap-4 text-sm sm:grid-cols-2">
        {fields.map(field => (
          <div key={field.label}>
            <p className="text-muted-foreground">{field.label}</p>
            <p className="font-medium break-words">{field.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PdfDialogContent({
  ordem,
  isGenerated,
  onGenerate,
}: {
  ordem: ServicoApi | null;
  isGenerated: boolean;
  onGenerate: () => void;
}) {
  if (!ordem) {
    return null;
  }

  if (!isGenerated) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <Button
          type="button"
          className="h-32 w-full max-w-xl gap-4 text-xl font-semibold"
          onClick={onGenerate}
        >
          <FileText className="size-8" />
          GERAR PDF
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto rounded-lg border bg-secondary/10 p-5">
      <PreviewSection title="Dados da OS" fields={getOsFields(ordem)} />

      <section className="space-y-3">
        <h3 className="border-b pb-2 font-semibold">Solicitacao</h3>
        <p className="text-sm whitespace-pre-wrap">{ordem.descricao}</p>
      </section>

      <PreviewSection title="Veiculo" fields={getVehicleFields(ordem)} />
      <PreviewSection title="Cliente" fields={getClientFields(ordem)} />
      <PreviewSection title="Endereco" fields={getAddressFields(ordem)} />

      <section className="space-y-3">
        <h3 className="border-b pb-2 font-semibold">Itens</h3>
        {ordem.itens?.length ? (
          ordem.itens.map((item, index) => (
            <div
              key={item.id}
              className="space-y-3 rounded-lg border bg-background p-4"
            >
              <h4 className="font-semibold">Item {index + 1}</h4>
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                {getItemFields(item).map(field => (
                  <div key={field.label}>
                    <p className="text-muted-foreground">{field.label}</p>
                    <p className="font-medium break-words">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum item vinculado
          </p>
        )}
      </section>
    </div>
  );
}

function PdfDialogActions({
  ordem,
  isGenerated,
  isPrinting,
  onPrint,
}: {
  ordem: ServicoApi | null;
  isGenerated: boolean;
  isPrinting: boolean;
  onPrint: () => void;
}) {
  if (!ordem || !isGenerated) {
    return null;
  }

  return (
    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={isPrinting}
        onClick={onPrint}
      >
        <Printer className="size-4" />
        {isPrinting ? "Preparando..." : "Imprimir"}
      </Button>

      <Button asChild className="gap-2">
        <PDFDownloadLink
          document={<OrdemServicoPdf ordem={ordem} />}
          fileName={`ordem-servico-${ordem.id}.pdf`}
        >
          <Download className="size-4" />
          Download
        </PDFDownloadLink>
      </Button>
    </DialogFooter>
  );
}

export function DialogPdf({
  open,
  ordem,
  onOpenChange,
}: DialogPdfProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState<number | null>(null);
  const isGenerated = generatedOrderId === ordem?.id;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setGeneratedOrderId(null);
    }

    onOpenChange(nextOpen);
  };

  const handlePrint = async () => {
    if (!ordem) {
      return;
    }

    setIsPrinting(true);

    try {
      const blob = await pdf(<OrdemServicoPdf ordem={ordem} />).toBlob();
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");

      iframe.style.position = "fixed";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.src = url;
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        window.setTimeout(() => {
          iframe.remove();
          URL.revokeObjectURL(url);
        }, 1000);
      };

      document.body.appendChild(iframe);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[90vh] max-w-5xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {ordem ? `Ordem de Servico #${ordem.id}` : "Ordem de Servico"}
          </DialogTitle>
          <DialogDescription>
            Confira os dados antes de imprimir ou baixar o PDF.
          </DialogDescription>
        </DialogHeader>

        <PdfDialogContent
          ordem={ordem}
          isGenerated={isGenerated}
          onGenerate={() => ordem && setGeneratedOrderId(ordem.id)}
        />

        <PdfDialogActions
          ordem={ordem}
          isGenerated={isGenerated}
          isPrinting={isPrinting}
          onPrint={handlePrint}
        />
      </DialogContent>
    </Dialog>
  );
}
