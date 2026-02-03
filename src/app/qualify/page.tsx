"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { profileApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Brain, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

type QualificationStep = "loading" | "question" | "explanation" | "rejected" | "complete";

const DSA_OPTIONS = [
  { value: "10", label: "Less than 10", qualifies: false },
  { value: "30", label: "10 - 30", qualifies: false },
  { value: "50", label: "30 - 50", qualifies: false },
  { value: "100", label: "50 - 100", qualifies: true },
  { value: "200", label: "100 - 200", qualifies: true },
  { value: "300", label: "200+", qualifies: true },
];

export default function QualifyPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState<QualificationStep>("loading");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login?redirect=/qualify");
      return;
    }

    // Check if already qualified
    const checkQualificationStatus = async () => {
      try {
        const response = await profileApi.checkQualification();
        if (response.isQualified) {
          router.push("/practice");
        } else if (!response.needsQualification) {
          // Already submitted but didn't qualify
          setStep("rejected");
        } else {
          setStep("question");
        }
      } catch {
        // Profile doesn't exist yet, show question
        setStep("question");
      }
    };

    checkQualificationStatus();
  }, [user, authLoading, router]);

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
    const option = DSA_OPTIONS.find((o) => o.value === value);
    if (option && !option.qualifies) {
      setStep("rejected");
    }
  };

  const handleContinue = () => {
    if (!selectedOption) return;
    const option = DSA_OPTIONS.find((o) => o.value === selectedOption);
    if (option?.qualifies) {
      setStep("explanation");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const problemCount = parseInt(selectedOption, 10);
      await profileApi.qualify(problemCount);
      setStep("complete");
      // Redirect after a short delay
      setTimeout(() => router.push("/practice"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit qualification");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "loading" || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {step === "question" && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Before We Begin</CardTitle>
              <CardDescription>
                Help us understand your experience level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  How many DSA problems have you solved?
                </Label>
                <RadioGroup
                  value={selectedOption}
                  onValueChange={handleOptionSelect}
                  className="space-y-3"
                >
                  {DSA_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedOption === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label
                        htmlFor={option.value}
                        className="flex-1 cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Button
                className="w-full"
                onClick={handleContinue}
                disabled={!selectedOption || !DSA_OPTIONS.find((o) => o.value === selectedOption)?.qualifies}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "rejected" && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <CardTitle className="text-2xl">Build Your Foundation First</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>This Tool Requires Experience</AlertTitle>
                <AlertDescription>
                  Pattern Blindness is designed for engineers who have already solved
                  at least 50 DSA problems. This is intentional.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Why the requirement?</strong>
                </p>
                <p>
                  This is not a coding practice site. You will code elsewhere.
                  This platform trains how you <em>choose</em> solutions - a skill that
                  only matters after you have a foundation of patterns to choose from.
                </p>
                <p>
                  Without enough experience, the exercises here will feel abstract
                  and unhelpful. We want you to succeed, and that means being honest
                  about readiness.
                </p>
                <p>
                  <strong className="text-foreground">What to do instead:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Practice on LeetCode, HackerRank, or similar platforms</li>
                  <li>Focus on understanding core patterns (Two Pointers, Sliding Window, etc.)</li>
                  <li>Come back when you&apos;ve solved 50+ problems</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("question")}
                >
                  Go Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => window.open("https://leetcode.com/problemset/", "_blank")}
                >
                  Go to LeetCode
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "explanation" && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">What This Tool Does</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-primary/20 bg-primary/5">
                <CheckCircle className="h-4 w-4 text-primary" />
                <AlertTitle>This Is Not a Coding Site</AlertTitle>
                <AlertDescription>
                  You will code on LeetCode. This platform trains your
                  pattern recognition and decision-making.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-medium mb-2">How it works:</p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>You&apos;ll see a problem statement</li>
                    <li>Before coding, you commit to an approach</li>
                    <li>You code on LeetCode (external)</li>
                    <li>You return and report what happened</li>
                    <li>We reveal why approaches fail (or succeed)</li>
                  </ol>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-medium mb-2">What you&apos;ll gain:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <XCircle className="h-4 w-4 inline mr-2 text-red-500" />
                      See why your instinctive choices often fail
                    </li>
                    <li>
                      <CheckCircle className="h-4 w-4 inline mr-2 text-green-500" />
                      Build reliable pattern recognition
                    </li>
                    <li>
                      <Brain className="h-4 w-4 inline mr-2 text-primary" />
                      Track your thinking patterns over time
                    </li>
                  </ul>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("question")}
                  disabled={isSubmitting}
                >
                  Go Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    "I Understand, Let's Begin"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "complete" && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle className="text-2xl">You&apos;re In!</CardTitle>
              <CardDescription>Redirecting to practice...</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
