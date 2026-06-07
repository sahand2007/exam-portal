import React, { useState, useEffect } from "react";
import { User, Exam, Submission, ExamStats, Role } from "./types";
import StudentPortal from "./components/StudentPortal";
import TeacherPortal from "./components/TeacherPortal";
import ScriptGenerator from "./components/ScriptGenerator";
import { GraduationCap, ShieldAlert, Award, FileCode, Users, LogIn, ArrowLeftRight, HelpCircle, AlertCircle, RefreshCw } from "lucide-react";

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
  const [allUsers, setAllUsers] = useState<User[]>([]); // Bo login krdni custom
  
  const [activeTab, setActiveTab] = useState<'portal' | 'exporter'>('portal');
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Custom mock login credentials values
  const [loginEmail, setLoginEmail] = useState("");
  const [loginRole, setLoginRole] = useState<'student' | 'teacher'>('student');
  const [authError, setAuthError] = useState("");

  // Retrieve states from static JSON file db in public folder
  const refreshAppData = async () => {
    try {
      // Fetch krdni daka lagal Vercel rasta wxo la public folder
      const response = await fetch("/database.json");
      if (!response.ok) {
        throw new Error("Failed to fetch database.json");
      }
      const data = await response.json();
      
      // Dabe کردنی داتاکان بۆ ستیتە جیاوازەکان وەک کۆدە کۆنەکەت
      if (data.exams) setExams(data.exams);
      if (data.submissions) setSubmissions(data.submissions);
      if (data.analytics) setAnalytics(data.analytics);
      if (data.users) setAllUsers(data.users);

    } catch (err) {
      console.error("Failed fetching database file from public folder", err);
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

    // Login krdni loka`ly ba bē server la regey fyli database.json
    const matchedUser = allUsers.find(
      u => u.email.toLowerCase() === loginEmail.trim().toLowerCase() && 
      u.role.toLowerCase() === loginRole.toLowerCase()
    );

    if (matchedUser) {
      setCurrentUser(matchedUser);
      setAuthError("");
      setLoginEmail("");
      setActiveExamId(null);
      refreshAppData();
    } else {
      setAuthError("Email and role mismatch! Use student@example.com or teacher@example.com");
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
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900" id="applet-container">
      
      {/* Dynamic Header navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm" id="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">ExamFlow <span className="text-indigo-600 text-sm font-semibold">Pro</span></h1>
                <div className="flex items-center gap-2 mt-1 leading-none">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Online Portal</span>
                  <div className="flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-[8px] font-bold text-emerald-600">LIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle navigation tabs */}
            {currentUser && !activeExamId && (
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('portal')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    activeTab === 'portal'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  Academic Portal
                </button>
                <button
                  onClick={() => setActiveTab('exporter')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                    activeTab === 'exporter'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-855'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-amber-500" />
                  Local setup script
                </button>
              </div>
            )}

            {/* Profile switch banner */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-bold text-slate-800">{currentUser.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentUser.role} Account</div>
                  </div>

                  {!activeExamId && (
                    <button
                      onClick={handleRoleQuickSwitch}
                      title="Quick Switch Personas for Testing"
                      className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                      <span className="hidden sm:inline">Role Switch</span>
                    </button>
                  )}

                  {!activeExamId && (
                    <button
                      onClick={() => setCurrentUser(null)}
                      className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2.5 py-1.5 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      Log Out
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded">Interactive Preview</span>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-medium">Synchronizing dynamic cloud assets...</p>
          </div>
        ) : (
          <>
            {/* If not authenticated, show simulated login panel */}
            {!currentUser ? (
              <div className="max-w-md mx-auto my-12" id="login-layout-panel">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                  
                  {/* Decorative headbar */}
                  <div className="bg-indigo-600 p-6 text-white text-center">
                    <GraduationCap className="w-12 h-12 mx-auto mb-2 text-indigo-100" />
                    <h2 className="text-xl font-extrabold tracking-tight">Access Examination Portal</h2>
                    <p className="text-indigo-200 text-xs mt-1">Multi-Role Access Setup Screen & Testing Suite</p>
                  </div>

                  <div className="p-6 space-y-6">
                    <form onSubmit={handleCustomLogin} className="space-y-4">
                      {authError && (
                        <div className="bg-rose-50 text-rose-700 border border-rose-100 p-3 rounded-lg text-xs font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                          <span>{authError}</span>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">EMAIL ADDRESS</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. student@example.com (or teacher@...)"
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                          className="w-full text-sm bg-slate-50 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-705 transition-all font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">ROLE LEVEL SELECTION</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setLoginRole('student')}
                            className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                              loginRole === 'student'
                                ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-bold"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            Student view
                          </button>
                          <button
                            type="button"
                            onClick={() => setLoginRole('teacher')}
                            className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                              loginRole === 'teacher'
                                ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-bold"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            Teacher/Admin view
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-755 text-white font-bold text-sm rounded-lg transition-all shadow-md shadow-indigo-600/15"
                      >
                        Enter Portal Console
                      </button>
                    </form>

                    <div className="border-t pt-4 text-center">
                      <span className="text-slate-400 text-xs">Or choose a pre-configured quick account:</span>
                      <div className="flex gap-2 mt-3 justify-center">
                        <button
                          onClick={() => {
                            setCurrentUser({
                              id: "u-1",
                              email: "student@example.com",
                              name: "David Miller",
                              role: Role.STUDENT
                            });
                          }}
                          className="px-3 py-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-all flex items-center gap-1"
                        >
                          <Users className="w-3.5 h-3.5 text-indigo-500" />
                          Student Mock (David)
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
                          className="px-3 py-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-all flex items-center gap-1"
                        >
                          <Users className="w-3.5 h-3.5 text-teal-500" />
                          Teacher Mock (Sarah)
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg text-slate-500 text-[11px] leading-relaxed flex gap-2">
                      <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <span><strong>Testing Note:</strong> Feel free to toggle between roles in the nav bar at any time to review student submissions, verify live-graded results, or inspect teachers analytics dashboards instantly.</span>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              /* If authenticated, load matched navigation path container */
              <>
                {activeTab === 'portal' ? (
                  currentUser.role === Role.STUDENT ? (
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
                  )
                ) : (
                  <ScriptGenerator />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Styled system footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400">
        <p>© 2026 Full-Stack Online Exam & Result Portal System. Port 3000 Ingress Operational.</p>
        <p className="mt-1">Generated and loaded from database.json persistent stream.</p>
      </footer>

    </div>
  );
}