-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "passwordHash" TEXT,
    "googleId" TEXT UNIQUE,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("id")
);

-- CreateTable profiles
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL UNIQUE,
    "bio" TEXT,
    "website" TEXT,
    "github" TEXT,
    "twitter" TEXT,
    "location" TEXT,
    "headline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- CreateTable refresh_tokens
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- CreateTable courses
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImageUrl" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'BEGINNER',
    "estimatedHours" DOUBLE PRECISION,
    "isForked" BOOLEAN NOT NULL DEFAULT false,
    "originalCourseId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("creatorId") REFERENCES "users"("id"),
    FOREIGN KEY ("originalCourseId") REFERENCES "courses"("id")
);

-- CreateTable tags
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- CreateTable course_tags
CREATE TABLE "course_tags" (
    "courseId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    PRIMARY KEY ("courseId", "tagId"),
    FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE,
    FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE
);

-- CreateTable chapters
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE
);

-- CreateTable lessons
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "videoUrl" TEXT,
    "order" INTEGER NOT NULL,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE
);

-- CreateTable quizzes
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT,
    "courseId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "passMark" INTEGER NOT NULL DEFAULT 70,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE
);

-- CreateTable questions
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE
);

-- CreateTable answers
CREATE TABLE "answers" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE
);

-- CreateTable quiz_attempts
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("quizId") REFERENCES "quizzes"("id"),
    FOREIGN KEY ("userId") REFERENCES "users"("id")
);

-- CreateTable attempt_answers
CREATE TABLE "attempt_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("attemptId") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE,
    FOREIGN KEY ("questionId") REFERENCES "questions"("id")
);

-- CreateTable course_versions
CREATE TABLE "course_versions" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changelog" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE
);

-- CreateTable forks
CREATE TABLE "forks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalCourseId" TEXT NOT NULL,
    "forkedCourseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("userId") REFERENCES "users"("id"),
    FOREIGN KEY ("originalCourseId") REFERENCES "courses"("id")
);

-- CreateTable chat_sessions
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("userId") REFERENCES "users"("id"),
    FOREIGN KEY ("courseId") REFERENCES "courses"("id")
);

-- CreateTable chat_messages
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "citations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("sessionId") REFERENCES "chat_sessions"("id") ON DELETE CASCADE
);

-- CreateTable progress
CREATE TABLE "progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "completedLessons" INTEGER NOT NULL DEFAULT 0,
    "totalLessons" INTEGER NOT NULL DEFAULT 0,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    UNIQUE ("userId", "courseId"),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("userId") REFERENCES "users"("id"),
    FOREIGN KEY ("courseId") REFERENCES "courses"("id")
);

-- CreateTable lesson_completions
CREATE TABLE "lesson_completions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("userId", "lessonId"),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE
);

-- CreateTable bookmarks
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("userId", "courseId"),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("userId") REFERENCES "users"("id"),
    FOREIGN KEY ("courseId") REFERENCES "courses"("id")
);

-- CreateTable likes
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("userId", "courseId"),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("userId") REFERENCES "users"("id"),
    FOREIGN KEY ("courseId") REFERENCES "courses"("id")
);

-- CreateTable course_embeddings
CREATE TABLE "course_embeddings" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT,
    "content" TEXT NOT NULL,
    "embedding" vector(384),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE
);

-- Index for vector similarity search
CREATE INDEX course_embeddings_embedding_idx ON course_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
