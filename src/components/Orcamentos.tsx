
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit } from "lucide-react";
import { OrcamentoModal } from "./modals/OrcamentoModal";
import { useLogs } from "@/contexts/LogsContext";

export function Orcamentos() {
  const [budgets, setBudgets] = useState(() => {
    // Carrega orçamentos do localStorage na inicialização
    const savedBudgets = localStorage.getItem('orcamentos');
    return savedBudgets ? JSON.parse(savedBudgets) : [];
  });

  // Carrega produtos e clientes do localStorage
  const [produtos] = useState(() => {
    const savedProducts = localStorage.getItem('produtos');
    return savedProducts ? JSON.parse(savedProducts) : [
      { id: 1, name: "Banner 2x1m", price: "R$ 80,00" },
      { id: 2, name: "Adesivo Vinil", price: "R$ 25,00" },
      { id: 3, name: "Placa ACM", price: "R$ 150,00" },
    ];
  });

  const [clientes] = useState(() => {
    const savedClients = localStorage.getItem('clientes');
    return savedClients ? JSON.parse(savedClients) : [
      { id: 1, name: "João Silva" },
      { id: 2, name: "Maria Santos" },
    ];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const { addLog } = useLogs();

  // Salva orçamentos no localStorage sempre que a lista muda
  useEffect(() => {
    localStorage.setItem('orcamentos', JSON.stringify(budgets));
  }, [budgets]);

  const formatCurrency = (value: any) => {
    // Se já está formatado como string, retorna como está
    if (typeof value === 'string' && value.includes('R$')) {
      return value;
    }
    
    // Se é número, formata
    if (typeof value === 'number') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    
    // Se é string com número, converte e formata
    const numericValue = parseFloat(value.toString().replace(/[^\d.,]/g, '').replace(',', '.'));
    if (isNaN(numericValue)) return value;
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  };

  const handleSaveBudget = (budgetData: any) => {
    if (editingBudget) {
      setBudgets(budgets.map(budget => 
        budget.id === editingBudget.id ? budgetData : budget
      ));
      addLog('edit', 'orcamento', budgetData.title, `Cliente: ${budgetData.client} - Total: ${budgetData.total}`);
      setEditingBudget(null);
    } else {
      setBudgets([...budgets, budgetData]);
      addLog('create', 'orcamento', budgetData.title, `Cliente: ${budgetData.client} - Total: ${budgetData.total}`);
    }
    
    // Dispara um evento customizado para notificar outros componentes
    window.dispatchEvent(new CustomEvent('budgetCreated'));
  };

  const handleDeleteBudget = (budgetId: number) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (budget) {
      setBudgets(budgets.filter(budget => budget.id !== budgetId));
      addLog('delete', 'orcamento', budget.title, `Cliente: ${budget.client}`);
      
      // Dispara um evento customizado para notificar outros componentes
      window.dispatchEvent(new CustomEvent('budgetCreated'));
    }
  };

  const handleStatusChange = (budgetId: number, newStatus: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (budget) {
      setBudgets(budgets.map(budget => 
        budget.id === budgetId ? { ...budget, status: newStatus } : budget
      ));
      addLog('edit', 'orcamento', budget.title, `Status alterado para: ${newStatus}`);
      
      // Dispara um evento customizado para notificar outros componentes
      window.dispatchEvent(new CustomEvent('budgetCreated'));
    }
  };

  const handleEditBudget = (budget: any) => {
    setEditingBudget(budget);
    setModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Finalizado':
        return 'bg-green-600 text-white border-green-600';
      case 'Aguardando':
        return 'bg-blue-600 text-white border-blue-600';
      default:
        return 'bg-gray-600 text-white border-gray-600';
    }
  };

  return (
    <div className="p-6 bg-crm-dark min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Orçamentos</h1>
        <Button 
          onClick={() => {
            setEditingBudget(null);
            setModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Budgets */}
      <div className="grid grid-cols-1 gap-6">
        {budgets.map((budget) => (
          <Card key={budget.id} className="bg-crm-card border-crm-border">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{budget.title}</h3>
                    <Select
                      value={budget.status}
                      onValueChange={(value) => handleStatusChange(budget.id, value)}
                    >
                      <SelectTrigger className={`w-32 ${getStatusColor(budget.status)} border-none`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-crm-dark border-crm-border">
                        <SelectItem value="Aguardando" className="text-white">Aguardando</SelectItem>
                        <SelectItem value="Finalizado" className="text-white">Finalizado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleEditBudget(budget)}
                      className="text-gray-400 hover:text-blue-400"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-gray-400">{budget.client}</p>
                  <p className="text-gray-400 text-sm">{budget.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Total do Orçamento</p>
                  <p className="text-2xl font-bold text-blue-400">{formatCurrency(budget.total)}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-white font-medium mb-3">Itens do Orçamento:</h4>
                <div className="space-y-2">
                  {budget.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-gray-300">
                      <span>({item.quantity}x) - {item.name}</span>
                      <span>{formatCurrency(parseFloat(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <OrcamentoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        clientes={clientes}
        produtos={produtos}
        budget={editingBudget}
        onSave={handleSaveBudget}
      />
    </div>
  );
}
