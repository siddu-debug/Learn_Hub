'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea, Card, CardContent, CardHeader, CardTitle, CardDescription, Avatar, AvatarFallback, AvatarImage } from '@/components/ui/index';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const schema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  headline: z.string().max(200).optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  github: z.string().optional(),
  twitter: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => { if (!isAuthenticated()) router.push('/login'); }, []);

  const { data: profile } = useQuery({ queryKey: ['me'], queryFn: usersApi.me });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        bio: profile.profile?.bio || '',
        headline: profile.profile?.headline || '',
        location: profile.profile?.location || '',
        website: profile.profile?.website || '',
        github: profile.profile?.github || '',
        twitter: profile.profile?.twitter || '',
      });
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => usersApi.updateProfile(data),
    onSuccess: () => toast.success('Profile updated!'),
    onError: () => toast.error('Update failed'),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your public profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="text-xl">{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(d => updateMutation.mutate(d))} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input {...register('name')} placeholder="Your name" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Headline</Label>
                  <Input {...register('headline')} placeholder="e.g. Full-Stack Developer" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Bio</Label>
                <Textarea {...register('bio')} rows={3} placeholder="Tell the community about yourself..." />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input {...register('location')} placeholder="City, Country" />
                </div>
                <div className="space-y-1.5">
                  <Label>Website</Label>
                  <Input {...register('website')} placeholder="https://yoursite.com" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>GitHub Username</Label>
                  <Input {...register('github')} placeholder="username" />
                </div>
                <div className="space-y-1.5">
                  <Label>Twitter Username</Label>
                  <Input {...register('twitter')} placeholder="username" />
                </div>
              </div>

              <Button type="submit" loading={updateMutation.isPending}>Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data.</p>
            <Button variant="destructive" size="sm" disabled>Delete Account</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
