import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Edit3, Trash2, Droplet, Sun, Wind, Tractor } from 'lucide-react'; // Relevant icons
import { Badge } from "@/components/ui/badge";

// Sample blog post data structure
interface BlogPost {
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

const sampleBlogPosts: BlogPost[] = [
  { id: '1', title: 'Efficient Drip Irrigation Techniques for Arid Climates', slug: 'efficient-drip-irrigation', excerpt: 'Discover the best practices for setting up and maintaining drip irrigation systems in water-scarce regions...', imageUrl: 'https://picsum.photos/seed/blog-drip/400/250', publishDate: '2024-07-20', category: 'Irrigation Tips', author: 'Jane Doe', aiHint: 'irrigation field', icon: Droplet },
  { id: '2', title: 'Maximizing Crop Yield with Smart Sprinkler Systems', slug: 'smart-sprinklers-crop-yield', excerpt: 'Learn how modern sprinkler technology can help you optimize water usage and boost your farm\'s output.', imageUrl: 'https://picsum.photos/seed/blog-sprinkler/400/250', publishDate: '2024-07-15', category: 'Technology', author: 'John Smith', aiHint: 'sprinkler crop', icon: Tractor },
  { id: '3', title: 'The Importance of Soil Moisture Monitoring', slug: 'soil-moisture-monitoring', excerpt: 'Understand why monitoring soil moisture is crucial for healthy plant growth and water conservation.', imageUrl: 'https://picsum.photos/seed/blog-soil/400/250', publishDate: '2024-07-10', category: 'Best Practices', author: 'Alice Green', aiHint: 'soil agriculture', icon: Sun },
  { id: '4', title: 'Water Conservation Strategies for Modern Farming', slug: 'water-conservation-farming', excerpt: 'Explore innovative strategies that help farms save water without compromising on crop quality.', imageUrl: 'https://picsum.photos/seed/blog-water/400/250', publishDate: '2024-07-05', category: 'Sustainability', author: 'Bob White', aiHint: 'water farm', icon: Wind },
];

export default function BlogManagementPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Blog Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and publish articles about agricultural irrigation.
          </p>
        </div>
        <Button asChild>
          <Link href="/blog/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Post
          </Link>
        </Button>
      </header>

      {sampleBlogPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleBlogPosts.map((post) => (
            <Card key={post.id} className="flex flex-col overflow-hidden group">
              <div className="relative w-full h-48">
                <Image 
                  src={post.imageUrl} 
                  alt={post.title} 
                  layout="fill" 
                  objectFit="cover"
                  data-ai-hint={post.aiHint}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                   <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                    <post.icon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    {post.category}
                   </Badge>
                </div>
              </div>
              <CardHeader className="pb-3">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">{post.title}</CardTitle>
                </Link>
                <CardDescription className="text-xs text-muted-foreground">
                  By {post.author} on {post.publishDate}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
              </CardContent>
              <CardContent className="pt-0 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/blog/edit/${post.slug}`}>
                    <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90">
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground">No blog posts yet</h3>
            <p className="text-muted-foreground mb-4">Start by creating your first article.</p>
            <Button asChild>
              <Link href="/blog/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Post
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
