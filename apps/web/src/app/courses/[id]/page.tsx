'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, GitFork, Bookmark, Clock, BookOpen, Play, ChevronRight, Share2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, Badge, Avatar, AvatarFallback, AvatarImage, Progress, Separator, Skeleton } from '@/components/ui/index';
import { coursesApi, progressApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { formatDate } from '@/lib/utils';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: course, isLoading } = useQuery({ queryKey: ['course', id], queryFn: () => coursesApi.get(id) });
  const { data: progressData } = useQuery({
    queryKey: ['course-progress', id],
    queryFn: () => progressApi.course(id),
    enabled: isAuthenticated(),
  });

  const forkMutation = useMutation({
    mutationFn: () => coursesApi.fork(id),
    onSuccess: (forked) => { toast.success('Course forked!'); router.push(`/courses/${forked.id}/edit`); },
    onError: () => toast.error('Fork failed'),
  });

  const likeMutation = useMutation({
    mutationFn: () => coursesApi.like(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course', id] }),
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => coursesApi.bookmark(id),
    onSuccess: () => toast.success('Bookmark updated!'),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-10">
          <Skeleton className="h-64 rounded-xl mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!course) return null;

  const isOwner = user?.id === course.creatorId;
  const progress = progressData?.progress;
  const completedIds = new Set(progressData?.completedLessonIds || []);
  const totalLessons = course.chapters?.reduce((s: number, c: any) => s + c.lessons.length, 0) || 0;
  const firstLessonId = course.chapters?.[0]?.lessons?.[0]?.id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-b">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-wrap gap-2 mb-4">
            {course.isForked && <Badge variant="outline"><GitFork className="mr-1 h-3 w-3" />Forked</Badge>}
            <Badge variant="secondary">{course.difficulty}</Badge>
            {course.tags?.map((ct: any) => <Badge key={ct.tagId} variant="outline">{ct.tag.name}</Badge>)}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 max-w-3xl">{course.title}</h1>
          {course.description && <p className="text-muted-foreground text-lg mb-6 max-w-2xl">{course.description}</p>}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={course.creator?.avatarUrl} />
                <AvatarFallback>{course.creator?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Link href={`/users/${course.creator?.id}`} className="hover:text-foreground font-medium">{course.creator?.name}</Link>
            </div>
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{totalLessons} lessons</span>
            {course.estimatedHours && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.estimatedHours} hours</span>}
            <span className="flex items-center gap-1"><Heart className="h-4 w-4" />{course._count?.likes ?? 0}</span>
            {course.publishedAt && <span>Published {formatDate(course.publishedAt)}</span>}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Curriculum */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Course Content</h2>
            <div className="space-y-3">
              {course.chapters?.map((chapter: any) => (
                <div key={chapter.id} className="border rounded-xl overflow-hidden">
                  <div className="bg-muted/50 px-5 py-3">
                    <h3 className="font-medium">{chapter.title}</h3>
                    {chapter.description && <p className="text-sm text-muted-foreground mt-0.5">{chapter.description}</p>}
                  </div>
                  <div className="divide-y">
                    {chapter.lessons?.map((lesson: any) => {
                      const done = completedIds.has(lesson.id);
                      return (
                        <Link
                          key={lesson.id}
                          href={isAuthenticated() ? `/courses/${id}/learn?lesson=${lesson.id}` : '/login'}
                          className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${done ? 'bg-green-500 text-white' : 'bg-muted border'}`}>
                              {done ? '✓' : <Play className="h-3 w-3" />}
                            </div>
                            <span className="text-sm">{lesson.title}</span>
                          </div>
                          {lesson.duration && <span className="text-xs text-muted-foreground">{lesson.duration}m</span>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                {progress && (
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">Your progress</span>
                      <span className="text-muted-foreground">{Math.round(progress.percentage)}%</span>
                    </div>
                    <Progress value={progress.percentage} />
                    <p className="text-xs text-muted-foreground mt-1">{progress.completedLessons}/{progress.totalLessons} lessons done</p>
                  </div>
                )}

                {firstLessonId && (
                  <Button className="w-full" asChild>
                    <Link href={`/courses/${id}/learn?lesson=${firstLessonId}`}>
                      <Play className="mr-2 h-4 w-4" />
                      {progress ? 'Continue Learning' : 'Start Learning'}
                    </Link>
                  </Button>
                )}

                {isAuthenticated() && (
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/courses/${id}/tutor`}>
                        <span className="mr-2">🤖</span>Ask AI Tutor
                      </Link>
                    </Button>

                    <Separator />

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="flex-1" onClick={() => likeMutation.mutate()}>
                        <Heart className="mr-1 h-4 w-4" />{course._count?.likes ?? 0}
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1" onClick={() => isAuthenticated() ? bookmarkMutation.mutate() : router.push('/login')}>
                        <Bookmark className="mr-1 h-4 w-4" />Save
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}>
                        <Share2 className="mr-1 h-4 w-4" />Share
                      </Button>
                    </div>

                    {!isOwner && (
                      <Button variant="outline" className="w-full" onClick={() => forkMutation.mutate()} disabled={forkMutation.isPending}>
                        <GitFork className="mr-2 h-4 w-4" />
                        {forkMutation.isPending ? 'Forking...' : 'Fork Course'}
                      </Button>
                    )}

                    {isOwner && (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/courses/${id}/edit`}>Edit Course</Link>
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Chapters</span><span>{course.chapters?.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Lessons</span><span>{totalLessons}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Difficulty</span><span>{course.difficulty}</span></div>
                {course.estimatedHours && <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span>{course.estimatedHours}h</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Forks</span><span>{course._count?.forkRecords ?? 0}</span></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
