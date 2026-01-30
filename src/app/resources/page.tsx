"use client";

import Link from "next/link";
import ResourceData from "@/data/resources.json";
import { Header } from "@/components/shared/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  BookOpen,
  Video,
  Code,
  GraduationCap,
  FileText,
  Github,
} from "lucide-react";

interface Resource {
  title: string;
  description: string;
  url: string;
  type: "course" | "article" | "video" | "repository" | "book" | "practice";
  tags: string[];
  difficulty?: "beginner" | "intermediate" | "advanced";
  free: boolean;
}

const resources: Resource[] = ResourceData as Resource[];

const typeIcons: Record<string, React.ReactNode> = {
  course: <GraduationCap className="h-4 w-4" />,
  article: <FileText className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  repository: <Github className="h-4 w-4" />,
  book: <BookOpen className="h-4 w-4" />,
  practice: <Code className="h-4 w-4" />,
};

const difficultyColors: Record<string, string> = {
  beginner:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  intermediate:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function ResourcesPage() {
  const categories = [
    { key: "course", label: "Courses & Tutorials", icon: GraduationCap },
    { key: "video", label: "Video Resources", icon: Video },
    { key: "article", label: "Articles & Guides", icon: FileText },
    { key: "repository", label: "GitHub Repositories", icon: Github },
    { key: "practice", label: "Practice Platforms", icon: Code },
    { key: "book", label: "Books & References", icon: BookOpen },
  ];

  const groupedResources = categories.map((category) => ({
    ...category,
    resources: resources.filter((r) => r.type === category.key),
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Learning Resources</h1>
          <p className="text-muted-foreground max-w-2xl">
            Curated free resources to master data structures and algorithms.
            From beginner-friendly tutorials to advanced competitive programming
            material.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {resources.length} Resources
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            100% Free
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            All Skill Levels
          </Badge>
        </div>

        {/* Resources by Category */}
        <div className="space-y-10">
          {groupedResources
            .filter((g) => g.resources.length > 0)
            .map((group) => (
              <section key={group.key}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <group.icon className="h-5 w-5" />
                  {group.label}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.resources.map((resource) => (
                    <Card
                      key={resource.url}
                      className="h-full hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            {typeIcons[resource.type]}
                            {resource.title}
                          </CardTitle>
                          {resource.difficulty && (
                            <Badge
                              className={`text-xs shrink-0 ${difficultyColors[resource.difficulty]}`}
                            >
                              {resource.difficulty}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-3">
                          {resource.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {resource.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="w-full">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit Resource
                          </Button>
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
        </div>

        {/* Tips Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              How to Use These Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">1.</span>
                <span>
                  <strong className="text-foreground">Start with fundamentals:</strong> Use
                  VisuAlgo or LeetCode Explore cards to understand basic data
                  structures before jumping into problems.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">2.</span>
                <span>
                  <strong className="text-foreground">Learn patterns:</strong> Focus on the
                  NeetCode Roadmap or "14 Patterns" article to recognize common
                  problem-solving approaches.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">3.</span>
                <span>
                  <strong className="text-foreground">Practice consistently:</strong> Solve 1-2
                  problems daily on LeetCode or HackerRank. Quality over quantity.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">4.</span>
                <span>
                  <strong className="text-foreground">Review and reflect:</strong> After solving
                  a problem, read others' solutions. Understanding multiple
                  approaches deepens your knowledge.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">5.</span>
                <span>
                  <strong className="text-foreground">Use this app:</strong> Practice pattern
                  recognition in our{" "}
                  <Link href="/practice" className="text-primary hover:underline">
                    Practice section
                  </Link>{" "}
                  to build intuition for identifying the right approach.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
