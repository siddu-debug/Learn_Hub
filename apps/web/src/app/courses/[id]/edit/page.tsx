'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { Plus, Save, Eye, GitFork, Trash2, ChevronLeft, GripVertical, BookOpen } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea, Card, CardContent, CardHeader, CardTitle, Badge, Separator } from '@/components/ui/index';
import { coursesApi, chaptersApi, lessonsApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const MDEditor = dynamic(() => import('@uiw/react-md-editor').then(m => m.default), { ssr: false });

export default function CourseEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [lessonContent, setLessonContent] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [savingLesson, setSavingLesson] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.get(id),
    onSuccess: (data: any) => {
      setCourseTitle(data.title);
      setCourseDesc(data.description || '');
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: (data: any) => coursesApi.update(id, data),
    onSuccess: () => { toast.success('Course saved!'); qc.invalidateQueries({ queryKey: ['course', id] }); setEditingTitle(false); },
  });

  const publishMutation = useMutation({
    mutationFn: () => coursesApi.publish(id),
    onSuccess: () => { toast.success('Course published!'); qc.invalidateQueries({ queryKey: ['course', id] }); },
  });

  const addChapterMutation = useMutation({
    mutationFn: () => chaptersApi.create(id, { title: 'New Chapter' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course', id] }),
  });

  const addLessonMutation = useMutation({
    mutationFn: (chapterId: string) => lessonsApi.create(chapterId, { title: 'New Lesson', content: '# New Lesson\n\nStart writing your lesson content here.' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course', id] }),
  });

  const selectLesson = (lesson: any) => {
    setActiveLesson(lesson);
    setLessonContent(lesson.content || '');
  };

  const saveLesson = async () => {
    if (!activeLesson) return;
    setSavingLesson(true);
    try {
      await lessonsApi.update(activeLesson.id, { content: lessonContent, title: activeLesson.title });
      toast.success('Lesson saved!');
      qc.invalidateQueries({ queryKey: ['course', id] });
    } catch {
      toast.error('Save failed');
    } finally {
      setSavingLesson(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="flex items-center justify-center h-96"><div className="animate-spin text-4xl">⟳</div></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="border-b bg-muted/30 px-6 py-3 flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/courses/${id}`}><ChevronLeft className="mr-1 h-4 w-4" />View Course</Link>
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex-1">
          {editingTitle ? (
            <div className="flex gap-2">
              <Input value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="h-8 text-sm" />
              <Button size="sm" onClick={() => updateCourseMutation.mutate({ title: courseTitle, description: courseDesc })}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingTitle(false)}>Cancel</Button>
            </div>
          ) : (
            <button onClick={() => setEditingTitle(true)} className="text-sm font-medium hover:text-primary transition-colors">
              {course?.title}
            </button>
          )}
        </div>
        <Badge variant={course?.status === 'PUBLISHED' ? 'default' : 'secondary'}>{course?.status}</Badge>
        {course?.status !== 'PUBLISHED' && (
          <Button size="sm" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
            <Eye className="mr-1 h-4 w-4" />Publish
          </Button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Left sidebar - course structure */}
        <aside className="w-64 border-r overflow-y-auto bg-muted/10 shrink-0">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Course Structure</h3>
              <Button size="sm" variant="ghost" onClick={() => addChapterMutation.mutate()} className="h-7 px-2">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="space-y-2">
              {course?.chapters?.map((chapter: any, ci: number) => (
                <div key={chapter.id} className="space-y-1">
                  <div className="flex items-center gap-1 group">
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex-1 truncate px-1">
                      {ci + 1}. {chapter.title}
                    </span>
                    <Button
                      size="sm" variant="ghost"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => addLessonMutation.mutate(chapter.id)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {chapter.lessons?.map((lesson: any, li: number) => (
                    <button
                      key={lesson.id}
                      onClick={() => selectLesson(lesson)}
                      className={cn(
                        'w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2',
                        activeLesson?.id === lesson.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted',
                      )}
                    >
                      <BookOpen className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{lesson.title}</span>
                    </button>
                  ))}
                </div>
              ))}
              {(!course?.chapters || course.chapters.length === 0) && (
                <div className="text-center py-6 text-muted-foreground text-xs">
                  <p>No chapters yet</p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => addChapterMutation.mutate()}>
                    <Plus className="mr-1 h-3 w-3" />Add Chapter
                  </Button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Editor */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {activeLesson ? (
            <>
              <div className="border-b px-4 py-2 flex items-center gap-3">
                <Input
                  value={activeLesson.title}
                  onChange={e => setActiveLesson({ ...activeLesson, title: e.target.value })}
                  className="h-8 text-sm font-medium border-none focus-visible:ring-0 p-0 bg-transparent"
                  placeholder="Lesson title"
                />
                <Button size="sm" onClick={saveLesson} disabled={savingLesson}>
                  <Save className="mr-1.5 h-3.5 w-3.5" />{savingLesson ? 'Saving...' : 'Save'}
                </Button>
              </div>
              <div className="flex-1 overflow-hidden" data-color-mode="light">
                <MDEditor
                  value={lessonContent}
                  onChange={v => setLessonContent(v || '')}
                  height="100%"
                  preview="live"
                  style={{ borderRadius: 0, border: 'none' }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-10">
              <div>
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Select a lesson to edit</h3>
                <p className="text-sm text-muted-foreground mb-4">Choose a lesson from the sidebar or add a new chapter to get started</p>
                <Button variant="outline" onClick={() => addChapterMutation.mutate()}>
                  <Plus className="mr-2 h-4 w-4" />Add Chapter
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
