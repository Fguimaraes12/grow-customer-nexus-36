
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Calendar } from "lucide-react";

const stats = [
  {
    title: "Total Clientes",
    value: "2",
    icon: Users,
    iconBg: "bg-blue-600",
  },
  {
    title: "Receitas do Mês",
    value: "R$ 205.00",
    icon: DollarSign,
    iconBg: "bg-green-600",
  },
  {
    title: "Despesas do Mês",
    value: "R$ 430.00",
    icon: TrendingUp,
    iconBg: "bg-red-600",
  },
  {
    title: "Orçamentos Pending",
    value: "1",
    icon: Calendar,
    iconBg: "bg-yellow-600",
  },
];

const recentClients = [
  {
    name: "João Silva",
    phone: "(85) 99999-9999",
  },
  {
    name: "Maria Santos",
    phone: "(85) 88888-8888",
  },
];

const recentActivity = [
  {
    title: "Banner personalizado",
    client: "João Silva",
    value: "R$ 120.00",
    date: "2024-06-02",
  },
  {
    title: "Adesivos diversos",
    client: "Maria Santos",
    value: "R$ 85.00",
    date: "2024-06-04",
  },
];

export function Dashboard() {
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
              {recentClients.map((client, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{client.name}</p>
                    <p className="text-gray-400 text-sm">{client.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-crm-card border-crm-border">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Atividade Recente</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
