import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/shared";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 py-24 text-center">
          <Badge variant="secondary" className="mb-4">
            For engineers with 1-3 YOE
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto">
            Stop freezing when you see a new coding problem
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Build pattern recognition instincts through forced independent
            thinking, wrong approach reveals, and confidence calibration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/practice">
              <Button size="lg" className="w-full sm:w-auto">
                Start Practicing
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                How It Works
              </Button>
            </Link>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">The Problem</h2>
              <blockquote className="text-lg italic text-muted-foreground border-l-4 border-primary pl-4 text-left">
                &quot;I know all the patterns. I&apos;ve studied Two Pointers,
                Sliding Window, BFS/DFS... but when I see a new problem in an
                interview, my mind goes blank. I can&apos;t tell which pattern
                applies.&quot;
              </blockquote>
              <p className="mt-6 text-muted-foreground">
                Sound familiar? You&apos;re not alone. This is{" "}
                <strong>Pattern Blindness</strong> — the gap between knowing
                patterns and recognizing them in the wild.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              How Pattern Blindness Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Step 1 */}
              <Card className="relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span aria-hidden="true">⏱️</span>
                    Cold Start Commitment
                  </CardTitle>
                  <CardDescription>
                    90 seconds of forced thinking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    See a problem, start a timer. No hints, no patterns
                    revealed. You must write down your initial thoughts before
                    seeing anything else. This builds the muscle memory for
                    thinking independently.
                  </p>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span aria-hidden="true">❌</span>
                    Wrong-But-Reasonable Reveal
                  </CardTitle>
                  <CardDescription>Learn from common mistakes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    After thinking, we show you the common wrong approaches
                    other engineers try. Understanding why they fail helps you
                    avoid them and recognize the right pattern faster.
                  </p>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span aria-hidden="true">📊</span>
                    Confidence Calibration
                  </CardTitle>
                  <CardDescription>
                    Track your intuition accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Rate your confidence before seeing the solution. Over time,
                    we track whether your confidence matches your correctness.
                    This helps you trust (or question) your instincts.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Patterns Preview */}
        <section className="bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">
              Patterns We Cover
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Master the most common interview patterns through targeted
              practice
            </p>
            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {[
                { name: "Two Pointers", emoji: "👆👆" },
                { name: "Sliding Window", emoji: "🪟" },
                { name: "Binary Search", emoji: "🔍" },
                { name: "BFS/DFS", emoji: "🌳" },
                { name: "Dynamic Programming", emoji: "📈" },
                { name: "Backtracking", emoji: "↩️" },
                { name: "Heap/Priority Queue", emoji: "📚" },
                { name: "Graph Algorithms", emoji: "🕸️" },
                { name: "Linked List", emoji: "🔗" },
                { name: "Stack/Queue", emoji: "📦" },
              ].map((pattern) => (
                <Badge
                  key={pattern.name}
                  variant="secondary"
                  className="text-sm py-2 px-4"
                >
                  <span aria-hidden="true" className="mr-1">
                    {pattern.emoji}
                  </span>
                  {pattern.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to break through?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Start practicing today and build the pattern recognition skills
              that will help you ace your next interview.
            </p>
            <Link href="/practice">
              <Button size="lg">Start Your First Problem</Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built for engineers who want to stop freezing in interviews.</p>
        </div>
      </footer>
    </div>
  );
}
