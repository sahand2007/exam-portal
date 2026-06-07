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
  Database
} from "lucide-react";

export default function App() {
  // Global App States
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: "u-1",
    email: "student@example.com",
    name: "David Miller",
    role: Role.STUDENT
  });

  const [exams, setExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [analytics, setAnalytics] = useState<ExamStats[]>([]);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Custom login credentials values
  const [loginEmail, setLoginEmail] = useState("");
  const [loginRole, setLoginRole] = useState<'student' | 'teacher'>('student');
  const [authError, setAuthError] = useState("");

  // Retrieve states from local server JSON file db via API Router
  const refreshAppData = async () => {
    try {
      // 1. Fetch Exams
      const examResp = await fetch("/api/exams");
      if (examResp.ok) {
        const examData = await examResp.json();
        setExams(examData);
      }

      // 2. Fetch Submissions
      const subResp = await fetch("/api/submissions");
      if (subResp.ok) {
        const subData = await subResp.json();
        setSubmissions(subData);
      }

      // 3. Fetch Analytics
      const analyticsResp = await fetch("/api/analytics");
      if (analyticsResp.ok) {
        const analyticsData = await analyticsResp.json();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      console.error("Failed fetching database endpoints", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAppData();
  }, []);

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          role: loginRole
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          setCurrentUser(data.user);
          setAuthError("");
          setLoginEmail("");
          setActiveExamId(null);
          refreshAppData();
        }
      } else {
        setAuthError("Invalid credentials mismatch! Verify role & email.");
      }
    } catch (err) {
      setAuthError("Failed connecting to the secure authentication service.");
    }
  };

  const handleRoleQuickSwitch = () => {
    if (activeExamId) {
      const confirmLeave = window.confirm("You are currently in an active exam. Switching roles now will lose progress. Proceed?");
      if (!confirmLeave) return;
    }

    if (!currentUser) return;

    const nextRole = currentUser.role === Role.STUDENT ? Role.TEACHER : Role.STUDENT;
    const nextUser: User = {
      id: nextRole === Role.STUDENT ? "u-1" : "u-2",
      email: nextRole === Role.STUDENT ? "student@example.com" : "teacher@example.com",
      name: nextRole === Role.STUDENT ? "David Miller" : "Dr. Sarah Jenkins",
      role: nextRole
    };
    
    setCurrentUser(nextUser);
    setActiveExamId(null);
    refreshAppData();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900" id="applet-container">
      
      {/* 1. Commercialized Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40" id="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* White-Label Logo Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-indigo-600/10">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-slate-900">EduPortal</span>
                  <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Pro SaaS</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 leading-none">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Institution Portal</span>
                  <div className="flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[8px] font-bold text-emerald-600">SYSTEM STABLE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Workspace Status Banner */}
            <div className="flex items-center gap-4">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</div>
                    <div className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider mt-0.5">
                      {currentUser.role === Role.STUDENT ? "🎓 Candidate Workspace" : "🔬 Faculty Examiner"}
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

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          /* Sleek Loading State Placeholder */
          <div className="py-24 flex flex-col items-center justify-center text-slate-500 space-y-4 animate-fade-in">
            <div className="p-4 bg-indigo-50 rounded-full ring-4 ring-indigo-500/10">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-slate-800">Synchronizing EduPortal Assets</p>
              <p className="text-xs text-slate-400">Loading exam sheets, proctor logs, and analytics counters...</p>
            </div>
          </div>
        ) : (
          <>
            {/* If not authenticated, render highly polished commercial-grade Login Canvas */}
            {!currentUser ? (
              <div className="max-w-5xl mx-auto my-6 lg:my-10" id="login-layout-panel">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Left Column: Commercial Hook / Platform Key Highlights (SaaS Marketing Card) */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-950 rounded-2xl p-8 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    
                    <div className="space-y-6 relative z-15">
                      <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs text-indigo-200 font-medium">
                        <Activity className="w-3 h-3 text-emerald-400" />
                        <span>Ready for Commercial Deployment</span>
                      </div>

                      <div className="space-y-3">
                        <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
                          Enterprise Grade Educational Metrics.
                        </h2>
                        <p className="text-indigo-200/90 text-sm leading-relaxed">
                          A plug-and-play white-label SaaS solution engineered to scale examination cycles securely with integrated anti-cheat behaviors.
                        </p>
                      </div>

                      <div className="space-y-4 pt-4">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-4 h-4 text-indigo-300" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-white">Browser Proctor Engine</p>
                            <p className="text-xs text-indigo-200 mt-0.5">Monitors window focus & switches, instantly flagging suspicious sessions.</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center shrink-0">
                            <Award className="w-4 h-4 text-indigo-300" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-white">Self-Executing Evaluator</p>
                            <p className="text-xs text-indigo-200 mt-0.5">Auto-grades submitted multiple choice questions to compute statistics instantly.</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-indigo-300" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-white">Consolidated Analytics</p>
                            <p className="text-xs text-indigo-200 mt-0.5">Faculty dashboard generates failure ratios and proctor violations metrics.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-indigo-500/30 text-indigo-200/80 text-xs flex items-center justify-between relative z-15">
                      <span>Standard Institution Tier</span>
                      <div className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-indigo-300" />
                        <span className="font-mono text-[11px] uppercase">State Synchronized</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Sleek Auth Input Terminal */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-md p-8 flex flex-col justify-between">
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Access Secure Workspace</h3>
                        <p className="text-sm text-slate-500 mt-1">Please enter your institutional email credentials or explore with the design demo suite.</p>
                      </div>

                      {/* Error block with Clean Alert UI */}
                      {authError && (
                        <div className="bg-rose-50 text-rose-800 border-l-4 border-rose-600 p-4 rounded-r-lg text-xs font-semibold flex items-start gap-2.5 animate-shake">
                          <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-600" />
                          <div className="space-y-0.5">
                            <p className="font-bold">Authentication Refused</p>
                            <p className="text-rose-600 font-medium">{authError}</p>
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleCustomLogin} className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 tracking-wider uppercase block">Corporate Email Address</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Mail className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                              type="email"
                              required
                              placeholder="e.g. student@example.com / teacher@example.com"
                              value={loginEmail}
                              onChange={e => setLoginEmail(e.target.value)}
                              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white text-slate-800 transition-all font-medium placeholder-slate-400 shadow-3xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 tracking-wider uppercase block">Workspace Role Designation</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setLoginRole('student')}
                              className={`py-3 px-4 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                loginRole === 'student'
                                  ? "bg-indigo-50/80 border-indigo-600 text-indigo-700 shadow-3xs"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                              }`}
                            >
                              🎓 Student Workspace
                            </button>
                            <button
                              type="button"
                              onClick={() => setLoginRole('teacher')}
                              className={`py-3 px-4 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                loginRole === 'teacher'
                                  ? "bg-indigo-50/80 border-indigo-600 text-indigo-700 shadow-3xs"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                              }`}
                            >
                              🔬 Faculty Examiner
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-2 active:translate-y-[1px]"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Establish Session</span>
                        </button>
                      </form>
                    </div>

                    {/* Pre-configured showcase credentials */}
                    <div className="border-t border-slate-100 pt-6 mt-6 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Explore with Demo Accounts</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Click standard corporate logins below to inspect both full-stack components instantaneously.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setCurrentUser({
                              id: "u-1",
                              email: "student@example.com",
                              name: "David Miller",
                              role: Role.STUDENT
                            });
                          }}
                          className="p-3.5 bg-slate-50/75 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition-all flex flex-col justify-between group cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center">
                                <Users className="w-3 h-3" />
                              </div>
                              <span className="text-xs font-bold text-slate-800">Student Panel</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-all" />
                          </div>
                          <div className="mt-2">
                            <p className="text-[11px] text-slate-500 leading-tight">David Miller (<span className="text-[10px] font-mono">student@example.com</span>)</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Solve open papers, observe timers, review graded certificates.</p>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setCurrentUser({
                              id: "u-2",
                              email: "teacher@example.com",
                              name: "Dr. Sarah Jenkins",
                              role: Role.TEACHER
                            });
                          }}
                          className="p-3.5 bg-slate-50/75 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-200 rounded-xl text-left transition-all flex flex-col justify-between group cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center">
                                <Users className="w-3 h-3" />
                              </div>
                              <span className="text-xs font-bold text-slate-800">Faculty Hub</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-all" />
                          </div>
                          <div className="mt-2">
                            <p className="text-[11px] text-slate-500 leading-tight">Dr. Sarah Jenkins (<span className="text-[10px] font-mono">teacher@example.com</span>)</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Edit exams, track proctor violations, evaluate charts.</p>
                          </div>
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              </div>
            ) : (
              /* Load matched role workspace cleanly and beautifully */
              <div className="space-y-6">
                
                {/* Visual state headers for logged in portals */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-3xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md leading-none">
                        {currentUser.role === Role.STUDENT ? "Student Sandbox" : "Faculty Executive Center"}
                      </span>
                      <span className="text-xs text-slate-400">| Standard Academic Subscription</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
                      Welcome back, {currentUser.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Explore online courses, complete proctored exams, and analyze statistical curves dynamically from the server stream.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shrink-0 w-full md:w-auto">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Session Status</div>
                      <div className="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1.5 leading-none">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        <span>Synchronized</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main portals renders */}
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

      {/* 3. Sleek Commercial Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-16 text-center text-xs text-slate-400" id="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="font-semibold text-slate-500">EduPortal SaaS Assessment Platform Suite.</p>
          <p>© 2026 Commercial License active. Built for professional schools, testing centers, and educational institutes.</p>
          <div className="flex justify-center gap-4 text-[10px] pt-1.5 text-slate-400/80 font-mono">
            <span>PORT 3000 Ingress Operational</span>
            <span>•</span>
            <span>Local Database Server Synced</span>
            <span>•</span>
            <span>Secure TLS Encryption</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
