"use client"; // Ensure client component for state management later

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { PlusCircle, Search, Filter, Dumbbell } from 'lucide-react'; // Added Dumbbell
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react"; // Import React for useState later

// Sample workout plan data structure
interface WorkoutPlan {
  id: string;
  name: string;
  category: string; // e.g., Cardio, Strength, Flexibility
  duration?: string; // e.g., "30 mins", "1 hour"
  difficulty?: string; // e.g., Beginner, Intermediate, Advanced
  imageUrl: string;
  description: string;
  aiHint: string;
}

const sampleWorkoutPlans: WorkoutPlan[] = [
  { id: '1', name: 'Full Body HIIT', category: 'Cardio', duration: '30 mins', difficulty: 'Intermediate', imageUrl: 'https://picsum.photos/seed/hiitworkout/400/300', description: 'High-intensity interval training for a full body workout.', aiHint: 'workout fitness' },
  { id: '2', name: 'Strength Training Basics', category: 'Strength', duration: '45 mins', difficulty: 'Beginner', imageUrl: 'https://picsum.photos/seed/strengthbasics/400/300', description: 'Fundamental strength exercises to build muscle.', aiHint: 'gym weights' },
  { id: '3', name: 'Morning Yoga Flow', category: 'Flexibility', duration: '20 mins', difficulty: 'All Levels', imageUrl: 'https://picsum.photos/seed/yogaflow/400/300', description: 'Gentle yoga sequence to start your day.', aiHint: 'yoga meditation' },
  { id: '4', name: 'Advanced Core Crusher', category: 'Strength', duration: '25 mins', difficulty: 'Advanced', imageUrl: 'https://picsum.photos/seed/coreworkout/400/300', description: 'Intense core workout for chiseled abs.', aiHint: 'abs exercise' },
  { id: '5', name: 'Endurance Run Prep', category: 'Cardio', duration: '60 mins', difficulty: 'Intermediate', imageUrl: 'https://picsum.photos/seed/running/400/300', description: 'Prepare for long-distance running with this plan.', aiHint: 'runner track' },
  { id: '6', name: 'Active Recovery Stretch', category: 'Flexibility', duration: '15 mins', difficulty: 'All Levels', imageUrl: 'https://picsum.photos/seed/stretching/400/300', description: 'Light stretching to aid muscle recovery.', aiHint: 'stretch flexibility' },
];

export default function WorkoutPlansPage() {
  // State for search and filter would be added here
  // For now, just displaying all sample plans

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Workout Plans</h1>
          <p className="text-muted-foreground">
            Explore and manage available workout plans.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Plan
        </Button>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search plans..."
                className="pl-8 w-full sm:w-[300px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter by Type
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>Cardio</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Strength</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Flexibility</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>All Levels</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {sampleWorkoutPlans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sampleWorkoutPlans.map((plan) => (
                <Card key={plan.id} className="overflow-hidden flex flex-col">
                  <div className="relative w-full h-48">
                    <Image 
                      src={plan.imageUrl} 
                      alt={plan.name} 
                      fill // Changed from layout="fill" objectFit="cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover"
                      data-ai-hint={plan.aiHint}
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold leading-tight">{plan.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {plan.category} {plan.duration && `• ${plan.duration}`} {plan.difficulty && `• ${plan.difficulty}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{plan.description}</p>
                  </CardContent>
                  <CardContent className="pt-0">
                    <Button variant="outline" className="w-full">View Details</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-md">
              <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">No workout plans found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters, or add new plans.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
