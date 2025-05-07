"use client"; // Ensure client component for state management later

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Filter, Download, Edit, Trash2, ClipboardList } from 'lucide-react'; // Added ClipboardList
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons"; 
import React from "react"; // Import React for useState later

// Sample activity log data structure
interface ActivityLog {
  id: string;
  activityName: string; // e.g., Morning Run, Gym Session
  date: string;
  duration: string; // e.g., "45 mins"
  caloriesBurned?: number;
  notes?: string;
  status?: 'Completed' | 'Planned'; // Optional status
}

const sampleActivityLogs: ActivityLog[] = [
  { id: '1', activityName: 'Morning Run', date: '2024-07-28', duration: '30 mins', caloriesBurned: 350, status: 'Completed', notes: 'Felt energetic' },
  { id: '2', activityName: 'Gym - Upper Body', date: '2024-07-27', duration: '60 mins', caloriesBurned: 450, status: 'Completed' },
  { id: '3', activityName: 'Yoga Session', date: '2024-07-26', duration: '45 mins', caloriesBurned: 200, status: 'Completed', notes: 'Focused on flexibility' },
  { id: '4', activityName: 'Evening Walk', date: '2024-07-25', duration: '40 mins', caloriesBurned: 180, status: 'Planned' },
];

const getStatusBadgeVariant = (status?: ActivityLog['status']) => {
  if (!status) return 'outline';
  switch (status) {
    case 'Completed': return 'default'; 
    case 'Planned': return 'secondary';
    default: return 'outline';
  }
};

export default function ActivityLogPage() {
  // State for search and filter would be added here

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Activity Log</h1>
          <p className="text-muted-foreground">
            Log, manage, and track your fitness activities.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Log New Activity
        </Button>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search activities..."
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
                <DropdownMenuItem>Completed</DropdownMenuItem>
                <DropdownMenuItem>Planned</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {sampleActivityLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Calories</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleActivityLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.activityName}</TableCell>
                    <TableCell>{log.date}</TableCell>
                    <TableCell>{log.duration}</TableCell>
                    <TableCell className="text-right">{log.caloriesBurned ? `${log.caloriesBurned} kcal` : '-'}</TableCell>
                    <TableCell>
                      {log.status && <Badge variant={getStatusBadgeVariant(log.status)}>{log.status}</Badge>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-xs">{log.notes || '-'}</TableCell>
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
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">No activities logged yet</h3>
              <p className="text-muted-foreground">Log your first activity to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
