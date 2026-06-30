'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { GitFork, Heart, BookOpen, Clock, Search } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, Badge, Avatar, AvatarFallback, AvatarImage, Skeleton } from '@/components/ui/index';
import { Input } from '@/components/ui/index';
import { coursesApi } from '@/lib/api';
import { useState } from 'react';
import { truncate } from '@/lib/utils';

export default function CoursesPage() {
  const [query, setQuery] = useState('');
  const { data: courses, isLoading } = useQuery({ queryKey: ['courses'], queryFn: coursesApi.list });

  const filtered = courses?.filter((c: any) =>
    !query || c.title.toLowerCase().includes(query.toLowerCase()) || c.description?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Courses</h1>
          <p className="text-muted-foreground">Discover AI-generated courses created by the community</p>
        </div>

        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered?.map((course: any) => <CourseCard key={course.id} course={course} />)}
            {filtered?.length === 0 && (
              <div className="col-span-3 text-center py-20 text-muted-foreground">
                No courses found. Be the first to{' '}
                <Link href="/courses/create" className="text-primary hover:underline">create one!</Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  const difficultyColor: Record<string, string> = {
    BEGINNER: 'bg-green-100 text-green-700',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
    ADVANCED: 'bg-red-100 text-red-700',
  };

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer">
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-t-xl flex items-center justify-center">
          {course.coverImageUrl ? (
            <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover rounded-t-xl" />
          ) : (
            <BookOpen className="h-12 w-12 text-primary/50" />
          )}
        </div>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold leading-snug">{truncate(course.title, 60)}</h3>
            {course.isForked && <GitFork className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />}
          </div>
          {course.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[course.difficulty] || ''}`}>
              {course.difficulty}
            </span>
            {course.tags?.slice(0, 2).map((ct: any) => (
              <Badge key={ct.tagId} variant="secondary" className="text-xs">{ct.tag?.name}</Badge>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={course.creator?.avatarUrl} />
                <AvatarFallback className="text-xs">{course.creator?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{course.creator?.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{course._count?.likes ?? 0}</span>
              <span className="flex items-center gap-1"><GitFork className="h-3 w-3" />{course._count?.forkRecords ?? 0}</span>
              {course.estimatedHours && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.estimatedHours}h</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
