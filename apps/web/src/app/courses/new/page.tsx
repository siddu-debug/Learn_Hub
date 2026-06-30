'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/index';
import { coursesApi } from '@/lib/api';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  estimatedHours: z.number().min(0).optional(),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { difficulty: 'BEGINNER' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const course = await coursesApi.create({ ...data, tags });
      toast.success('Course created!');
      router.push(`/courses/${course.id}/edit`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Create Course Manually</h1>
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>Fill in the basic information for your course</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label>Course Title *</Label>
                <Input placeholder="e.g. Introduction to Python Programming" {...register('title')} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={3} placeholder="What will learners gain from this course?" {...register('description')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Difficulty</Label>
                  <select {...register('difficulty')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Estimated Hours</Label>
                  <Input type="number" min="0" step="0.5" placeholder="e.g. 10" {...register('estimatedHours', { valueAsNumber: true })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Tags (comma separated)</Label>
                <Input placeholder="e.g. python, programming, beginner" {...register('tags')} />
              </div>

              <Button type="submit" loading={loading} className="w-full">Create Course</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
