import React, { useState, useEffect } from "react";
import { User, Exam, Submission, ExamStats, Role } from "./types";
import StudentPortal from "./components/StudentPortal";
import TeacherPortal from "./components/TeacherPortal";
import {
  GraduationCap,
  ShieldAlert,
  ArrowLeftRight,
  RefreshCw,
  Activity,
  BarChart3,
  Lock
} from "lucide-react";

export default function App() {
  // 🔄 لێرەدا بەکارهێنەر بە null دادەنێین تاوەکو یەکسەر شاشەی تاقیکردنەوەی لۆگین (Login Panel) پیشان بدرێت
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // کۆمەڵێک تاقیکردنەوەی دەوڵەمەند بۆ جوانکردنی ڕیکلام و پۆرتالەکە
  const [exams, setExams] = useState<Exam[]>([
    {
      id: "exam-1",
      title: "Full-Stack Web Development Midterm",
      description: "Advanced evaluation of Next.js Server Components, React Lifecycle, Tailwind state composition, and Vercel edge runtime operations.",
      duration: 60,
      totalPoints: 100,
      questions: [
        {
          id: "q1",
          text: "Which of the following describes a React Server Component (RSC) correctly?",
          options: [
            "They re-render fully on the client side after the initial hydration process.",
            "They execute exclusively on the server and reduce the final client-side bundle size.",
            "They require dynamic configuration parameters via the legacy useMemo hook architecture.",
            "They lack direct native pipeline integration with Cloudflare network wrappers."
          ],
          correctOptionIndex: 1,
          points: 50
        },
        {
          id: "q2",
          text: "What is the utility of dynamic layouts under customized nested Tailwind CSS projects?",
          options: [
            "To hardcode style properties outside global configuration scripts.",
            "To inject compiled inline utilities that ignore state change triggers dynamically.",
            "To construct fluid, container-queries reactive interface systems using utility-first properties.",
            "To re-trigger browser layout processing engines sequentially via DOM overhead injections."
          ],
          correctOptionIndex: 2,
          points: 50
        }
      ]
    },
    {
      id: "exam-2",
      title: "Data Structures & Algorithm Frameworks",
      description: "Comprehensive testing on Tree balancing heuristics, worst-case asymptotic bounds, and graph traversal algorithms.",
      duration: 90,
      totalPoints: 100,
      questions: [
        {
          id: "q3",
          text: "What is the structural guarantee of a strict red-black tree layout?",
          options: [
            "The tree becomes perfectly linear when elements exceed double-digit counts.",
            "The longest root-to-leaf path is no more than twice as long as the shortest path.",
            "All sub-nodes maintain identical reference counts to global runtime context parameters.",
            "Every insert statement triggers an O(n^2) cascading sorting pattern."
          ],
          correctOptionIndex: 1,
          points: 100
        }
      ]
    }
  ]);

  // داتای قوتابییەکان بۆ دروستکردنی چارتی ئاماری دەوڵەمەند
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: "sub-1",
      examId: "exam-1",
      studentId: "u-1",
      studentName: "David Miller",
      answers: [{ questionId: "q1", selectedOptionIndex: 1 }, { questionId: "q2", selectedOptionIndex: 2 }],
      score: 100,
      submittedAt: new Date().toISOString(),
      proctorFlags: 0,
      isGraded: true
    },
    {
      id: "sub-2",
      examId: "exam-1",
      studentId: "u-4",
      studentName: "Sahand Sarkawt",
      answers: [{ questionId: "q1", selectedOptionIndex: 1 }, { questionId: "q2", selectedOptionIndex: 2 }],
      score: 100,
      submittedAt: new Date().toISOString(),
      proctorFlags: 0,
      isGraded: true
    },
    {
      id: "sub-3",
      examId: "exam-1",
      studentId: "u-5",
      studentName: "Alex Rivera",
      answers: [{ questionId: "q1", selectedOptionIndex: 0 }, { questionId: "q2", selectedOptionIndex: 2 }],
      score: 50,
      submittedAt: new Date().toISOString(),
      proctorFlags: 4,
      isGraded: true
    }
  ]);

  const [analytics, setAnalytics] = useState<ExamStats[]>([
    {
      examId: "exam-1",
      examTitle: "Full-Stack Web Development Midterm",
      averageScore: 83.3,
      highestScore: 100,
      lowestScore: 50,
      totalSubmissions: 3,
      flaggedSessionsCount: 1
    },
    {
      examId: "exam-2",
      examTitle: "Data Structures & Algorithm Frameworks",
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
  const [loginRole, setLoginRole] = useState<"student" | "teacher">("teacher");

  const refreshAppData = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setLoading(false);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    setLoading(true);
    // بەکارهێنانی تایم ئاوت بۆ ڕێگری لە بلۆکبوونی یو ئای لە کاتی گۆڕینی شاشەکان
    setTimeout(() => {
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
      setLoginEmail("");
      setActiveExamId(null);
      setLoading(false);
    }, 80);
  };

  const handleRoleQuickSwitch = () => {
    if (activeExamId) {
      const confirmLeave = window.confirm(
        "You are currently in an active exam. Switching roles now will lose progress. Proceed?"
      );
      if (!confirmLeave) return;
    }
    if (!currentUser) return;

    const nextRole = currentUser.role === Role.STUDENT ? Role.TEACHER : Role.STUDENT;
    setCurrentUser({
      id: nextRole === Role.STUDENT ? "u-1" : "u-2",
      email: nextRole === Role.STUDENT ? "student@example.com" : "teacher@example.com",
      name: nextRole === Role.STUDENT ? "David Miller" : "Dr. Sarah Jenkins",
      role: nextRole,
    });
    setActiveExamId(null);
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-100"
      id="applet-container"
    >
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/90" id="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-slate-900">EduPortal</span>
                  <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Enterprise SaaS Live
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 leading-none">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                    Baban Computer Institute Environment
                  </span>
                  <div className="flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>
                    <span className="text-[8px] font-bold text-emerald-600">DB SERVER LIVE</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</div>
                    <div className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider mt-0.5">
                      {currentUser.role === Role.STUDENT ? "🎓 Candidate Workspace" : "🔬 Faculty Examiner Hub"}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                  <button
                    onClick={handleRoleQuickSwitch}
                    className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold cursor-pointer shadow-sm flex items-center gap-2 transition-all"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Quick Swap Role</span>
                  </button>
                  <button
                    onClick={() => { setCurrentUser(null); setActiveExamId(null); }}
                    className="text-xs text-rose-500 hover:text-rose-700 font-bold px-3 py-1.5 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    Exit
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 py-1 px-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                  <span>Showcase Gateway Active</span>
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
            <p className="font-semibold text-slate-800">Compiling Workspace Components...</p>
          </div>
        ) : (
          <>
            {/* ⚠️ لۆژیکی ئاگاداری سیکیۆریتی: تەنها کاتێک دەرکەوێت کە قوتابی لە ناو تاقیکردنی چالاکدایە */}
            {currentUser && currentUser.role === Role.STUDENT && activeExamId && (
              <div className="max-w-7xl mx-auto mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5 animate-bounce" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black tracking-wider uppercase text-amber-900">
                        SECURITY MONITOR ACTIVE
                      </span>
                      <span className="bg-amber-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-widest">
                        LIVE
                      </span>
                    </div>
                    <p className="text-sm font-bold text-amber-900 mt-1 leading-relaxed">
                      Do NOT minimize or switch tabs! Tab changes are monitored and reported.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 🔐 بەشی لۆگینی گەڕاوە (Login Test Interface) */}
            {!currentUser ? (
              <div className="max-w-5xl mx-auto my-10 animate-fade-in" id="login-layout-panel">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  <div className="lg:col-span-5 bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-950 rounded-2xl p-8 text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
                    <div className="space-y-6">
                      <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs text-indigo-200">
                        <BarChart3 className="w-3 h-3 text-emerald-400" />
                        <span>High-Fidelity Showcase Mode</span>
                      </div>
                      <h2 className="text-3xl font-extrabold tracking-tight leading-snug">
                        AI-Powered Proctored Assessment Engine.
                      </h2>
                      <p className="text-indigo-200/90 text-sm leading-relaxed">
                        Simulating secure database models with automatic evaluation workflows, full student metric indexing, and proctoring logs.
                      </p>
                    </div>
                    <div className="pt-8 border-t border-indigo-500/30 flex items-center gap-2 text-indigo-200 text-xs font-semibold">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>End-to-End Encrypted Environment</span>
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <form onSubmit={handleCustomLogin} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                          Institutional Email Identifier
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="teacher@example.com یان student@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Select Dashboard Profile</label>
                        <select 
                          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold"
                          value={loginRole}
                          onChange={(e) => setLoginRole(e.target.value as "student" | "teacher")}
                        >
                          <option value="teacher">Faculty Examiner View (Dr. Sarah Jenkins)</option>
                          <option value="student">Student Sandbox View (David Miller)</option>
                        </select>
                      </div>
                      <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md active:scale-[0.99] transition-all cursor-pointer">
                        Launch Premium Presentation Workspace
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              /* 🖥️ بەشی لۆدبوونی پۆرتالەکان دوای لۆگین */
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