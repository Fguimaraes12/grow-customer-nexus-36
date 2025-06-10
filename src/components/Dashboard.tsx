import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalClientes: 0,
    receitasDoMes: "R$ 0,00",
    despesasDoMes: "R$ 0,00",
    orcamentosPendentes: 0,
    clientesRecentes: [],
    atividadesRecentes: []
  });

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

  const calculateDashboardData = () => {
    // Buscar dados do localStorage
    const savedClients = localStorage.getItem('clientes');
    const savedBudgets = localStorage.getItem('orcamentos');
    const savedExpenses = localStorage.getItem('despesas') || '[]';

    const clients = savedClients ? JSON.parse(savedClients) : [];
    const budgets = savedBudgets ? JSON.parse(savedBudgets) : [];
    const expenses = JSON.parse(savedExpenses);

    // Calcular total de clientes
    const totalClientes = clients.length;

    // Calcular receitas do mês APENAS dos orçamentos FINALIZADOS
    const receitasTotal = budgets
      .filter(budget => budget.status === 'Finalizado')
      .reduce((total, budget) => {
        const value = parseValue(budget.total);
        return total + value;
      }, 0);

    // Calcular despesas do mês
    const despesasTotal = expenses.reduce((total, expense) => {
      const value = parseValue(expense.value);
      return total + value;
    }, 0);

    // Contar orçamentos pendentes (status "Rascunho")
    const orcamentosPendentes = budgets.filter(budget => budget.status === 'Rascunho').length;

    // Pegar os 2 clientes mais recentes
    const clientesRecentes = clients.slice(-2).reverse();

    // Criar atividades recentes baseadas nos orçamentos
    const atividadesRecentes = budgets.slice(-2).reverse().map(budget => ({
      title: budget.title || 'Orçamento',
      client: budget.client,
      value: budget.total,
      date: budget.date
    }));

    setDashboardData({
      totalClientes,
      receitasDoMes: formatCurrency(receitasTotal),
      despesasDoMes: formatCurrency(despesasTotal),
      orcamentosPendentes,
      clientesRecentes,
      atividadesRecentes
    });
  };

  useEffect(() => {
    calculateDashboardData();

    // Escutar mudanças nos dados
    const handleDataChange = () => {
      calculateDashboardData();
    };

    window.addEventListener('storage', handleDataChange);
    window.addEventListener('budgetCreated', handleDataChange);
    
    return () => {
      window.removeEventListener('storage', handleDataChange);
      window.removeEventListener('budgetCreated', handleDataChange);
    };
  }, []);

  const stats = [
    {
      title: "Total Clientes",
      value: dashboardData.totalClientes.toString(),
      icon: Users,
      iconBg: "bg-blue-600",
    },
    {
      title: "Receitas do Mês",
      value: dashboardData.receitasDoMes,
      icon: DollarSign,
      iconBg: "bg-green-600",
    },
    {
      title: "Despesas do Mês",
      value: dashboardData.despesasDoMes,
      icon: TrendingUp,
      iconBg: "bg-red-600",
    },
    {
      title: "Orçamentos Pendentes",
      value: dashboardData.orcamentosPendentes.toString(),
      icon: Calendar,
      iconBg: "bg-yellow-600",
    },
  ];

  return (
    <div className="p-6 bg-crm-dark min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-crm-card border-crm-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <Card className="bg-crm-card border-crm-border">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Clientes Recentes</h3>
            <div className="space-y-4">
              {dashboardData.clientesRecentes.length > 0 ? (
                dashboardData.clientesRecentes.map((client, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{client.name}</p>
                      <p className="text-gray-400 text-sm">{client.phone}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Nenhum cliente cadastrado ainda</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-crm-card border-crm-border">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Atividade Recente</h3>
            <div className="space-y-4">
              {dashboardData.atividadesRecentes.length > 0 ? (
                dashboardData.atividadesRecentes.map((activity, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">{activity.title}</p>
                      <p className="text-gray-400 text-sm">{activity.client}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">{activity.value}</p>
                      <p className="text-gray-400 text-sm">{activity.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Nenhuma atividade registrada ainda</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
