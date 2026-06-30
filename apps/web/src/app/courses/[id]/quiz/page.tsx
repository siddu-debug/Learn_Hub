'use client';
import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { CheckCircle, XCircle, ChevronLeft, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, Progress } from '@/components/ui/index';
import { quizzesApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function QuizPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const quizId = searchParams.get('quizId')!;

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizzesApi.get(quizId),
    enabled: !!quizId,
  });

  const submitMutation = useMutation({
    mutationFn: (answers: any) => quizzesApi.submit(quizId, { answers }),
    onSuccess: (data) => { setResult(data); setSubmitted(true); },
  });

  if (isLoading || !quiz) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-4xl">⟳</div></div>;
  }

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQ];
  const totalQuestions = questions.length;
  const progress = ((currentQ + 1) / totalQuestions) * 100;

  const handleSelect = (answerId: string) => {
    if (!submitted) setSelected(prev => ({ ...prev, [currentQuestion.id]: answerId }));
  };

  const handleSubmit = () => {
    const answers = Object.entries(selected).map(([questionId, answerId]) => ({ questionId, answerId }));
    submitMutation.mutate(answers);
  };

  // Results view
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className={cn('mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full', result.passed ? 'bg-green-100' : 'bg-red-100')}>
            {result.passed ? <Trophy className="h-12 w-12 text-green-600" /> : <XCircle className="h-12 w-12 text-red-500" />}
          </div>
          <h1 className="text-3xl font-bold mb-2">{result.passed ? 'Congratulations!' : 'Keep Practicing!'}</h1>
          <p className="text-muted-foreground mb-6">{result.passed ? 'You passed the quiz!' : `You didn't pass this time. Review the lessons and try again.`}</p>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-5xl font-bold text-center mb-2">{result.score}%</div>
              <Progress value={result.score} className="mb-3" />
              <p className="text-center text-sm text-muted-foreground">{result.correct} out of {result.total} correct</p>
            </CardContent>
          </Card>

          <div className="space-y-3 mb-8">
            {questions.map((q: any, i: number) => {
              const ans = result.answers?.find((a: any) => a.questionId === q.id);
              const correct = ans?.isCorrect;
              return (
                <div key={q.id} className={cn('rounded-lg p-4 text-left border', correct ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-red-200 bg-red-50 dark:bg-red-950/20')}>
                  <div className="flex items-start gap-2">
                    {correct ? <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
                    <div>
                      <p className="text-sm font-medium">{q.text}</p>
                      {q.explanation && <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" asChild><Link href={`/courses/${courseId}`}><ChevronLeft className="mr-1 h-4 w-4" />Back to Course</Link></Button>
            <Button onClick={() => { setSubmitted(false); setResult(null); setSelected({}); setCurrentQ(0); }}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz view
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/courses/${courseId}/learn`}><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">{quiz.title}</h1>
            <p className="text-sm text-muted-foreground">Question {currentQ + 1} of {totalQuestions}</p>
          </div>
        </div>

        <Progress value={progress} className="mb-8" />

        <Card>
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold mb-6">{currentQuestion.text}</h2>
            <div className="space-y-3">
              {currentQuestion.answers?.map((answer: any) => {
                const isSelected = selected[currentQuestion.id] === answer.id;
                return (
                  <button
                    key={answer.id}
                    onClick={() => handleSelect(answer.id)}
                    className={cn(
                      'w-full text-left px-5 py-4 rounded-xl border-2 transition-all',
                      isSelected ? 'border-primary bg-primary/5 font-medium' : 'border-border hover:border-primary/50 hover:bg-muted/50',
                    )}
                  >
                    {answer.text}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => setCurrentQ(q => q - 1)} disabled={currentQ === 0}>Previous</Button>

          {currentQ < totalQuestions - 1 ? (
            <Button onClick={() => setCurrentQ(q => q + 1)} disabled={!selected[currentQuestion.id]}>Next</Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(selected).length < totalQuestions || submitMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          {Object.keys(selected).length}/{totalQuestions} questions answered
        </p>
      </div>
    </div>
  );
}
