
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { OrcamentoModal } from "./modals/OrcamentoModal";

export function Orcamentos() {
  const [budgets, setBudgets] = useState([
    {
      id: 1,
      title: "Orçamento #1",
      client: "João Silva",
      date: "2024-06-05",
      total: "R$ 380.00",
      status: "Rascunho",
      items: [
        { quantity: 2, name: "Banner 2x1m", price: "80.00" },
        { quantity: 1, name: "Placa ACM", price: "150.00" },
      ],
    },
  ]);

  // Dados mockados para clientes e produtos
  const clientes = [
    { id: 1, name: "João Silva" },
    { id: 2, name: "Maria Santos" },
  ];

  const produtos = [
    { id: 1, name: "Banner 2x1m", price: "R$ 80.00" },
    { id: 2, name: "Adesivo Vinil", price: "R$ 25.00" },
    { id: 3, name: "Placa ACM", price: "R$ 150.00" },
  ];

  const [modalOpen, setModalOpen] = useState(false);

  const handleSaveBudget = (budgetData: any) => {
    setBudgets([...budgets, budgetData]);
  };

  const handleDeleteBudget = (budgetId: number) => {
    setBudgets(budgets.filter(budget => budget.id !== budgetId));
  };

  return (
    <div className="p-6 bg-crm-dark min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Orçamentos</h1>
        <Button 
          onClick={() => setModalOpen(true)}
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
                    <Badge variant="outline" className="bg-yellow-600 text-white border-yellow-600">
                      {budget.status}
                    </Badge>
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
                  <p className="text-2xl font-bold text-blue-400">{budget.total}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-white font-medium mb-3">Itens do Orçamento:</h4>
                <div className="space-y-2">
                  {budget.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-gray-300">
                      <span>({item.quantity}x) - {item.name}</span>
                      <span>R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
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
        onSave={handleSaveBudget}
      />
    </div>
  );
}
