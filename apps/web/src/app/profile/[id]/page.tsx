'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Github, Globe, Twitter, MapPin, BookOpen, Heart, GitFork } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, Avatar, AvatarFallback, AvatarImage, Badge, Skeleton } from '@/components/ui/index';
import { usersApi } from '@/lib/api';
import { formatDate, truncate } from '@/lib/utils';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => usersApi.profile(id),
  });

  if (isLoading) return (
    <div className="min-h-screen bg-background"><Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Skeleton className="h-48 rounded-xl mb-6" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <div className="md:col-span-2 space-y-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
        </div>
      </main>
    </div>
  );

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Profile header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                <AvatarFallback className="text-2xl">{profile.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                {profile.profile?.headline && <p className="text-muted-foreground mt-1">{profile.profile.headline}</p>}
                {profile.profile?.bio && <p className="mt-3 text-sm max-w-lg">{profile.profile.bio}</p>}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {profile.profile?.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{profile.profile.location}</span>
                  )}
                  {profile.profile?.website && (
                    <a href={profile.profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground">
                      <Globe className="h-4 w-4" />{profile.profile.website}
                    </a>
                  )}
                  {profile.profile?.github && (
                    <a href={`https://github.com/${profile.profile.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground">
                      <Github className="h-4 w-4" />@{profile.profile.github}
                    </a>
                  )}
                  {profile.profile?.twitter && (
                    <a href={`https://twitter.com/${profile.profile.twitter}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground">
                      <Twitter className="h-4 w-4" />@{profile.profile.twitter}
                    </a>
                  )}
                </div>
                <div className="mt-4 flex gap-4 text-sm">
                  <span className="font-semibold">{profile._count?.courses ?? 0}</span>
                  <span className="text-muted-foreground">courses published</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses */}
        <h2 className="text-xl font-semibold mb-4">Published Courses</h2>
        {profile.courses?.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No published courses yet</CardContent></Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {profile.courses?.map((course: any) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">{course.difficulty}</Badge>
                      {course.isForked && <Badge variant="outline" className="text-xs"><GitFork className="mr-1 h-3 w-3" />Fork</Badge>}
                    </div>
                    <h3 className="font-semibold mb-1">{truncate(course.title, 55)}</h3>
                    {course.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{course.description}</p>}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{course._count?.likes ?? 0}</span>
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{course.chapters?.length ?? 0} chapters</span>
                      <span className="ml-auto">{formatDate(course.publishedAt || course.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
