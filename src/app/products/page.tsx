import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { PlusCircle, Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sample product data structure
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  description: string;
  aiHint: string;
}

const sampleProducts: Product[] = [
  { id: '1', name: 'Drip Irrigation Kit', category: 'Irrigation Systems', price: 150.00, imageUrl: 'https://picsum.photos/seed/dripkit/400/300', description: 'Complete kit for efficient water delivery to plants.', aiHint: 'irrigation kit' },
  { id: '2', name: 'Sprinkler System Pack', category: 'Irrigation Systems', price: 220.50, imageUrl: 'https://picsum.photos/seed/sprinkler/400/300', description: 'High-quality sprinklers for lawn and garden.', aiHint: 'sprinkler system' },
  { id: '3', name: 'Organic Fertilizer Bag', category: 'Soil Amendments', price: 25.99, imageUrl: 'https://picsum.photos/seed/fertilizer/400/300', description: '50lb bag of premium organic fertilizer.', aiHint: 'fertilizer bag' },
  { id: '4', name: 'Gardening Tool Set', category: 'Tools', price: 75.00, imageUrl: 'https://picsum.photos/seed/tools/400/300', description: 'Durable and ergonomic set of gardening tools.', aiHint: 'gardening tools' },
  { id: '5', name: 'Water Pump 1HP', category: 'Pumps', price: 300.00, imageUrl: 'https://picsum.photos/seed/pump/400/300', description: 'Efficient 1HP water pump for various agricultural needs.', aiHint: 'water pump' },
  { id: '6', name: 'Polyethylene Pipe Roll', category: 'Piping', price: 80.00, imageUrl: 'https://picsum.photos/seed/pipe/400/300', description: '100m roll of durable polyethylene pipe.', aiHint: 'pipe roll' },
];

export default function ProductCatalogPage() {
  // State for search and filter would be added here
  // For now, just displaying all sample products

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Product Catalog</h1>
          <p className="text-muted-foreground">
            Browse and manage available agricultural products.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 w-full sm:w-[300px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Placeholder categories, would be dynamic */}
                <DropdownMenuCheckboxItem checked>Irrigation Systems</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Soil Amendments</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Tools</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Pumps</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Piping</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {sampleProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sampleProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden flex flex-col">
                  <div className="relative w-full h-48">
                    <Image 
                      src={product.imageUrl} 
                      alt={product.name} 
                      layout="fill" 
                      objectFit="cover"
                      data-ai-hint={product.aiHint}
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold leading-tight">{product.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">{product.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                    <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
                  </CardContent>
                  <CardContent className="pt-0">
                    <Button variant="outline" className="w-full">View Details</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-md">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters, or add new products.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
