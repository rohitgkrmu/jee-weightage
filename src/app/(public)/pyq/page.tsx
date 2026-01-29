import { Metadata } from "next";
import { PYQBrowser } from "./pyq-browser";

export const metadata: Metadata = {
  title: "JEE Previous Year Questions (PYQ) Browser | 1300+ Questions",
  description:
    "Browse 1300+ JEE Main & Advanced previous year questions organized by chapter, topic, year, and difficulty. Filter by Physics, Chemistry, Maths. Practice with solutions.",
  alternates: {
    canonical: "/pyq",
  },
  openGraph: {
    title: "JEE PYQ Browser | Previous Year Questions 2019-2026",
    description:
      "Access JEE Main & Advanced previous year questions. Filter by subject, chapter, year, difficulty. 1300+ questions with solutions.",
  },
  keywords: [
    "JEE previous year questions",
    "JEE PYQ",
    "JEE Main PYQ",
    "JEE Advanced PYQ",
    "JEE chapter wise questions",
    "JEE Physics PYQ",
    "JEE Chemistry PYQ",
    "JEE Maths PYQ",
    "JEE practice questions",
  ],
};

export default function PYQPage() {
  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            JEE <span className="gradient-text">Previous Year Questions</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Browse and practice 1300+ questions from JEE Main & Advanced (2019-2026).
            Filter by subject, chapter, year, and difficulty.
          </p>
        </div>

        {/* Browser Component */}
        <PYQBrowser />
      </div>
    </div>
  );
}
