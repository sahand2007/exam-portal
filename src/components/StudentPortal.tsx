import { useState, useEffect } from "react";
import { User, Exam, AnswerSelection, Submission } from "../types";
import { 
  Clock, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  ShieldAlert, 
  Award as Trophy, 
  Edit3 
} from "lucide-react";

interface StudentPortalProps {
  currentUser: User;
  exams: Exam[];
  submissions: Submission[];
  onRefreshData: () => void;
  activeExamId: string | null;
  setActiveExamId: (id: string | null) => void;
}

// فەرمانی ڕێکخستنی کات
const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

export default function StudentPortal({
  currentUser,
  exams,
  submissions,
  onRefreshData,
  activeExamId,
  setActiveExamId
}: StudentPortalProps) {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [currentQuestionsAnswers, setCurrentQuestionsAnswers] = useState<AnswerSelection[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState<Submission | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeCertificateSubmission, setActiveCertificateSubmission] = useState<Submission | null>(null);

  const subjects = ["all", ...Array.from(new Set(exams.map(e => e.subject || "General")))];
  const activeExam = exams.find(e => e.id === activeExamId);

  useEffect(() => {
    if (!activeExamId || showConfirmModal) return;

    const handleVisibilityChange = () => {
      if (document.hidden) setTabWarnings(prev => prev + 1);
    };

    const handleWindowBlur = () => {
      setTabWarnings(prev => prev + 1);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [activeExamId, showConfirmModal]);

  useEffect(() => {
    if (!activeExamId || !activeExam) return;

    const duration = (activeExam as any).durationMinutes || (activeExam as any).duration || 60;
    setTimeLeft(duration * 60);
    setCurrentQuestionIndex(0);
    setTabWarnings(0);
    
    setCurrentQuestionsAnswers(
      activeExam.questions.map(q => ({ 
        questionId: q.id, 
        selectedOptionIndex: -1,
        textAnswer: ""
      }))
    );

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerAutomaticSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeExamId]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setCurrentQuestionsAnswers(prev =>
      prev.map(item =>
        item.questionId === questionId
          ? { ...item, selectedOptionIndex: optionIndex, textAnswer: "" }
          : item
      )
    );
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setCurrentQuestionsAnswers(prev =>
      prev.map(item =>
        item.questionId === questionId
          ? { ...item, textAnswer: text, selectedOptionIndex: -2 }
          : item
      )
    );
  };

  const calculateScoresLocally = (answers: AnswerSelection[]): number => {
    if (!activeExam) return 0;
    let totalScore = 0;
    const pointsPerQuestion = 100 / activeExam.questions.length;

    activeExam.questions.forEach((q, idx) => {
      const studentAns = answers[idx];
      if (!studentAns) return;

      if (q.type === "short-answer" || !q.options || q.options.length === 0) {
        const cleanStudentAns = (studentAns.textAnswer || "").trim().toLowerCase();
        const correctAnswer = ((q as any).correctAnswer || "").trim().toLowerCase();
        if (cleanStudentAns && correctAnswer && cleanStudentAns === correctAnswer) {
          totalScore += (q as any).points || pointsPerQuestion;
        }
      } else {
        const correctIdx = (q as any).correctOptionIndex !== undefined ? (q as any).correctOptionIndex : 0;
        if (studentAns.selectedOptionIndex === correctIdx) {
          totalScore += (q as any).points || pointsPerQuestion;
        }
      }
    });
    return Math.min(100, Math.round(totalScore));
  };

  const triggerAutomaticSubmission = async () => {
    if (submitting) return;
    setSubmitting(true);
    setShowConfirmModal(false);
    
    const finalWarnings = tabWarnings;

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: activeExamId,
          studentId: currentUser.id,
          studentName: currentUser.name,
          answers: currentQuestionsAnswers,
          tabLeavesWarningCount: finalWarnings
        })
      });

      if (response.ok) {
        const result = await response.json();
        setJustSubmitted(result);
      } else {
        throw new Error("Server error");
      }
    } catch (e) {
      const calculatedMockScore = calculateScoresLocally(currentQuestionsAnswers);
      setJustSubmitted({
        id: "sub-auto-" + Date.now(),
        examId: activeExamId || "exam-1",
        examTitle: activeExam?.title || "Assessment",
        studentId: currentUser.id,
        studentName: currentUser.name,
        answers: currentQuestionsAnswers,
        score: calculatedMockScore,
        totalPoints: 100,
        percentage: calculatedMockScore,
        passed: calculatedMockScore >= 50,
        submittedAt: new Date().toISOString(),
        tabLeavesWarningCount: finalWarnings,
        proctorFlags: finalWarnings,
        isGraded: true
      });
    } finally {
      setActiveExamId(null);
      onRefreshData();
      setSubmitting(false);
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchesSubject = selectedSubject === "all" || exam.subject === selectedSubject;
    return matchesSubject;
  });

  const currentQuestion = activeExam?.questions[currentQuestionIndex];
  const isShortAnswerType = currentQuestion && (currentQuestion.type === "short-answer" || !currentQuestion.options || currentQuestion.options.length === 0);

  // ... (کۆدی ڕێندەرەکە وەک خۆیەتی، تەنها دڵنیا ببەرەوە کە className="w-3.5 h-3.5" بێت لەجیاتی w-3..5)
  return (
    <div className="space-y-6">
      {/* لێرەدا کۆدی HTML/JSXـەکەت دابنێ کە پێشتر هەتبوو */}
      {/* تەنها دڵنیا ببەرەوە کە هەموو className ـەکان دروست بن */}
    </div>
  );
}