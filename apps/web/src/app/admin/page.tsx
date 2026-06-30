'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, BookOpen, CheckCircle, BarChart3 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, Badge, Skeleton } from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { formatDate } from '@/lib/utils';

const adminApi = {
  stats: () => api.get('/admin/stats').then(r => r.data),
  users: (page = 1) => api.get('/admin/users', { params: { page } }).then(r => r.data),
  courses: (page = 1) => api.get('/admin/courses', { params: { page } }).then(r => r.data),
  toggleUser: (id: string) => api.put(`/admin/users/${id}/toggle-active`).then(r => r.data),
  archiveCourse: (id: string) => api.put(`/admin/courses/${id}/archive`).then(r => r.data),
};

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const [tab, setTab] = useState<'overview' | 'users' | 'courses'>('overview');
  const qc = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) router.push('/');
  }, []);

  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: adminApi.stats });
  const { data: users, isLoading: usersLoading } = useQuery({ queryKey: ['admin-users'], queryFn: () => adminApi.users(), enabled: tab === 'users' });
  const { data: courses, isLoading: coursesLoading } = useQuery({ queryKey: ['admin-courses'], queryFn: () => adminApi.courses(), enabled: tab === 'courses' });

  const toggleUserMutation = useMutation({
    mutationFn: adminApi.toggleUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const archiveMutation = useMutation({
    mutationFn: adminApi.archiveCourse,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-courses'] }),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b">
          {(['overview', 'users', 'courses'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors -mb-px ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-blue-500' },
              { label: 'Total Courses', value: stats?.totalCourses, icon: BookOpen, color: 'text-purple-500' },
              { label: 'Published', value: stats?.publishedCourses, icon: CheckCircle, color: 'text-green-500' },
              { label: 'Total Lessons', value: stats?.totalLessons, icon: BarChart3, color: 'text-orange-500' },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-6">
                  <s.icon className={`h-8 w-8 mb-3 ${s.color}`} />
                  <div className="text-3xl font-bold">{s.value ?? '—'}</div>
                  <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {usersLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
                  ))
                ) : users?.users?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3"><Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>{u.role}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={u.isActive ? 'default' : 'destructive'} className={u.isActive ? 'bg-green-500' : ''}>{u.isActive ? 'Active' : 'Disabled'}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" onClick={() => toggleUserMutation.mutate(u.id)} disabled={toggleUserMutation.isPending}>
                        {u.isActive ? 'Disable' : 'Enable'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Courses */}
        {tab === 'courses' && (
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {['Title', 'Creator', 'Status', 'Difficulty', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {coursesLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
                  ))
                ) : courses?.courses?.map((c: any) => (
                  <tr key={c.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium max-w-xs truncate">{c.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.creator?.name}</td>
                    <td className="px-4 py-3"><Badge variant={c.status === 'PUBLISHED' ? 'default' : 'secondary'} className={c.status === 'ARCHIVED' ? 'bg-gray-400' : ''}>{c.status}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{c.difficulty}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      {c.status !== 'ARCHIVED' && (
                        <Button size="sm" variant="outline" onClick={() => archiveMutation.mutate(c.id)} disabled={archiveMutation.isPending}>Archive</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
