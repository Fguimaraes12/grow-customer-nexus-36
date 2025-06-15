import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalClientes: 0,
    receitasDoMes: "R$ 0,00",
    despesasDoMes: "R$ 0,00",
    orcamentosPendentes: 0,
    clientesRecentes: [],
    atividadesRecentes: []
  });

  // Pega o mês/ano atual para filtrar
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
  const currentYear = currentDate.getFullYear();

  // Fetch data from Supabase
  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: orcamentos = [] } = useQuery({
    queryKey: ['orcamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar faturas para calcular receitas do mês
  const { data: faturas = [] } = useQuery({
    queryKey: ['faturas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faturas')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: despesas = [] } = useQuery({
    queryKey: ['despesas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('despesas')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const isCurrentMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
  };

  const calculateDashboardData = () => {
    // Calcular total de clientes
    const totalClientes = clientes.length;

    // Calcular receitas do mês das FATURAS do mês atual
    const receitasFaturas = faturas
      .filter(fatura => isCurrentMonth(fatura.date))
      .reduce((total, fatura) => {
        return total + parseFloat(fatura.value?.toString() || '0');
      }, 0);

    // Calcular receitas dos ORÇAMENTOS FINALIZADOS do mês atual
    const receitasOrcamentos = orcamentos
      .filter(orcamento => 
        orcamento.status === 'Finalizado' && 
        (isCurrentMonth(orcamento.date) || (orcamento.delivery_date && isCurrentMonth(orcamento.delivery_date)))
      )
      .reduce((total, orcamento) => {
        return total + parseFloat(orcamento.total?.toString() || '0');
      }, 0);

    // Total de receitas = faturas + orçamentos finalizados
    const receitasTotal = receitasFaturas + receitasOrcamentos;

    // Calcular despesas do mês atual
    const despesasTotal = despesas
      .filter(despesa => isCurrentMonth(despesa.date))
      .reduce((total, expense) => {
        return total + parseFloat(expense.value?.toString() || '0');
      }, 0);

    // Contar orçamentos pendentes (status "Aguardando")
    const orcamentosPendentes = orcamentos.filter(budget => budget.status === 'Aguardando').length;

    // Pegar os 2 clientes mais recentes
    const clientesRecentes = clientes.slice(0, 2);

    // Criar atividades recentes baseadas nos orçamentos
    const atividadesRecentes = orcamentos.slice(0, 2).map(budget => ({
      title: budget.title || 'Orçamento',
      client: budget.client_name,
      value: formatCurrency(parseFloat(budget.total?.toString() || '0')),
      date: new Date(budget.date).toLocaleDateString('pt-BR')
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
  }, [clientes, orcamentos, despesas, faturas]);

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
