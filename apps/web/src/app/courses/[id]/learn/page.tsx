'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CheckCircle, ChevronLeft, ChevronRight, BookOpen, Brain, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Progress, Badge, Skeleton } from '@/components/ui/index';
import { coursesApi, lessonsApi, progressApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function LearnPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const lessonId = searchParams.get('lesson');

  const { data: course, isLoading: courseLoading } = useQuery({ queryKey: ['course', id], queryFn: () => coursesApi.get(id) });
  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => lessonsApi.get(lessonId!),
    enabled: !!lessonId,
  });
  const { data: progressData } = useQuery({ queryKey: ['course-progress', id], queryFn: () => progressApi.course(id) });

  const completeMutation = useMutation({
    mutationFn: () => lessonsApi.complete(lessonId!),
    onSuccess: () => {
      toast.success('Lesson completed!');
      qc.invalidateQueries({ queryKey: ['course-progress', id] });
    },
  });

  const completedIds = new Set(progressData?.completedLessonIds || []);

  // Build flat lesson list for navigation
  const allLessons = course?.chapters?.flatMap((c: any) => c.lessons) || [];
  const currentIndex = allLessons.findIndex((l: any) => l.id === lessonId);
  const prevLesson = allLessons[currentIndex - 1];
  const nextLesson = allLessons[currentIndex + 1];

  const progress = progressData?.progress;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={cn('flex-shrink-0 border-r bg-muted/30 overflow-y-auto transition-all', sidebarOpen ? 'w-72' : 'w-0')}>
        {sidebarOpen && (
          <div className="p-4">
            <Link href={`/courses/${id}`} className="text-sm text-primary hover:underline flex items-center gap-1 mb-4">
              <ChevronLeft className="h-4 w-4" />Back to course
            </Link>
            <h2 className="font-semibold text-sm mb-1 truncate">{course?.title}</h2>
            {progress && (
              <div className="mb-4">
                <Progress value={progress.percentage} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">{Math.round(progress.percentage)}% complete</p>
              </div>
            )}
            <div className="space-y-2">
              {course?.chapters?.map((chapter: any) => (
                <div key={chapter.id}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 px-2">{chapter.title}</p>
                  {chapter.lessons?.map((l: any) => {
                    const done = completedIds.has(l.id);
                    const active = l.id === lessonId;
                    return (
                      <Link
                        key={l.id}
                        href={`/courses/${id}/learn?lesson=${l.id}`}
                        className={cn(
                          'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors',
                          active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                        )}
                      >
                        <div className={cn('h-4 w-4 rounded-full flex items-center justify-center shrink-0', done ? 'bg-green-500 text-white' : active ? 'bg-white/30' : 'bg-muted border')}>
                          {done && <span className="text-xs">✓</span>}
                        </div>
                        <span className="truncate">{l.title}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-6 py-3 flex items-center justify-between gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-muted">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex-1 min-w-0">
            {lesson && <h1 className="font-semibold truncate">{lesson.title}</h1>}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/courses/${id}/tutor`}>
                <Brain className="mr-1 h-4 w-4" />AI Tutor
              </Link>
            </Button>

            {lessonId && !completedIds.has(lessonId) && (
              <Button size="sm" onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}>
                <CheckCircle className="mr-1 h-4 w-4" />Mark Complete
              </Button>
            )}
            {lessonId && completedIds.has(lessonId) && (
              <Badge variant="default" className="bg-green-500">✓ Completed</Badge>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10">
          {lessonLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : lesson ? (
            <>
              <article className="prose prose-neutral dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content || ''}</ReactMarkdown>
              </article>

              {/* Quiz prompt */}
              {lesson.quizzes?.length > 0 && (
                <div className="mt-10 p-6 rounded-xl border-2 border-primary/20 bg-primary/5 text-center">
                  <Brain className="mx-auto h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Ready to test your knowledge?</h3>
                  <p className="text-sm text-muted-foreground mb-4">Take the quiz for this lesson</p>
                  <Button asChild>
                    <Link href={`/courses/${id}/quiz?quizId=${lesson.quizzes[0].id}`}>Start Quiz</Link>
                  </Button>
                </div>
              )}

              {/* Navigation */}
              <div className="mt-10 flex items-center justify-between">
                {prevLesson ? (
                  <Button variant="outline" asChild>
                    <Link href={`/courses/${id}/learn?lesson=${prevLesson.id}`}>
                      <ChevronLeft className="mr-1 h-4 w-4" />Previous
                    </Link>
                  </Button>
                ) : <div />}
                {nextLesson ? (
                  <Button asChild>
                    <Link href={`/courses/${id}/learn?lesson=${nextLesson.id}`}>
                      Next<ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="default" className="bg-green-600 hover:bg-green-700">
                    <Link href={`/courses/${id}`}><CheckCircle className="mr-2 h-4 w-4" />Finish Course</Link>
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select a lesson to begin</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
