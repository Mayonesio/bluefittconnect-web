"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Heart, Brain, Utensils, ShieldCheck } from 'lucide-react'; // Relevant health icons
import { Badge } from "@/components/ui/badge";

// Sample health article data structure
interface HealthArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  publishDate: string;
  category: string;
  author: string;
  aiHint: string;
  icon: React.ElementType;
}

const sampleHealthArticles: HealthArticle[] = [
  { id: '1', title: 'Top 10 Benefits of Regular Cardiovascular Exercise', slug: 'cardio-benefits', excerpt: 'Discover how hitting your cardio goals can transform your health, from heart strength to mental clarity...', imageUrl: 'https://picsum.photos/seed/health-cardio/400/250', publishDate: '2024-07-28', category: 'Fitness', author: 'Dr. Fit', aiHint: 'running heart', icon: Heart },
  { id: '2', title: 'Mindful Eating: A Guide to Better Digestion and Weight Management', slug: 'mindful-eating-guide', excerpt: 'Learn the principles of mindful eating to improve your relationship with food and achieve your wellness goals.', imageUrl: 'https://picsum.photos/seed/health-eating/400/250', publishDate: '2024-07-25', category: 'Nutrition', author: 'Wellness Guru', aiHint: 'healthy food', icon: Utensils },
  { id: '3', title: 'The Importance of Sleep for Muscle Recovery and Growth', slug: 'sleep-muscle-recovery', excerpt: 'Understand why quality sleep is just as crucial as your workouts for building strength and recovering effectively.', imageUrl: 'https://picsum.photos/seed/health-sleep/400/250', publishDate: '2024-07-22', category: 'Wellness', author: 'Dr. Rest', aiHint: 'sleep bed', icon: Brain },
  { id: '4', title: 'Strength Training for Beginners: Getting Started Safely', slug: 'strength-training-beginners', excerpt: 'A comprehensive guide to starting strength training, focusing on proper form and injury prevention.', imageUrl: 'https://picsum.photos/seed/health-strength/400/250', publishDate: '2024-07-18', category: 'Fitness', author: 'Coach Strong', aiHint: 'gym workout', icon: ShieldCheck },
];

export default function HealthHubPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Health Hub</h1>
          <p className="text-muted-foreground">
            Explore articles on fitness, nutrition, and overall wellness.
          </p>
        </div>
        <Button asChild>
          {/* Link to a potential "create article" page if admin functionality is added later */}
          <Link href="/health-hub/new"> 
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Article
          </Link>
        </Button>
      </header>

      {sampleHealthArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleHealthArticles.map((article) => (
            <Card key={article.id} className="flex flex-col overflow-hidden group">
              <div className="relative w-full h-48">
                <Image 
                  src={article.imageUrl} 
                  alt={article.title} 
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={article.aiHint}
                />
                <div className="absolute top-2 right-2">
                   <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                    <article.icon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    {article.category}
                   </Badge>
                </div>
              </div>
              <CardHeader className="pb-3">
                <Link href={`/health-hub/${article.slug}`} className="hover:underline">
                  <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">{article.title}</CardTitle>
                </Link>
                <CardDescription className="text-xs text-muted-foreground">
                  By {article.author} on {article.publishDate}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>
              </CardContent>
              <CardContent className="pt-0 flex items-center justify-end gap-2">
                 <Button variant="outline" size="sm" asChild>
                  <Link href={`/health-hub/${article.slug}`}>
                    Read More
                  </Link>
                </Button>
                {/* Edit and Delete buttons can be re-added if admin functionality is implemented */}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground">No articles yet</h3>
            <p className="text-muted-foreground mb-4">Start by creating your first health article.</p>
            <Button asChild>
              <Link href="/health-hub/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Article
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
