import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Filter, Download, Edit, Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons"; // Using a generic icon for actions

// Sample proforma data structure
interface Proforma {
  id: string;
  proformaNumber: string;
  clientName: string;
  date: string;
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
}

const sampleProformas: Proforma[] = [
  { id: '1', proformaNumber: 'PF2024-001', clientName: 'Green Valley Farms', date: '2024-07-15', totalAmount: 1250.75, status: 'Sent' },
  { id: '2', proformaNumber: 'PF2024-002', clientName: 'Sunrise Agro', date: '2024-07-18', totalAmount: 875.00, status: 'Draft' },
  { id: '3', proformaNumber: 'PF2024-003', clientName: 'Riverbend Orchards', date: '2024-06-20', totalAmount: 2100.00, status: 'Paid' },
  { id: '4', proformaNumber: 'PF2024-004', clientName: 'Highland Growers', date: '2024-05-10', totalAmount: 550.20, status: 'Overdue' },
];

const getStatusBadgeVariant = (status: Proforma['status']) => {
  switch (status) {
    case 'Paid': return 'default'; // Using primary color for Paid as it's a positive outcome
    case 'Sent': return 'secondary';
    case 'Draft': return 'outline';
    case 'Overdue': return 'destructive';
    default: return 'outline';
  }
};

export default function ProformasPage() {
  // State for search and filter would be added here

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Proformas</h1>
          <p className="text-muted-foreground">
            Create, manage, and track your proforma invoices.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Proforma
        </Button>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search proformas..."
                className="pl-8 w-full sm:w-[300px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>All</DropdownMenuItem>
                <DropdownMenuItem>Draft</DropdownMenuItem>
                <DropdownMenuItem>Sent</DropdownMenuItem>
                <DropdownMenuItem>Paid</DropdownMenuItem>
                <DropdownMenuItem>Overdue</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {sampleProformas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proforma #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleProformas.map((proforma) => (
                  <TableRow key={proforma.id}>
                    <TableCell className="font-medium">{proforma.proformaNumber}</TableCell>
                    <TableCell>{proforma.clientName}</TableCell>
                    <TableCell>{proforma.date}</TableCell>
                    <TableCell className="text-right">${proforma.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(proforma.status)}>{proforma.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <DotsHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive hover:text-destructive-foreground focus:text-destructive-foreground focus:bg-destructive/90">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-md">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">No proformas found</h3>
              <p className="text-muted-foreground">Create your first proforma to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
