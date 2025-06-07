
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProdutoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto?: any;
  onSave: (produto: any) => void;
}

export function ProdutoModal({ open, onOpenChange, produto, onSave }: ProdutoModalProps) {
  const [formData, setFormData] = useState({
    name: produto?.name || "",
    price: produto?.price ? produto.price.replace('R$ ', '').replace('.', '').replace(',', '.') : "",
  });

  const formatPrice = (value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '');
    
    if (!numbers) return '';
    
    // Converte para número e formata
    const numberValue = parseFloat(numbers) / 100;
    
    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatPrice(value);
    setFormData({ ...formData, price: formattedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: `R$ ${formData.price}`,
      id: produto?.id || Date.now(),
    });
    onOpenChange(false);
    setFormData({ name: "", price: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-crm-card border-crm-border text-white">
        <DialogHeader>
          <DialogTitle>{produto ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Produto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-crm-dark border-crm-border text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Preço</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                R$
              </span>
              <Input
                id="price"
                value={formData.price}
                onChange={handlePriceChange}
                className="bg-crm-dark border-crm-border text-white pl-10"
                placeholder="0,00"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {produto ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
