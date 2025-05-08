import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SlidersHorizontal, Puzzle, Gauge, ArrowRight, Newspaper } from 'lucide-react';

export default function DashboardPage() {
  const featureCards = [
    {
      title: "Válvulas",
      description: "Explore nuestra gama de válvulas para optimizar su sistema de riego.",
      icon: SlidersHorizontal,
      href: "/productos?categoria=valvula", 
      cta: "Ver Válvulas",
    },
    {
      title: "Racores",
      description: "Conectores y accesorios esenciales para una instalación eficiente.",
      icon: Puzzle, 
      href: "/productos?categoria=racor",
      cta: "Ver Racores",
    },
    {
      title: "Caudalímetros",
      description: "Mida y controle el flujo de agua con precisión en sus sistemas.",
      icon: Gauge, 
      href: "/productos?categoria=caudalimetro",
      cta: "Ver Caudalímetros",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Bienvenido a Bluefitt Connect</h1>
        <p className="text-muted-foreground">
          Su plataforma central para soluciones de riego agrícola: válvulas, racores y caudalímetros.
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

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Últimas Noticias del Blog</CardTitle>
          <CardDescription>Manténgase informado sobre novedades y consejos en riego.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-md">
            <Newspaper className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-3">Contenido del blog próximamente...</p>
            <Button asChild variant="secondary">
              <Link href="/blog">
                Ir al Blog
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
