import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingBag, FileText, BookOpen, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const featureCards = [
    {
      title: "Product Catalog",
      description: "Explore and manage your agricultural products.",
      icon: ShoppingBag,
      href: "/products",
      cta: "View Products",
    },
    {
      title: "Proformas",
      description: "Create and track proforma invoices for your clients.",
      icon: FileText,
      href: "/proformas",
      cta: "Manage Proformas",
    },
    {
      title: "Blog Management",
      description: "Publish and manage articles on agricultural irrigation.",
      icon: BookOpen,
      href: "/blog",
      cta: "Go to Blog",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to AgriConnect Pro</h1>
        <p className="text-muted-foreground">
          Your central hub for managing agricultural products, proformas, and blog content.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featureCards.map((card) => (
          <Card key={card.title} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">{card.title}</CardTitle>
              <card.icon className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{card.description}</CardDescription>
            </CardContent>
            <CardContent className="pt-0">
              <Button asChild variant="outline" className="w-full group">
                <Link href={card.href}>
                  {card.cta}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder for future dashboard elements like charts or recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
          <CardDescription>Overview of recent proformas and blog posts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-md">
            <p className="text-muted-foreground">Activity feed coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
