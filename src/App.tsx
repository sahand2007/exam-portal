import React, { useState, useEffect } from "react";
import { User, Exam, Submission, ExamStats, Role } from "./types";
import StudentPortal from "./components/StudentPortal";
import TeacherPortal from "./components/TeacherPortal";
import {
  GraduationCap,
  ShieldAlert,
  Award,
  Users,
  LogIn,
  ArrowLeftRight,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  ShieldCheck,
  CheckCircle,
  Activity,
  ChevronRight,
  Database,
} from "lucide-react";

export default function App() {
  // Global App States - بەکارهێنەری سەرەکی (دەتوانیت لە ڕێگەی سویچ گۆڕانکاری بکەیت)
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: "u-1",
    email: "student@example.com",
    name: "David Miller",
    role: Role.STUDENT,
  });

  // لێرەدا داتاکان بە دەوڵەمەندی دادەنێین بۆ ئەوەی کێشەی کەمی داتا نەمێنێت
  const [exams, setExams] = useState<Exam[]>([
    {
      id: "exam-1",
      title: "Midterm Examination 2026",
      description: "Evaluation of core concepts including algorithms, system structure, and basic protocols.",
      duration: 60,
      totalPoints: 100,
      questions: [
        {
          id: "q1",
          text: "What is the primary complexity of Binary Search in the worst case?",
          options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
          correctOptionIndex: 2,
          points: 50
        },
        {
          id: "q2",
          text: "Which protocol operates at the Transport Layer of the OSI model?",
          options: ["HTTP", "TCP", "IP", "FTP"],
          correctOptionIndex: 1,
          points: 50
        }
      ]
    },
    {
      id: "exam-2",
      title: "Web Development Advanced Quiz",
      description: "Deep dive into React lifecycle, state management, and custom hook optimization.",
      duration: 45,
      totalPoints: 100,
      questions: [
        {
          id: "q3",
          text: "Which hook is used to memoize the return value of a function?",
          options: ["useEffect", "useCallback", "useMemo", "useRef"],
          correctOptionIndex: 2,
          points: 100
        }
      ]
    }
  ]);

  // داتای ناردراوی قوتابییەکان (Submissions) بۆ ئەوەی مامۆستا نمرەکان ببینێت
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: "sub-1",
      examId: "exam-1",
      studentId: "u-1",
      studentName: "David Miller",
      answers: [{ questionId: "q1", selectedOptionIndex: 2 }, { questionId: "q2", selectedOptionIndex: 1 }],
      score: 100,
      submittedAt: new Date().toISOString(),
      proctorFlags: 0,
      isGraded: true
    },
    {
      id: "sub-2",
      examId: "exam-1",
      studentId: "u-3",
      studentName: "Alex Rivera",
      answers: [{ questionId: "q1", selectedOptionIndex: 1 }, { questionId: "q2", selectedOptionIndex: 1 }],
      score: 50,
      submittedAt: new Date().toISOString(),
      proctorFlags: 3, // ئەم کاندیدە فڵاگی هەیە بۆ تاقیکردنەوەی لۆژیکی سیکیۆریتی
      isGraded: true
    }
  ]);

  // ستاتیستیک و شیکاری پۆلی مامۆستا (Analytics) بۆ ئەوەی هێڵکاری و ژمارەکان پڕ بن
  const [analytics, setAnalytics] = useState<ExamStats[]>([
    {
      examId: "exam-1",
      examTitle: "Midterm Examination 2026",
      averageScore: 75,
      highestScore: 100,
      lowestScore: 50,
      totalSubmissions: 2,
      flaggedSessionsCount: 1
    },
    {
      examId: "exam-2",
      examTitle: "Web Development Advanced Quiz",
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      totalSubmissions: 0,
      flaggedSessionsCount: 0
    }
  ]);

  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginRole, setLoginRole] = useState<"student" | "teacher">("student");
  const [authError, setAuthError] = useState("");

  const refreshAppData = async () => {
    setLoading(true);
    // لۆژیکی ڕیفرێش لەسەر داتای ناوخۆیی بە جێگیری دەمێنێتەوە
    setTimeout(() => {
      setLoading(false);
    }, 400);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    if (loginEmail.includes("teacher") || loginRole === "teacher") {
      setCurrentUser({
        id: "u-2",
        email: loginEmail,
        name: "Dr. Sarah Jenkins",
        role: Role.TEACHER,
      });
    } else {
      setCurrentUser({
        id: "u-1",
        email: loginEmail,
        name: "David Miller",
        role: Role.STUDENT,
      });
    }
    setAuthError("");
    setLoginEmail("");
    setActiveExamId(null);
  };

  const handleRoleQuickSwitch = () => {
    if (activeExamId) {
      const confirmLeave = window.confirm(
        "You are currently in an active exam. Switching roles now will lose progress. Proceed?"
      );
      if (!confirmLeave) return;
    }

    if (!currentUser) return;

    const nextRole =
      currentUser.role === Role.STUDENT ? Role.TEACHER : Role.STUDENT;
    const nextUser: User = {
      id: nextRole === Role.STUDENT ? "u-1" : "u-2",
      email:
        nextRole === Role.STUDENT
          ? "student@example.com"
          : "teacher@example.com",
      name:
        nextRole === Role.STUDENT ? "David Miller" : "Dr. Sarah Jenkins",
      role: nextRole,
    };

    setCurrentUser(nextUser);
    setActiveExamId(null);
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900"
      id="applet-container"
    >
      {/* Navigation Header */}
      <header
        className="bg-white border-b border-slate-200 sticky top-0 z-40"
        id="navbar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-indigo-600/10">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-slate-900">
                    EduPortal
                  </span>
                  <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Pro SaaS
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 leading-none">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                    Institution Portal
                  </span>
                  <div className="flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[8px] font-bold text-emerald-600">
                      SYSTEM DATA LIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider mt-0.5">
                      {currentUser.role === Role.STUDENT
                        ? "🎓 Candidate Workspace"
                        : "🔬 Faculty Examiner"}
                    </div>
                  </div>

                  <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

                  <button
                    onClick={handleRoleQuickSwitch}
                    title="Toggle Workspace Context for Showcase Testing"
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 rounded-lg text-slate-700 hover:text-indigo-700 active:scale-95 transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Switch Role</span>
                  </button>

                  <button
                    onClick={() => setCurrentUser(null)}
                    className="text-xs text-rose-500 hover:text-rose-700 font-bold px-3 py-1.5 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 py-1 px-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                  <span>Direct Customer Live Sandbox</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500 space-y-4">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="font-semibold text-slate-800">Updating View Metrics...</p>
          </div>
        ) : (
          <>
            {!currentUser ? (
              <div className="max-w-5xl mx-auto my-10" id="login-layout-panel">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  <div className="lg:col-span-5 bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-950 rounded-2xl p-8 text-white flex flex-col justify-between shadow-lg">
                    <div className="space-y-6">
                      <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs text-indigo-200">
                        <Activity className="w-3 h-3 text-emerald-400" />
                        <span>Mock Sandbox Enabled</span>
                      </div>
                      <h2 className="text-3xl font-extrabold tracking-tight">
                        Enterprise Examination Dashboard.
                      </h2>
                      <p className="text-indigo-200/90 text-sm">
                        Tested layout using robust baseline objects mimicking high volume database synchronization.
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-8">
                    <form onSubmit={handleCustomLogin} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">
                          EMAIL ADDRESS
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="student@example.com یان teacher@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">SELECT DEFAULT ROLE</label>
                        <select 
                          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none"
                          value={loginRole}
                          onChange={(e) => setLoginRole(e.target.value as "student" | "teacher")}
                        >
                          <option value="student">Student (David Miller)</option>
                          <option value="teacher">Teacher (Dr. Sarah Jenkins)</option>
                        </select>
                      </div>
                      <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl">
                        Enter Sandbox Workspace
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {currentUser.role === Role.STUDENT ? (
                  <StudentPortal
                    currentUser={currentUser}
                    exams={exams}
                    submissions={submissions}
                    onRefreshData={refreshAppData}
                    activeExamId={activeExamId}
                    setActiveExamId={setActiveExamId}
                  />
                ) : (
                  <TeacherPortal
                    currentUser={currentUser}
                    exams={exams}
                    submissions={submissions}
                    analytics={analytics}
                    onRefreshData={refreshAppData}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}