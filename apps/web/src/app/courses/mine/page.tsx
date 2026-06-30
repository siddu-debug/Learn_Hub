'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Edit, Eye, GitFork } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, Badge, Skeleton } from '@/components/ui/index';
import { coursesApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function MyCoursesPage() {
  const { data: courses, isLoading } = useQuery({ queryKey: ['my-courses'], queryFn: coursesApi.mine });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Courses</h1>
          <Button asChild><Link href="/courses/create"><Plus className="mr-2 h-4 w-4" />New Course</Link></Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : courses?.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">You haven't created any courses yet</p>
            <Button asChild><Link href="/courses/create">Create Your First Course</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            {courses?.map((course: any) => (
              <Card key={course.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{course.title}</h3>
                        {course.isForked && <Badge variant="outline" className="text-xs shrink-0"><GitFork className="mr-1 h-3 w-3" />Fork</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Badge variant={course.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-xs">{course.status}</Badge>
                        <span>{course.chapters?.length ?? 0} chapters</span>
                        <span>{course.difficulty}</span>
                        <span>Updated {formatDate(course.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/courses/${course.id}`}><Eye className="mr-1 h-3.5 w-3.5" />View</Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/courses/${course.id}/edit`}><Edit className="mr-1 h-3.5 w-3.5" />Edit</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
