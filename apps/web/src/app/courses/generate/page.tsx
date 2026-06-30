'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Link as LinkIcon, FileText, Github, Type, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/index';
import { aiApi } from '@/lib/api';
import { cn } from '@/lib/utils';

type SourceType = 'prompt' | 'url' | 'pdf' | 'github';

const sources: { type: SourceType; label: string; icon: any; desc: string }[] = [
  { type: 'prompt', label: 'Text Prompt', icon: Type, desc: 'Describe what you want to teach' },
  { type: 'url', label: 'Website URL', icon: LinkIcon, desc: 'Any webpage or article' },
  { type: 'pdf', label: 'PDF Upload', icon: FileText, desc: 'Upload a PDF document' },
  { type: 'github', label: 'GitHub Repo', icon: Github, desc: 'From a README or repo' },
];

export default function GenerateCoursePage() {
  const router = useRouter();
  const [sourceType, setSourceType] = useState<SourceType>('prompt');
  const [prompt, setPrompt] = useState('');
  const [url, setUrl] = useState('');
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (sourceType === 'prompt' && !prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    if ((sourceType === 'url' || sourceType === 'github') && !url.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    if (sourceType === 'pdf' && !file) {
      toast.error('Please upload a PDF');
      return;
    }

    setLoading(true);
    try {
      let course;
      if (sourceType === 'pdf' && file) {
        const fd = new FormData();
        fd.append('file', file);
        if (topic) fd.append('topic', topic);
        course = await aiApi.generatePdf(fd);
      } else {
        course = await aiApi.generate({ type: sourceType, prompt, url, topic });
      }
      toast.success('Course generated successfully!');
      router.push(`/courses/${course.id}/edit`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Generation failed. Check your OpenAI key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Generate a Course with AI</h1>
          <p className="text-muted-foreground mt-2">Choose a source and let AI create a complete course for you</p>
        </div>

        {/* Source type selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {sources.map((s) => (
            <button
              key={s.type}
              onClick={() => setSourceType(s.type)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center',
                sourceType === s.type
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-transparent bg-muted hover:border-muted-foreground/20',
              )}
            >
              <s.icon className="h-6 w-6" />
              <span className="text-sm font-medium">{s.label}</span>
              <span className="text-xs text-muted-foreground">{s.desc}</span>
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{sources.find(s => s.type === sourceType)?.label}</CardTitle>
            <CardDescription>Fill in the details below to generate your course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Topic (optional for all) */}
            <div className="space-y-1.5">
              <Label>Course Topic / Focus (optional)</Label>
              <Input
                placeholder="e.g. Introduction to Machine Learning for beginners"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Helps AI focus the course better</p>
            </div>

            {/* Prompt */}
            {sourceType === 'prompt' && (
              <div className="space-y-1.5">
                <Label>Describe your course *</Label>
                <Textarea
                  rows={5}
                  placeholder="e.g. Create a beginner-friendly course on React hooks, covering useState, useEffect, useContext, and custom hooks with practical examples..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            )}

            {/* URL */}
            {(sourceType === 'url' || sourceType === 'github') && (
              <div className="space-y-1.5">
                <Label>{sourceType === 'github' ? 'GitHub Repository URL' : 'Website URL'} *</Label>
                <Input
                  type="url"
                  placeholder={sourceType === 'github' ? 'https://github.com/user/repo' : 'https://example.com/article'}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            )}

            {/* PDF */}
            {sourceType === 'pdf' && (
              <div className="space-y-1.5">
                <Label>Upload PDF *</Label>
                <div
                  className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => document.getElementById('pdf-input')?.click()}
                >
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  {file ? (
                    <p className="text-sm font-medium text-primary">{file.name}</p>
                  ) : (
                    <>
                      <p className="text-sm font-medium">Click to upload PDF</p>
                      <p className="text-xs text-muted-foreground mt-1">Max 10MB</p>
                    </>
                  )}
                  <input
                    id="pdf-input"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button onClick={handleGenerate} loading={loading} className="w-full" size="lg">
                <Sparkles className="mr-2 h-4 w-4" />
                {loading ? 'Generating your course... (takes 30-60s)' : 'Generate Course'}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                AI will create chapters, lessons, and quiz questions automatically
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
