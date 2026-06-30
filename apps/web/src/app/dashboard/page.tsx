'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { BookOpen, CheckCircle, Trophy, Brain, Plus, ArrowRight, Clock } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, Progress, Skeleton, Badge } from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { progressApi, coursesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { formatDate, truncate } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login');
  }, []);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: progressApi.dashboard,
  });

  const { data: myCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: coursesApi.mine,
  });

  const { data: myProgress } = useQuery({
    queryKey: ['my-progress'],
    queryFn: progressApi.mine,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your learning.</p>
          </div>
          <Button asChild>
            <Link href="/courses/create"><Plus className="mr-2 h-4 w-4" />New Course</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          ) : (
            [
              { label: 'Enrolled Courses', value: stats?.enrolledCourses ?? 0, icon: BookOpen, color: 'text-blue-500' },
              { label: 'Completed', value: stats?.completedCourses ?? 0, icon: CheckCircle, color: 'text-green-500' },
              { label: 'Lessons Done', value: stats?.totalLessonsCompleted ?? 0, icon: Brain, color: 'text-purple-500' },
              { label: 'Quizzes Passed', value: stats?.quizzesPassed ?? 0, icon: Trophy, color: 'text-yellow-500' },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* In Progress */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
            {myProgress?.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center">
                  <BookOpen className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">No courses in progress yet</p>
                  <Button asChild><Link href="/courses">Explore Courses</Link></Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myProgress?.slice(0, 5).map((p: any) => (
                  <Card key={p.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{p.course.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {p.completedLessons}/{p.totalLessons} lessons
                          </p>
                          <Progress value={p.percentage} className="mt-3" />
                          <p className="text-xs text-muted-foreground mt-1">{Math.round(p.percentage)}% complete</p>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/courses/${p.courseId}`}>Continue <ArrowRight className="ml-1 h-3 w-3" /></Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* My Created Courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">My Courses</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/courses/mine">View all</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {coursesLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
              ) : myCourses?.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">No courses created yet</p>
                    <Button size="sm" asChild>
                      <Link href="/courses/create"><Plus className="mr-2 h-3 w-3" />Create</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myCourses?.slice(0, 5).map((c: any) => (
                  <Link key={c.id} href={`/courses/${c.id}/edit`}>
                    <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{c.title}</p>
                            <p className="text-xs text-muted-foreground">{c.chapters?.length ?? 0} chapters</p>
                          </div>
                          <Badge variant={c.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-xs ml-2 shrink-0">
                            {c.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/courses/create"><Plus className="mr-2 h-4 w-4" />Create New Course</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
