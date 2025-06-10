import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Edit, Trash2, Plus } from "lucide-react";
import { DespesaModal } from "./modals/DespesaModal";
import { FaturaModal } from "./modals/FaturaModal";

export function Relatorios() {
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem('despesas');
    return savedExpenses ? JSON.parse(savedExpenses) : [
      {
        id: 1,
        title: "Material de impressão",
        client: "João Silva",
        date: "2024-06-01",
        value: "- R$ 250,00",
      },
      {
        id: 2,
        title: "Energia elétrica",
        client: "Maria Santos",
        date: "2024-06-03",
        value: "- R$ 180,00",
      },
    ];
  });

  const [revenues, setRevenues] = useState(() => {
    const savedRevenues = localStorage.getItem('faturas');
    return savedRevenues ? JSON.parse(savedRevenues) : [
      {
        id: 1,
        title: "Banner personalizado",
        client: "João Silva",
        date: "2024-06-02",
        value: "+ R$ 120,00",
      },
      {
        id: 2,
        title: "Adesivos diversos",
        client: "Maria Santos",
        date: "2024-06-04",
        value: "+ R$ 85,00",
      },
    ];
  });

  const [despesaModalOpen, setDespesaModalOpen] = useState(false);
  const [faturaModalOpen, setFaturaModalOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState(null);
  const [editingFatura, setEditingFatura] = useState(null);

  // Salvar no localStorage quando os dados mudarem
  useEffect(() => {
    localStorage.setItem('despesas', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('faturas', JSON.stringify(revenues));
  }, [revenues]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const parseValue = (valueString: string) => {
    // Remove tudo exceto números, vírgulas e pontos
    let cleanValue = valueString.replace(/[^\d,.]/g, '');
    
    // Se contém vírgula, assumimos formato brasileiro (ex: 1.500,00)
    if (cleanValue.includes(',')) {
      // Remove pontos (separadores de milhares) e substitui vírgula por ponto
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    }
    
    const numberValue = parseFloat(cleanValue);
    return isNaN(numberValue) ? 0 : numberValue;
  };

  const calculateTotal = (items: any[], isExpense: boolean) => {
    return items.reduce((total, item) => {
      const value = parseValue(item.value);
      return total + Math.abs(value); // Usar valor absoluto para evitar problemas com sinais
    }, 0);
  };

  const totalExpenses = calculateTotal(expenses, true);
  const totalRevenues = calculateTotal(revenues, false);
  const netProfit = totalRevenues - totalExpenses;

  const financialStats = [
    {
      title: "Total Receitas",
      value: formatCurrency(totalRevenues),
      icon: TrendingUp,
      iconBg: "bg-green-600",
      color: "text-green-400"
    },
    {
      title: "Total Despesas",
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      iconBg: "bg-red-600",
      color: "text-red-400"
    },
    {
      title: "Lucro Líquido",
      value: formatCurrency(netProfit),
      icon: DollarSign,
      iconBg: netProfit >= 0 ? "bg-green-600" : "bg-red-600",
      color: netProfit >= 0 ? "text-green-400" : "text-red-400"
    },
  ];

  const handleSaveDespesa = (despesaData: any) => {
    if (editingDespesa) {
      setExpenses(expenses.map(expense => 
        expense.id === editingDespesa.id ? despesaData : expense
      ));
      setEditingDespesa(null);
    } else {
      setExpenses([...expenses, despesaData]);
    }
  };

  const handleSaveFatura = (faturaData: any) => {
    if (editingFatura) {
      setRevenues(revenues.map(revenue => 
        revenue.id === editingFatura.id ? faturaData : revenue
      ));
      setEditingFatura(null);
    } else {
      setRevenues([...revenues, faturaData]);
    }
  };

  return (
    <div className="p-6 bg-crm-dark min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">Relatórios Financeiros</h1>
      
      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {financialStats.map((stat) => (
          <Card key={stat.title} className="bg-crm-card border-crm-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for Expenses and Revenues */}
      <Card className="bg-crm-card border-crm-border">
        <CardContent className="p-6">
          <Tabs defaultValue="expenses" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-crm-dark">
              <TabsTrigger value="expenses" className="text-gray-300 data-[state=active]:text-white">
                Despesas
              </TabsTrigger>
              <TabsTrigger value="revenues" className="text-gray-300 data-[state=active]:text-white">
                Faturas
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="expenses" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Despesas</h3>
                <Button 
                  onClick={() => {
                    setEditingDespesa(null);
                    setDespesaModalOpen(true);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Despesa
                </Button>
              </div>
              
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center p-4 rounded-lg border border-crm-border">
                    <div>
                      <p className="text-white font-medium">{expense.title}</p>
                      <p className="text-gray-400 text-sm">{expense.client} • {expense.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-red-400 font-semibold">{expense.value}</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setEditingDespesa(expense);
                            setDespesaModalOpen(true);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setExpenses(expenses.filter(e => e.id !== expense.id))}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="revenues" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Faturas</h3>
                <Button 
                  onClick={() => {
                    setEditingFatura(null);
                    setFaturaModalOpen(true);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Fatura
                </Button>
              </div>
              
              <div className="space-y-4">
                {revenues.map((revenue) => (
                  <div key={revenue.id} className="flex justify-between items-center p-4 rounded-lg border border-crm-border">
                    <div>
                      <p className="text-white font-medium">{revenue.title}</p>
                      <p className="text-gray-400 text-sm">{revenue.client} • {revenue.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-green-400 font-semibold">{revenue.value}</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setEditingFatura(revenue);
                            setFaturaModalOpen(true);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setRevenues(revenues.filter(r => r.id !== revenue.id))}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <DespesaModal
        open={despesaModalOpen}
        onOpenChange={setDespesaModalOpen}
        despesa={editingDespesa}
        onSave={handleSaveDespesa}
      />

      <FaturaModal
        open={faturaModalOpen}
        onOpenChange={setFaturaModalOpen}
        fatura={editingFatura}
        onSave={handleSaveFatura}
      />
    </div>
  );
}
