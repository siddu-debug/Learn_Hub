'use client';
import Link from 'next/link';
import { Sparkles, PenLine, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/index';

export default function CreateCoursePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">Create a New Course</h1>
          <p className="text-muted-foreground">Choose how you want to build your course</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/courses/generate">
            <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-2 hover:border-primary">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">Generate with AI</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Let AI create a complete course from a prompt, PDF, URL, or GitHub repo. Chapters, lessons, and quizzes included.
                </p>
                <span className="inline-flex items-center text-primary font-medium text-sm">
                  Get started <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/courses/new">
            <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-2 hover:border-primary">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                  <PenLine className="h-7 w-7 text-foreground" />
                </div>
                <h2 className="text-xl font-bold mb-2">Build Manually</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Create your course from scratch with full control over the structure, content, and quizzes.
                </p>
                <span className="inline-flex items-center text-primary font-medium text-sm">
                  Build manually <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
