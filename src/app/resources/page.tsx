"use client";

import Link from "next/link";
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

const resources: Resource[] = [
  // Comprehensive Courses
  {
    title: "NeetCode Roadmap",
    description:
      "Structured learning path with 150 problems organized by pattern. Includes video explanations for every problem and a clear progression from easy to hard.",
    url: "https://neetcode.io/roadmap",
    type: "course",
    tags: ["Patterns", "LeetCode", "Video"],
    difficulty: "beginner",
    free: true,
  },
  {
    title: "LeetCode Explore Cards",
    description:
      "Official LeetCode learning paths covering arrays, linked lists, trees, graphs, dynamic programming, and more. Interactive problems with hints and solutions.",
    url: "https://leetcode.com/explore/",
    type: "course",
    tags: ["Interactive", "Structured", "All Topics"],
    difficulty: "beginner",
    free: true,
  },
  {
    title: "Tech Interview Handbook",
    description:
      "Comprehensive guide covering algorithms, data structures, and interview preparation. Includes curated problem lists and study plans.",
    url: "https://www.techinterviewhandbook.org/",
    type: "article",
    tags: ["Interview Prep", "Study Plan", "Cheatsheets"],
    difficulty: "intermediate",
    free: true,
  },

  // Algorithm Visualizations
  {
    title: "VisuAlgo",
    description:
      "Visualize algorithms and data structures through animation. Covers sorting, searching, trees, graphs, and more with step-by-step execution.",
    url: "https://visualgo.net/",
    type: "course",
    tags: ["Visualization", "Interactive", "Animations"],
    difficulty: "beginner",
    free: true,
  },
  {
    title: "Algorithm Visualizer",
    description:
      "Open-source platform to visualize algorithms from code. See how sorting, pathfinding, and other algorithms work in real-time.",
    url: "https://algorithm-visualizer.org/",
    type: "practice",
    tags: ["Visualization", "Open Source", "Interactive"],
    difficulty: "beginner",
    free: true,
  },
  {
    title: "Data Structure Visualizations",
    description:
      "University of San Francisco's interactive data structure animations. Covers BSTs, AVL trees, heaps, hash tables, and graph algorithms.",
    url: "https://www.cs.usfca.edu/~galles/visualization/Algorithms.html",
    type: "course",
    tags: ["Visualization", "Academic", "Trees"],
    difficulty: "beginner",
    free: true,
  },

  // Deep Dives & Articles
  {
    title: "CP-Algorithms",
    description:
      "Comprehensive collection of algorithms for competitive programming. Detailed explanations with implementations for advanced topics like segment trees, FFT, and string algorithms.",
    url: "https://cp-algorithms.com/",
    type: "article",
    tags: ["Advanced", "Competitive Programming", "Reference"],
    difficulty: "advanced",
    free: true,
  },
  {
    title: "GeeksforGeeks - DSA Tutorial",
    description:
      "Extensive tutorial covering all data structures and algorithms with multiple programming language implementations and practice problems.",
    url: "https://www.geeksforgeeks.org/learn-data-structures-and-algorithms-dsa-tutorial/",
    type: "article",
    tags: ["Comprehensive", "Multi-language", "Practice"],
    difficulty: "beginner",
    free: true,
  },
  {
    title: "The Algorithm Design Manual",
    description:
      "Steven Skiena's classic textbook companion site with lecture videos, slides, and the full war stories from the book.",
    url: "https://www.algorist.com/",
    type: "book",
    tags: ["Academic", "Video Lectures", "Classic"],
    difficulty: "intermediate",
    free: true,
  },

  // GitHub Repositories
  {
    title: "The Algorithms",
    description:
      "Open source collection of algorithm implementations in multiple languages. Great for learning how algorithms are implemented in your preferred language.",
    url: "https://github.com/TheAlgorithms",
    type: "repository",
    tags: ["Open Source", "Multi-language", "Implementations"],
    difficulty: "intermediate",
    free: true,
  },
  {
    title: "javascript-algorithms",
    description:
      "Algorithms and data structures implemented in JavaScript with explanations and links to further readings. Includes complexity analysis.",
    url: "https://github.com/trekhleb/javascript-algorithms",
    type: "repository",
    tags: ["JavaScript", "Explanations", "Well-documented"],
    difficulty: "intermediate",
    free: true,
  },
  {
    title: "Coding Interview University",
    description:
      "Complete computer science study plan to become a software engineer. Covers all fundamental CS topics with curated resources.",
    url: "https://github.com/jwasham/coding-interview-university",
    type: "repository",
    tags: ["Study Plan", "Comprehensive", "Career"],
    difficulty: "beginner",
    free: true,
  },

  // Video Resources
  {
    title: "MIT OpenCourseWare - Introduction to Algorithms",
    description:
      "Full course lectures from MIT covering algorithm design and analysis. Taught by Erik Demaine and other renowned professors.",
    url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
    type: "video",
    tags: ["MIT", "Academic", "Comprehensive"],
    difficulty: "intermediate",
    free: true,
  },
  {
    title: "Abdul Bari - Algorithms Playlist",
    description:
      "Clear and intuitive algorithm explanations with visual aids. Covers sorting, searching, graph algorithms, and dynamic programming.",
    url: "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O",
    type: "video",
    tags: ["YouTube", "Visual", "Clear Explanations"],
    difficulty: "beginner",
    free: true,
  },
  {
    title: "William Fiset - Data Structures",
    description:
      "In-depth data structure tutorials with clean visualizations and code implementations. Excellent for understanding internals.",
    url: "https://www.youtube.com/playlist?list=PLDV1Zeh2NRsB6SWUrDFW2RmDotAfPbeHu",
    type: "video",
    tags: ["YouTube", "Deep Dive", "Visualizations"],
    difficulty: "intermediate",
    free: true,
  },

  // Practice Platforms
  {
    title: "LeetCode",
    description:
      "The most popular platform for coding interview preparation. Thousands of problems with company tags and discussion forums.",
    url: "https://leetcode.com/",
    type: "practice",
    tags: ["Interview Prep", "Company Problems", "Discussion"],
    difficulty: "intermediate",
    free: true,
  },
  {
    title: "HackerRank - Interview Preparation Kit",
    description:
      "Curated problem sets organized by topic. Good for structured practice with increasing difficulty levels.",
    url: "https://www.hackerrank.com/interview/interview-preparation-kit",
    type: "practice",
    tags: ["Structured", "Certificates", "Company Hiring"],
    difficulty: "intermediate",
    free: true,
  },
  {
    title: "Codeforces",
    description:
      "Competitive programming platform with regular contests. Great for improving problem-solving speed and tackling harder problems.",
    url: "https://codeforces.com/",
    type: "practice",
    tags: ["Competitive", "Contests", "Advanced"],
    difficulty: "advanced",
    free: true,
  },

  // Cheatsheets & Quick References
  {
    title: "Big-O Cheat Sheet",
    description:
      "Quick reference for time and space complexity of common data structures and algorithms. Essential for interview preparation.",
    url: "https://www.bigocheatsheet.com/",
    type: "article",
    tags: ["Cheatsheet", "Complexity", "Reference"],
    difficulty: "beginner",
    free: true,
  },
  {
    title: "14 Patterns to Ace Any Coding Interview",
    description:
      "Article explaining the most common algorithmic patterns with examples. Great starting point for pattern recognition.",
    url: "https://hackernoon.com/14-patterns-to-ace-any-coding-interview-question-c5bb3357f6ed",
    type: "article",
    tags: ["Patterns", "Interview", "Overview"],
    difficulty: "intermediate",
    free: true,
  },

  // Additional Video Resources
  {
    title: "Back To Back SWE",
    description:
      "High-quality whiteboard explanations of algorithms and data structures. Known for clear, step-by-step breakdowns of complex problems.",
    url: "https://www.youtube.com/@BackToBackSWE",
    type: "video",
    tags: ["YouTube", "Whiteboard", "Interview"],
    difficulty: "intermediate",
    free: true,
  },
  {
    title: "Tushar Roy - Coding Made Simple",
    description:
      "Dynamic programming and graph algorithm specialist. Detailed explanations with hand-drawn visualizations.",
    url: "https://www.youtube.com/@tusaborern",
    type: "video",
    tags: ["YouTube", "DP", "Graphs"],
    difficulty: "intermediate",
    free: true,
  },
  {
    title: "Errichto - Competitive Programming",
    description:
      "World-class competitive programmer sharing problem-solving techniques. Great for learning advanced algorithms and contest strategies.",
    url: "https://www.youtube.com/@Errichto",
    type: "video",
    tags: ["YouTube", "Competitive", "Advanced"],
    difficulty: "advanced",
    free: true,
  },
  {
    title: "Clément Mihailescu - AlgoExpert",
    description:
      "Former Google/Facebook engineer explaining interview problems. Focus on thinking process and communication during coding interviews.",
    url: "https://www.youtube.com/@cloementmihailescu",
    type: "video",
    tags: ["YouTube", "Interview", "FAANG"],
    difficulty: "intermediate",
    free: true,
  },

  // More GitHub Repositories
  {
    title: "LeetCode Patterns",
    description:
      "Curated list of LeetCode questions grouped by pattern with links and solutions. Great companion for pattern-based learning.",
    url: "https://github.com/seanprashad/leetcode-patterns",
    type: "repository",
    tags: ["Patterns", "LeetCode", "Curated List"],
    difficulty: "intermediate",
    free: true,
  },
  {
    title: "Blind 75 Problems",
    description:
      "The famous Blind 75 list organized by topic. Essential problems that cover all major patterns tested in tech interviews.",
    url: "https://github.com/aalaibi/Blind-75",
    type: "repository",
    tags: ["Curated", "Interview", "Essential"],
    difficulty: "intermediate",
    free: true,
  },
  {
    title: "Awesome Competitive Programming",
    description:
      "Comprehensive list of competitive programming resources, tutorials, and problem sets for improving algorithmic skills.",
    url: "https://github.com/lnishan/awesome-competitive-programming",
    type: "repository",
    tags: ["Awesome List", "Resources", "Competitive"],
    difficulty: "intermediate",
    free: true,
  },
  {
    title: "Python Patterns",
    description:
      "Collection of design patterns and idioms in Python. Great for understanding how patterns apply to real-world software.",
    url: "https://github.com/faif/python-patterns",
    type: "repository",
    tags: ["Python", "Design Patterns", "Idioms"],
    difficulty: "intermediate",
    free: true,
  },

  // Interactive Learning Tools
  {
    title: "Pathfinding Visualizer",
    description:
      "Interactive visualization of pathfinding algorithms like Dijkstra, A*, BFS, and DFS. See how graph traversal algorithms work.",
    url: "https://clementmihailescu.github.io/Pathfinding-Visualizer/",
    type: "practice",
    tags: ["Pathfinding", "Graphs", "Visual"],
    difficulty: "beginner",
    free: true,
  },
  {
    title: "Sorting Visualizer",
    description:
      "Watch sorting algorithms in action. Compare bubble sort, merge sort, quick sort, and more with real-time visualizations.",
    url: "https://www.sortvisualizer.com/",
    type: "practice",
    tags: ["Sorting", "Visual", "Compare"],
    difficulty: "beginner",
    free: true,
  },
  {
    title: "Regex101",
    description:
      "Test and debug regular expressions with real-time explanations. Essential tool for string manipulation problems.",
    url: "https://regex101.com/",
    type: "practice",
    tags: ["Regex", "Strings", "Tool"],
    difficulty: "beginner",
    free: true,
  },

  // Additional Articles & Guides
  {
    title: "LeetCode Discussion - Problem Patterns",
    description:
      "Community-curated discussion on common problem patterns and their solutions. Learn from experienced problem solvers.",
    url: "https://leetcode.com/discuss/general-discussion/458695/Dynamic-Programming-Patterns",
    type: "article",
    tags: ["DP Patterns", "Community", "Discussion"],
    difficulty: "intermediate",
    free: true,
  },
  {
    title: "Sliding Window Pattern Guide",
    description:
      "In-depth guide to the sliding window technique with multiple examples and variations. Master this essential pattern.",
    url: "https://leetcode.com/discuss/study-guide/1773891/Sliding-Window-Technique-and-its-Types",
    type: "article",
    tags: ["Sliding Window", "Pattern", "Guide"],
    difficulty: "intermediate",
    free: true,
  },
  {
    title: "Binary Search Template",
    description:
      "Comprehensive guide to binary search variations and when to use each. Includes templates for common scenarios.",
    url: "https://leetcode.com/discuss/study-guide/786126/Python-Powerful-Ultimate-Binary-Search-Template",
    type: "article",
    tags: ["Binary Search", "Template", "Comprehensive"],
    difficulty: "intermediate",
    free: true,
  },
  {
    title: "Graph Algorithms Study Guide",
    description:
      "Complete guide to graph traversal, shortest paths, and connectivity problems. Essential for graph-based interviews.",
    url: "https://leetcode.com/discuss/study-guide/1326900/Graph-algorithms-study-guide",
    type: "article",
    tags: ["Graphs", "Study Guide", "Comprehensive"],
    difficulty: "intermediate",
    free: true,
  },
  {
    title: "Recursion & Backtracking Guide",
    description:
      "Master recursive thinking with this comprehensive guide covering backtracking patterns and techniques.",
    url: "https://leetcode.com/discuss/study-guide/1405817/Backtracking-algorithm-General-Approach",
    type: "article",
    tags: ["Backtracking", "Recursion", "Pattern"],
    difficulty: "intermediate",
    free: true,
  },

  // Free Books & Academic Resources
  {
    title: "Open Data Structures",
    description:
      "Free textbook covering array-based lists, linked lists, skip lists, hash tables, trees, heaps, and graphs with implementations.",
    url: "https://opendatastructures.org/",
    type: "book",
    tags: ["Free Book", "Academic", "Implementations"],
    difficulty: "intermediate",
    free: true,
  },
  {
    title: "Algorithms by Jeff Erickson",
    description:
      "Free algorithms textbook from UIUC professor. Covers recursion, dynamic programming, graph algorithms with rigorous proofs.",
    url: "https://jeffe.cs.illinois.edu/teaching/algorithms/",
    type: "book",
    tags: ["Free Book", "Academic", "Comprehensive"],
    difficulty: "advanced",
    free: true,
  },
  {
    title: "Stanford CS161 - Algorithm Design",
    description:
      "Stanford's algorithm design course materials with lecture notes, problem sets, and video lectures freely available.",
    url: "https://web.stanford.edu/class/cs161/",
    type: "course",
    tags: ["Stanford", "Academic", "Lecture Notes"],
    difficulty: "intermediate",
    free: true,
  },

  // More Practice Platforms
  {
    title: "AtCoder",
    description:
      "Japanese competitive programming platform with high-quality problems. Regular contests with well-designed problems.",
    url: "https://atcoder.jp/",
    type: "practice",
    tags: ["Competitive", "Quality Problems", "Contests"],
    difficulty: "intermediate",
    free: true,
  },
  {
    title: "CSES Problem Set",
    description:
      "Curated set of 300 competitive programming problems organized by topic. Progressive difficulty within each section.",
    url: "https://cses.fi/problemset/",
    type: "practice",
    tags: ["Curated", "Progressive", "High Quality"],
    difficulty: "intermediate",
    free: true,
  },
  {
    title: "Project Euler",
    description:
      "Mathematical/computational problems that require algorithmic solutions. Great for learning number theory and mathematical algorithms.",
    url: "https://projecteuler.net/",
    type: "practice",
    tags: ["Math", "Algorithms", "Challenging"],
    difficulty: "advanced",
    free: true,
  },
  {
    title: "Exercism",
    description:
      "Free coding practice with mentorship. Learn data structures in 70+ languages with community code reviews.",
    url: "https://exercism.org/",
    type: "practice",
    tags: ["Mentorship", "Multi-language", "Community"],
    difficulty: "beginner",
    free: true,
  },
];

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
