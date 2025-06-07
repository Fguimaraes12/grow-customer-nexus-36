
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, FileText } from "lucide-react";
import { ProdutoModal } from "./modals/ProdutoModal";

export function Produtos() {
  const [products, setProducts] = useState(() => {
    // Carrega produtos do localStorage na inicialização
    const savedProducts = localStorage.getItem('produtos');
    return savedProducts ? JSON.parse(savedProducts) : [
      {
        id: 1,
        name: "Banner 2x1m",
        price: "R$ 80.00",
      },
      {
        id: 2,
        name: "Adesivo Vinil",
        price: "R$ 25.00",
      },
      {
        id: 3,
        name: "Placa ACM",
        price: "R$ 150.00",
      },
    ];
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Salva produtos no localStorage sempre que a lista muda
  useEffect(() => {
    localStorage.setItem('produtos', JSON.stringify(products));
  }, [products]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveProduct = (productData: any) => {
    if (editingProduct) {
      setProducts(products.map(product => 
        product.id === editingProduct.id ? productData : product
      ));
      setEditingProduct(null);
    } else {
      setProducts([...products, productData]);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDeleteProduct = (productId: number) => {
    setProducts(products.filter(product => product.id !== productId));
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  return (
    <div className="p-6 bg-crm-dark min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Produtos</h1>
        <Button onClick={handleNewProduct} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-crm-card border-crm-border text-white placeholder-gray-400"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="bg-crm-card border-crm-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{product.name}</h3>
                    <p className="text-green-400 font-bold text-lg">{product.price}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleEditProduct(product)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProdutoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        produto={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
