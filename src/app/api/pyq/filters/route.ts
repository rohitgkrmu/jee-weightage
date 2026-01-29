import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");
    const examType = searchParams.get("examType");

    // Build base filter
    const baseWhere: Record<string, unknown> = { isActive: true };
    if (subject) baseWhere.subject = subject;
    if (examType) baseWhere.examType = examType;

    // Get available years
    const years = await prisma.question.groupBy({
      by: ["examYear"],
      where: baseWhere,
      _count: true,
      orderBy: { examYear: "desc" },
    });

    // Get available chapters (with counts)
    const chapters = await prisma.question.groupBy({
      by: ["chapter", "subject"],
      where: baseWhere,
      _count: true,
      orderBy: { _count: { chapter: "desc" } },
    });

    // Get question type distribution
    const questionTypes = await prisma.question.groupBy({
      by: ["questionType"],
      where: baseWhere,
      _count: true,
    });

    // Get difficulty distribution
    const difficulties = await prisma.question.groupBy({
      by: ["difficulty"],
      where: baseWhere,
      _count: true,
    });

    // Get exam type counts
    const examTypes = await prisma.question.groupBy({
      by: ["examType"],
      where: { isActive: true },
      _count: true,
    });

    // Get subject counts
    const subjects = await prisma.question.groupBy({
      by: ["subject"],
      where: baseWhere,
      _count: true,
    });

    // Group chapters by subject
    const chaptersBySubject: Record<string, { chapter: string; count: number }[]> = {};
    for (const ch of chapters) {
      if (!chaptersBySubject[ch.subject]) {
        chaptersBySubject[ch.subject] = [];
      }
      chaptersBySubject[ch.subject].push({
        chapter: ch.chapter,
        count: ch._count,
      });
    }

    return NextResponse.json({
      years: years.map((y) => ({ year: y.examYear, count: y._count })),
      chapters: chaptersBySubject,
      questionTypes: questionTypes.map((qt) => ({
        type: qt.questionType,
        count: qt._count,
      })),
      difficulties: difficulties.map((d) => ({
        level: d.difficulty,
        count: d._count,
      })),
      examTypes: examTypes.map((et) => ({
        type: et.examType,
        count: et._count,
      })),
      subjects: subjects.map((s) => ({
        subject: s.subject,
        count: s._count,
      })),
    });
  } catch (error) {
    console.error("Error fetching PYQ filters:", error);
    return NextResponse.json(
      { error: "Failed to fetch filters" },
      { status: 500 }
    );
  }
}
