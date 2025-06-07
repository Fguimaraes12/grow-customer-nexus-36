import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, Users } from "lucide-react";
import { ClienteModal } from "./modals/ClienteModal";

export function Clientes() {
  const [clients, setClients] = useState(() => {
    // Carrega clientes do localStorage na inicialização
    const savedClients = localStorage.getItem('clientes');
    return savedClients ? JSON.parse(savedClients) : [
      {
        id: 1,
        name: "João Silva",
        phone: "(85) 99999-9999",
        address: "Rua A, 123, Fortaleza-CE",
        totalSpent: "R$ 120.00",
        orders: 1,
      },
      {
        id: 2,
        name: "Maria Santos",
        phone: "(85) 88888-8888",
        address: "Av. B, 456, Fortaleza-CE",
        totalSpent: "R$ 85.00",
        orders: 1,
      },
    ];
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // Salva clientes no localStorage sempre que a lista muda
  useEffect(() => {
    localStorage.setItem('clientes', JSON.stringify(clients));
  }, [clients]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveClient = (clientData: any) => {
    if (editingClient) {
      setClients(clients.map(client => 
        client.id === editingClient.id ? clientData : client
      ));
      setEditingClient(null);
    } else {
      setClients([...clients, clientData]);
    }
  };

  const handleEditClient = (client: any) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  const handleDeleteClient = (clientId: number) => {
    setClients(clients.filter(client => client.id !== clientId));
  };

  const handleNewClient = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  return (
    <div className="p-6 bg-crm-dark min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Clientes</h1>
        <Button onClick={handleNewClient} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-crm-card border-crm-border text-white placeholder-gray-400"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="bg-crm-card border-crm-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{client.name}</h3>
                    <p className="text-gray-400 text-sm">{client.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleEditClient(client)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleDeleteClient(client.id)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-4">{client.address}</p>
              
              <div className="flex justify-between items-center pt-4 border-t border-crm-border">
                <div>
                  <p className="text-gray-400 text-xs">Total gasto</p>
                  <p className="text-green-400 font-semibold">{client.totalSpent}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Pedidos</p>
                  <p className="text-white font-semibold">{client.orders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ClienteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        cliente={editingClient}
        onSave={handleSaveClient}
      />
    </div>
  );
}
