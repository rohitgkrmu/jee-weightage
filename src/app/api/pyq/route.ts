import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    // Build filter
    const where: Record<string, unknown> = {
      isActive: true,
    };

    const subject = searchParams.get("subject");
    if (subject && ["PHYSICS", "CHEMISTRY", "MATHEMATICS"].includes(subject)) {
      where.subject = subject;
    }

    const examType = searchParams.get("examType");
    if (examType && ["MAIN", "ADVANCED"].includes(examType)) {
      where.examType = examType;
    }

    const year = searchParams.get("year");
    if (year) {
      const yearNum = parseInt(year);
      if (yearNum >= 2015 && yearNum <= 2030) {
        where.examYear = yearNum;
      }
    }

    const difficulty = searchParams.get("difficulty");
    if (difficulty && ["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      where.difficulty = difficulty;
    }

    const chapter = searchParams.get("chapter");
    if (chapter) {
      where.chapter = { contains: chapter, mode: "insensitive" };
    }

    const topic = searchParams.get("topic");
    if (topic) {
      where.topic = { contains: topic, mode: "insensitive" };
    }

    const questionType = searchParams.get("questionType");
    if (questionType && ["MCQ_SINGLE", "MCQ_MULTIPLE", "NUMERICAL", "INTEGER", "ASSERTION_REASON", "MATCH_THE_COLUMN"].includes(questionType)) {
      where.questionType = questionType;
    }

    const search = searchParams.get("search");
    if (search && search.length >= 2) {
      where.OR = [
        { questionText: { contains: search, mode: "insensitive" } },
        { topic: { contains: search, mode: "insensitive" } },
        { concept: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.question.count({ where });

    // Get questions (hide correct answer by default for practice mode)
    const showAnswers = searchParams.get("showAnswers") === "true";

    const questions = await prisma.question.findMany({
      where,
      select: {
        id: true,
        examType: true,
        examYear: true,
        examSession: true,
        subject: true,
        chapter: true,
        topic: true,
        concept: true,
        questionType: true,
        difficulty: true,
        questionText: true,
        options: true,
        correctAnswer: showAnswers,
        solution: showAnswers,
      },
      orderBy: [
        { examYear: "desc" },
        { subject: "asc" },
        { chapter: "asc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        subject,
        examType,
        year,
        difficulty,
        chapter,
        topic,
        questionType,
        search,
      },
    });
  } catch (error) {
    console.error("Error fetching PYQ:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
