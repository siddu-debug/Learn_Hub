'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, Filter, GitFork, Heart, Clock, BookOpen } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Input, Badge, Card, CardContent, Avatar, AvatarFallback, AvatarImage, Skeleton } from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { searchApi } from '@/lib/api';
import { truncate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedDiff, setSelectedDiff] = useState('');
  const [searched, setSearched] = useState(false);

  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: searchApi.tags });
  const { data: results, isLoading, refetch } = useQuery({
    queryKey: ['search', query, selectedTag, selectedDiff],
    queryFn: () => searchApi.search(query, { tag: selectedTag || undefined, difficulty: selectedDiff || undefined }),
    enabled: searched,
  });

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSearched(true);
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Search Courses</h1>

          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, topic, skill..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground self-center">Difficulty:</span>
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  onClick={() => { setSelectedDiff(selectedDiff === d ? '' : d); setSearched(true); }}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                    selectedDiff === d ? 'bg-primary text-primary-foreground border-primary' : 'hover:border-primary',
                  )}
                >
                  {d}
                </button>
              ))}
            </div>

            {tags && tags.length > 0 && (
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-sm text-muted-foreground">Tags:</span>
                {tags.slice(0, 10).map((tag: any) => (
                  <button
                    key={tag.id}
                    onClick={() => { setSelectedTag(selectedTag === tag.slug ? '' : tag.slug); setSearched(true); }}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                      selectedTag === tag.slug ? 'bg-primary text-primary-foreground border-primary' : 'hover:border-primary',
                    )}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        )}

        {searched && !isLoading && results && (
          <>
            <p className="text-sm text-muted-foreground mb-4">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
            {results.length === 0 ? (
              <div className="text-center py-20">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground text-sm mb-4">Try different keywords or filters</p>
                <Button asChild variant="outline"><Link href="/courses/generate">Generate a course</Link></Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((course: any) => (
                  <Link key={course.id} href={`/courses/${course.id}`}>
                    <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer">
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-t-xl flex items-center justify-center">
                        {course.coverImageUrl
                          ? <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover rounded-t-xl" />
                          : <BookOpen className="h-10 w-10 text-primary/40" />}
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold mb-1">{truncate(course.title, 60)}</h3>
                        {course.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <Badge variant="secondary" className="text-xs">{course.difficulty}</Badge>
                          {course.tags?.slice(0, 2).map((ct: any) => (
                            <Badge key={ct.tagId} variant="outline" className="text-xs">{ct.tag?.name}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={course.creator?.avatarUrl} />
                              <AvatarFallback className="text-xs">{course.creator?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{course.creator?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{course._count?.likes ?? 0}</span>
                            <span className="flex items-center gap-1"><GitFork className="h-3 w-3" />{course._count?.forkRecords ?? 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {!searched && (
          <div className="text-center py-20">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Enter a search term or select filters above</p>
          </div>
        )}
      </main>
    </div>
  );
}
