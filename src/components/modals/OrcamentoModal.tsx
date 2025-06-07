
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface OrcamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientes: any[];
  produtos: any[];
  onSave: (orcamento: any) => void;
}

export function OrcamentoModal({ open, onOpenChange, clientes, produtos, onSave }: OrcamentoModalProps) {
  const [selectedClient, setSelectedClient] = useState("");
  const [items, setItems] = useState([{ product: "", quantity: 1, price: 0 }]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const addItem = () => {
    setItems([...items, { product: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === "product") {
      const selectedProduct = produtos.find(p => p.name === value);
      if (selectedProduct) {
        // Remove o "R$ " do preço e converte para número
        const priceValue = selectedProduct.price.replace(/[^\d,]/g, '').replace(',', '.');
        newItems[index].price = parseFloat(priceValue);
      }
    }
    
    setItems(newItems);
  };

  const calculateTotal = () => {
    const total = items.reduce((total, item) => total + (item.quantity * item.price), 0);
    return formatCurrency(total);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filtra apenas itens com produtos selecionados e converte para o formato correto
    const validItems = items
      .filter(item => item.product && item.quantity > 0)
      .map(item => ({
        quantity: item.quantity,
        name: item.product,
        price: item.price.toFixed(2)
      }));

    const totalValue = items.reduce((total, item) => total + (item.quantity * item.price), 0);

    const orcamento = {
      id: Date.now(),
      title: `Orçamento #${Date.now()}`,
      client: selectedClient,
      date: new Date().toLocaleDateString('pt-BR'),
      total: formatCurrency(totalValue),
      status: "Rascunho",
      items: validItems,
    };

    console.log('Salvando orçamento:', orcamento);
    onSave(orcamento);
    onOpenChange(false);
    
    // Reset form
    setSelectedClient("");
    setItems([{ product: "", quantity: 1, price: 0 }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-crm-card border-crm-border text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Orçamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="client">Cliente *</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient} required>
              <SelectTrigger className="bg-crm-dark border-crm-border text-white">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent className="bg-crm-dark border-crm-border">
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.name} className="text-white">
                    {cliente.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <Label>Produtos</Label>
              <Button type="button" size="sm" onClick={addItem} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 items-end p-3 border border-crm-border rounded-lg">
                  <div className="flex-1">
                    <Label>Produto</Label>
                    <Select 
                      value={item.product} 
                      onValueChange={(value) => updateItem(index, "product", value)}
                    >
                      <SelectTrigger className="bg-crm-dark border-crm-border text-white">
                        <SelectValue placeholder="Produto" />
                      </SelectTrigger>
                      <SelectContent className="bg-crm-dark border-crm-border">
                        {produtos.map((produto) => (
                          <SelectItem key={produto.id} value={produto.name} className="text-white">
                            {produto.name} - {produto.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-20">
                    <Label>Qtd</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                      className="bg-crm-dark border-crm-border text-white"
                    />
                  </div>
                  
                  <div className="w-32">
                    <Label>Preço</Label>
                    <div className="text-white bg-crm-dark border border-crm-border rounded-md px-3 py-2 text-sm">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(index)}
                    className="text-red-400 hover:text-red-300"
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total do Orçamento:</span>
            <span className="text-blue-400">{calculateTotal()}</span>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Criar Orçamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
