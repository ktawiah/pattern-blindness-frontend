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

type QualificationStep = "loading" | "question" | "explanation" | "complete";

const DSA_OPTIONS = [
  { value: "10", label: "Less than 10", description: "Just getting started" },
  { value: "30", label: "10 - 30", description: "Building foundation" },
  { value: "50", label: "30 - 50", description: "Familiar with basics" },
  { value: "100", label: "50 - 100", description: "Solid foundation" },
  { value: "200", label: "100 - 200", description: "Experienced" },
  { value: "300", label: "200+", description: "Very experienced" },
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

    // Check if profile exists
    const checkProfileStatus = async () => {
      try {
        const response = await profileApi.checkQualification();
        if (!response.needsQualification) {
          // Profile already exists, redirect to practice
          router.push("/practice");
        } else {
          // New user, show optional experience question
          setStep("question");
        }
      } catch {
        // Profile doesn't exist yet, show question
        setStep("question");
      }
    };

    checkProfileStatus();
  }, [user, authLoading, router]);

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
  };

  const handleContinue = () => {
    if (!selectedOption) return;
    setStep("explanation");
  };

  const handleSkip = () => {
    // Skip directly to practice
    router.push("/practice");
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
              <CardTitle className="text-2xl">Welcome!</CardTitle>
              <CardDescription>
                Help us understand your experience level (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-blue-500/20 bg-blue-50 dark:bg-blue-950/20">
                <Brain className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
                  This tool works best if you're familiar with basic algorithmic patterns.
                  All experience levels are welcome to try!
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Label className="text-base font-medium">
                  How many DSA problems have you solved? (optional)
                </Label>
                <RadioGroup
                  value={selectedOption}
                  onValueChange={handleOptionSelect}
                  className="space-y-3"
                >
                  {DSA_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center justify-between space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedOption === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label
                          htmlFor={option.value}
                          className="cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleSkip}
                >
                  Skip
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleContinue}
                  disabled={!selectedOption}
                >
                  Continue
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
