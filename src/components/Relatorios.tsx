
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Edit, Trash2, Plus } from "lucide-react";

const financialStats = [
  {
    title: "Total Receitas",
    value: "R$ 205.00",
    icon: TrendingUp,
    iconBg: "bg-green-600",
    color: "text-green-400"
  },
  {
    title: "Total Despesas",
    value: "R$ 430.00",
    icon: TrendingDown,
    iconBg: "bg-red-600",
    color: "text-red-400"
  },
  {
    title: "Lucro Líquido",
    value: "R$ -225.00",
    icon: DollarSign,
    iconBg: "bg-red-600",
    color: "text-red-400"
  },
];

const expenses = [
  {
    id: 1,
    title: "Material de impressão",
    date: "2024-06-01",
    value: "- R$ 250.00",
  },
  {
    id: 2,
    title: "Energia elétrica",
    date: "2024-06-03",
    value: "- R$ 180.00",
  },
];

const revenues = [
  {
    id: 1,
    title: "Banner personalizado",
    client: "João Silva",
    date: "2024-06-02",
    value: "+ R$ 120.00",
  },
  {
    id: 2,
    title: "Adesivos diversos",
    client: "Maria Santos",
    date: "2024-06-04",
    value: "+ R$ 85.00",
  },
];

export function Relatorios() {
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
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Despesa
                </Button>
              </div>
              
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center p-4 rounded-lg border border-crm-border">
                    <div>
                      <p className="text-white font-medium">{expense.title}</p>
                      <p className="text-gray-400 text-sm">{expense.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-red-400 font-semibold">{expense.value}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
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
                <Button className="bg-green-600 hover:bg-green-700">
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
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
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
    </div>
  );
}
