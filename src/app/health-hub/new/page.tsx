"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Heart, Brain, Utensils, ShieldCheck, Image as ImageIcon, Barbell } from 'lucide-react';
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";


const healthArticleSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(150, "Title is too long."),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens."),
  category: z.string().min(1, "Category is required."),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters.").max(300, "Excerpt is too long."),
  content: z.string().min(50, "Content must be at least 50 characters."),
  imageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  author: z.string().min(2, "Author name is required."),
});

type HealthArticleFormValues = z.infer<typeof healthArticleSchema>;

const categories = [
  { value: "fitness", label: "Fitness", icon: Barbell }, // Replaced Droplet with Barbell
  { value: "nutrition", label: "Nutrition", icon: Utensils }, // Replaced Tractor with Utensils
  { value: "wellness", label: "Wellness", icon: Heart }, // Replaced Sun with Heart
  { value: "mental-health", label: "Mental Health", icon: Brain }, // Replaced Wind with Brain
];

export default function NewHealthArticlePage() {
  const { toast } = useToast();
  const form = useForm<HealthArticleFormValues>({
    resolver: zodResolver(healthArticleSchema),
    defaultValues: {
      title: "",
      slug: "",
      category: "",
      excerpt: "",
      content: "",
      imageUrl: "",
      author: "",
    },
  });

  function onSubmit(data: HealthArticleFormValues) {
    console.log(data);
    toast({
      title: "Health Article Submitted!",
      description: `"${data.title}" has been successfully submitted. (This is a demo, no data was actually saved).`,
    });
    // Here you would typically send data to your backend
    // For now, we just log it and reset the form
    form.reset();
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/health-hub">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Health Hub</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Health Article</h1>
          <p className="text-muted-foreground">
            Fill in the details below to publish a new article.
          </p>
        </div>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
              <CardDescription>Provide the main information for your health article.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter article title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., my-awesome-article" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be part of the URL. Use lowercase letters, numbers, and hyphens.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <cat.icon className="h-4 w-4 text-muted-foreground" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="Author's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Image URL (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Link to an image that will be featured with your article.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A short summary of your article (max 300 characters)"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your full article here. Markdown is supported."
                        className="min-h-[300px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Use Markdown for formatting (e.g., # Heading, *italic*, **bold**).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/health-hub">Cancel</Link>
            </Button>
            <Button type="submit">Publish Article</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
