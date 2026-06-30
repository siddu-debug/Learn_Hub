import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { answers: { orderBy: { order: 'asc' } } },
        },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async submitAttempt(userId: string, quizId: string, answers: { questionId: string; answerId: string }[]) {
    const quiz = await this.findOne(quizId);
    let correct = 0;

    const attemptAnswers = answers.map(({ questionId, answerId }) => {
      const question = quiz.questions.find((q) => q.id === questionId);
      const answer = question?.answers.find((a) => a.id === answerId);
      const isCorrect = answer?.isCorrect || false;
      if (isCorrect) correct++;
      return { questionId, answerId, isCorrect };
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passMark;

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        score,
        passed,
        answers: {
          create: attemptAnswers.map((a) => ({
            questionId: a.questionId,
            answerId: a.answerId,
            isCorrect: a.isCorrect,
          })),
        },
      },
      include: { answers: true },
    });

    return {
      attemptId: attempt.id,
      score,
      passed,
      correct,
      total: quiz.questions.length,
      answers: attemptAnswers,
    };
  }

  async getAttempts(userId: string, quizId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { completedAt: 'desc' },
    });
  }
}
