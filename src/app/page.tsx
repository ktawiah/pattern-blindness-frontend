"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useAuth } from "@/lib/auth/auth-context";
import {
  Brain,
  Target,
  Clock,
  XCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  BarChart3,
  RefreshCw,
} from "lucide-react";

// Animated counter hook with stable start function and memoized return
function useAnimatedCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const start = useCallback(() => setHasStarted(true), []);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    let animationId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };
    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [end, duration, hasStarted]);

  return useMemo(() => ({ count, start }), [count, start]);
}

// Typing animation component
function TypingText({ texts, className }: { texts: string[]; className?: string }) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (charIndex > 0) {
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % texts.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts]);

  return (
    <span className={className}>
      {texts[textIndex].slice(0, charIndex)}
      <span className="animate-pulse">|</span>
    </span>
  );
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const problemsCounter = useAnimatedCounter(2700);
  const patternsCounter = useAnimatedCounter(15);
  const successCounter = useAnimatedCounter(87);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/patterns");
    }
  }, [isAuthenticated, isLoading, router]);

  // Start counters when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            problemsCounter.start();
            patternsCounter.start();
            successCounter.start();
          }
        });
      },
      { threshold: 0.5 }
    );

    const statsSection = document.getElementById("stats-section");
    if (statsSection) observer.observe(statsSection);

    return () => observer.disconnect();
  }, [problemsCounter, patternsCounter, successCounter]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <Brain className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header />

      <main>
        {/* Hero Section - Bold and Attention-Grabbing */}
        <section className="relative py-20 md:py-32">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gray-100 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/30 bg-primary/5">
                <Zap className="h-3 w-3 mr-1 text-primary" />
                Built for experienced by engineers
                <Zap className="h-3 w-3 mr-1 text-primary" />
              </Badge>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                You know the patterns.
                <br />
                <span className="bg-gradient-to-r from-black via-gray-200 to-black bg-clip-text text-transparent">
                  Why can&apos;t you see them?
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto">
                Train your brain to instantly recognize{" "}
                <TypingText
                  texts={["Two Pointers", "Sliding Window", "Binary Search", "Dynamic Programming", "BFS/DFS"]}
                  className="text-primary font-semibold"
                />
              </p>

              <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
                Stop freezing in interviews. Build pattern recognition through
                deliberate practice and forced independent thinking.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/practice">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 group">
                    Start Training
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
                    See How It Works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* The Pain Point - Emotional Connection */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <Badge variant="destructive" className="mb-4">
                    <XCircle className="h-3 w-3 mr-1" />
                    The Problem
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    You&apos;ve solved 100+ problems.
                    <br />
                    <span className="text-muted-foreground">Why do you still freeze?</span>
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p className="flex items-start gap-3">
                      <span className="text-destructive mt-1">&#10005;</span>
                      You see a new problem and your mind goes blank
                    </p>
                    <p className="flex items-start gap-3">
                      <span className="text-destructive mt-1">&#10005;</span>
                      You try an approach, realize it&apos;s wrong, panic
                    </p>
                    <p className="flex items-start gap-3">
                      <span className="text-destructive mt-1">&#10005;</span>
                      You know the pattern after seeing the solution - too late
                    </p>
                    <p className="flex items-start gap-3">
                      <span className="text-destructive mt-1">&#10005;</span>
                      You&apos;ve memorized solutions but can&apos;t transfer the skill
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <Card className="border-2 border-dashed border-muted-foreground/30 bg-muted/20 bg-gradient-to-b from-gray-50 to-gray-white">
                    <CardContent className="p-8">
                      <div className="space-y-4 font-mono text-sm">
                        <p className="text-muted-foreground"># Interview moment</p>
                        <p><span className="text-primary">interviewer</span>: &quot;Given an array...&quot;</p>
                        <p><span className="text-yellow-500">you</span>: <span className="text-muted-foreground italic">(Two Pointers? Sliding Window? Hash Map? ...)</span></p>
                        <p><span className="text-yellow-500">you</span>: &quot;I&apos;ll try brute force first...&quot;</p>
                        <p><span className="text-destructive">brain</span>: <span className="animate-pulse">█</span></p>
                        <p className="text-muted-foreground italic"># 45 minutes later</p>
                        <p><span className="text-primary">interviewer</span>: &quot;It was Sliding Window.&quot;</p>
                        <p><span className="text-yellow-500">you</span>: &quot;Of course it was.&quot;</p>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="absolute -bottom-4 -right-4 bg-background border rounded-lg px-4 py-2 shadow-lg">
                    <p className="text-sm font-medium">Sound familiar?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Solution - What Makes Us Different */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <Badge className="mb-4 bg-green-500/10 text-green-600 hover:bg-green-500/10">
                <CheckCircle className="h-3 w-3 mr-1" />
                The Solution
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                This is NOT another LeetCode grind
              </h2>
              <p className="text-xl text-muted-foreground">
                You&apos;ll code on LeetCode. Here, you train the skill that LeetCode can&apos;t teach:
                <br />
                <strong className="text-foreground">Recognizing which pattern to use before you start coding.</strong>
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="bg-gradient-to-b from-gray-50 to-gray-white">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-black" />
                  </div>
                  <CardTitle>Forced Thinking</CardTitle>
                  <CardDescription>No hints until you commit</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    90-second cold start. You MUST write your approach before
                    seeing any analysis. This builds real problem-solving instincts,
                    not pattern-matching from memory.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-b from-gray-50 to-gray-white">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-black" />
                  </div>
                  <CardTitle>Wrong Approach Reveal</CardTitle>
                  <CardDescription>Learn why mistakes happen</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We show you the common wrong approaches FIRST - and why they
                    fail. Understanding the traps helps you avoid them and
                    recognize the right pattern faster.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-b from-gray-50 to-gray-white">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-black" />
                  </div>
                  <CardTitle>Confidence Calibration</CardTitle>
                  <CardDescription>Trust your instincts again</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Track whether your confidence matches your correctness.
                    Discover your blind spots - patterns you avoid, patterns
                    you default to, and patterns that have decayed.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works - Step by Step */}
        <section id="how-it-works" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  The Training Loop
                </h2>
                <p className="text-xl text-muted-foreground">
                  A deliberate practice system designed to rewire your pattern recognition
                </p>
              </div>

              <div className="relative">
                {/* Connection line */}
                {/* <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-black via-black-500 to-primary -translate-y-1/2" /> */}

                <div className="grid md:grid-cols-4 gap-8">
                  {[
                    {
                      step: 1,
                      icon: Clock,
                      title: "Cold Start",
                      desc: "See a problem. 90 seconds. No hints. Write your approach.",
                      color: "black",
                    },
                    {
                      step: 2,
                      icon: XCircle,
                      title: "Wrong Reveals",
                      desc: "See why common approaches fail. Learn the traps.",
                      color: "black",
                    },
                    {
                      step: 3,
                      icon: Sparkles,
                      title: "Code Externally",
                      desc: "Go to LeetCode. Test your hypothesis. Return with results.",
                      color: "black",
                    },
                    {
                      step: 4,
                      icon: RefreshCw,
                      title: "Reflect & Repeat",
                      desc: "Report what happened. See the analysis. Close the loop.",
                      color: "black",
                    },
                  ].map((item) => (
                    <div key={item.step} className="relative">
                      <Card className="bg-gradient-to-b from-gray-50 to-gray-white h-full hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                          <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2 mx-auto relative z-100 border-4 border-background`}>
                            <item.icon className={`h-5 w-5`} />
                          </div>
                          <Badge variant="outline" className="w-fit mx-auto mb-2">
                            Step {item.step}
                          </Badge>
                          <CardTitle className="text-center text-lg">
                            {item.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground text-center">
                            {item.desc}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats-section" className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-4xl md:text-5xl font-bold text-primary">
                    {problemsCounter.count}+
                  </p>
                  <p className="text-muted-foreground mt-2">LeetCode Problems</p>
                </div>
                <div>
                  <p className="text-4xl md:text-5xl font-bold text-primary">
                    {patternsCounter.count}
                  </p>
                  <p className="text-muted-foreground mt-2">Core Patterns</p>
                </div>
                <div>
                  <p className="text-4xl md:text-5xl font-bold text-primary">
                    {successCounter.count}%
                  </p>
                  <p className="text-muted-foreground mt-2">Pattern Coverage</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Patterns Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Patterns You&apos;ll Master
              </h2>
              <p className="text-muted-foreground">
                Focus on the patterns that actually appear in interviews
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {[
                { name: "Two Pointers", icon: "👆👆", level: "fundamental" },
                { name: "Sliding Window", icon: "🪟", level: "fundamental" },
                { name: "Binary Search", icon: "🔍", level: "fundamental" },
                { name: "BFS", icon: "🌊", level: "fundamental" },
                { name: "DFS", icon: "🌲", level: "fundamental" },
                { name: "Dynamic Programming", icon: "📈", level: "advanced" },
                { name: "Backtracking", icon: "↩️", level: "advanced" },
                { name: "Heap / Priority Queue", icon: "⛰️", level: "intermediate" },
                { name: "Graph Algorithms", icon: "🕸️", level: "advanced" },
                { name: "Linked List", icon: "🔗", level: "fundamental" },
                { name: "Stack / Queue", icon: "📦", level: "fundamental" },
                { name: "Tree Traversal", icon: "🌳", level: "fundamental" },
                { name: "Greedy", icon: "🎯", level: "intermediate" },
                { name: "Union Find", icon: "🔀", level: "advanced" },
                { name: "Trie", icon: "📝", level: "intermediate" },
              ].map((pattern) => (
                <Badge
                  key={pattern.name}
                  variant={pattern.level === "advanced" ? "default" : pattern.level === "intermediate" ? "secondary" : "outline"}
                  className="text-sm py-2 px-4 cursor-default hover:scale-105 transition-transform"
                >
                  <span aria-hidden="true" className="mr-2">
                    {pattern.icon}
                  </span>
                  {pattern.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-background" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gray-100 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to stop freezing?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
              Join engineers who are building real pattern recognition skills,
              not just memorizing solutions.
            </p>
            <Link href="/practice">
              <Button size="lg" className="text-lg px-10 py-6 group">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Your First Problem
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-6">
              Free to use. No credit card required.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-semibold">Pattern Blindness</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for engineers who want to stop freezing in interviews.
            </p>
            <div className="flex gap-4">
              <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Resources
              </Link>
              <Link href="/practice" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Practice
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
