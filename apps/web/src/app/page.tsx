import Link from 'next/link';
import { ArrowRight, BookOpen, GitFork, Brain, Users, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm font-medium">
            <Zap className="mr-2 h-4 w-4 text-primary" />
            AI-Powered Learning Platform
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            The GitHub
            <br />
            <span className="text-primary">for Learning</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Create AI-generated courses from any source, fork and improve community content, 
            chat with an AI tutor grounded in course material. Learn together, build together.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="px-8">
              <Link href="/register">
                Start Learning Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/courses">Explore Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold mb-4">Everything you need to learn smarter</h2>
          <p className="text-center text-muted-foreground mb-16">Generate, fork, collaborate, and master any topic</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border p-6 hover:shadow-md transition-shadow">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold mb-16">Create a course in seconds</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                  {i + 1}
                </div>
                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link href="/register">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-bold">LearnHub</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 LearnHub. Built for the community.</p>
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  { icon: Brain, title: 'AI Course Generation', description: 'Generate full courses from a prompt, PDF, URL, or GitHub repo. AI creates chapters, lessons, and quizzes.' },
  { icon: GitFork, title: 'Fork & Collaborate', description: 'Fork any public course, improve it, and publish your version. Track version history like a git repo.' },
  { icon: BookOpen, title: 'Interactive Learning', description: 'Read lessons, take quizzes, track progress, and earn completions across all your courses.' },
  { icon: Brain, title: 'AI Tutor (RAG)', description: 'Chat with an AI tutor that only knows your course content. Get cited answers grounded in lessons.' },
  { icon: Users, title: 'Community', description: 'Like, bookmark, and share courses. Build your creator profile and discover top educators.' },
  { icon: Star, title: 'Progress Tracking', description: 'Dashboard with completion stats, quiz scores, and streaks to keep you motivated.' },
];

const steps = [
  { title: 'Choose a source', description: 'Enter a prompt, paste a URL, upload a PDF, or link a GitHub repo.' },
  { title: 'AI generates course', description: 'Our AI creates a complete course with chapters, lessons, and quizzes in seconds.' },
  { title: 'Publish & share', description: 'Publish your course with a public URL. Others can fork, learn, and improve it.' },
];

const stats = [
  { value: '10K+', label: 'Courses created' },
  { value: '50K+', label: 'Learners' },
  { value: '100K+', label: 'Lessons completed' },
  { value: '5K+', label: 'Forks made' },
];
