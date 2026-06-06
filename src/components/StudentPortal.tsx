import { useState, useEffect, useRef } from "react";
import { User, Exam, AnswerSelection, Submission } from "../types";
import { Calendar, Clock, Award, FileSpreadsheet, Search, CheckCircle, AlertTriangle, ArrowRight, ShieldAlert, Award as Trophy } from "lucide-react";

interface StudentPortalProps {
  currentUser: User;
  exams: Exam[];
  submissions: Submission[];
  onRefreshData: () => void;
  activeExamId: string | null;
  setActiveExamId: (id: string | null) => void;
}

export default function StudentPortal({
  currentUser,
  exams,
  submissions,
  onRefreshData,
  activeExamId,
  setActiveExamId
}: StudentPortalProps) {
  // Navigation / Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  // Exam taking state
  const [currentQuestionsAnswers, setCurrentQuestionsAnswers] = useState<AnswerSelection[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState<Submission | null>(null);

  // Certificate modal state
  const [activeCertificateSubmission, setActiveCertificateSubmission] = useState<Submission | null>(null);

  // Find unique subject lists
  const subjects = ["all", ...Array.from(new Set(exams.map(e => e.subject)))];

  // Selected Exam object
  const activeExam = exams.find(e => e.id === activeExamId);

  // Set up tab-switching cheating prevention trigger
  useEffect(() => {
    if (!activeExamId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabWarnings(prev => {
          const updated = prev + 1;
          return updated;
        });
      }
    };

    const handleWindowBlur = () => {
      setTabWarnings(prev => {
        const updated = prev + 1;
        return updated;
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [activeExamId]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!activeExamId || !activeExam) return;

    // Set initial duration
    setTimeLeft(activeExam.durationMinutes * 60);
    setCurrentQuestionIndex(0);
    setTabWarnings(0);
    setCurrentQuestionsAnswers(
      activeExam.questions.map(q => ({ questionId: q.id, selectedOptionIndex: -1 }))
    );

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto submit when time runs out!
          triggerAutomaticSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeExamId]);

  const startExam = (exam: Exam) => {
    setActiveExamId(exam.id);
    setJustSubmitted(null);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setCurrentQuestionsAnswers(prev =>
      prev.map(item =>
        item.questionId === questionId
          ? { ...item, selectedOptionIndex: optionIndex }
          : item
      )
    );
  };

  const triggerAutomaticSubmission = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    // Read current values with safety fallback on state latency
    const answersToSend = currentQuestionsAnswers;
    const finalWarnings = tabWarnings;

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: activeExamId,
          studentId: currentUser.id,
          studentName: currentUser.name,
          answers: answersToSend,
          tabLeavesWarningCount: finalWarnings
        })
      });

      if (response.ok) {
        const result = await response.json();
        setJustSubmitted(result);
        setActiveExamId(null);
        onRefreshData();
      }
    } catch (e) {
      console.error("Submission failed", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitExamClick = async () => {
    // Confirm if not all answered
    const unansweredCount = currentQuestionsAnswers.filter(a => a.selectedOptionIndex === -1).length;
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered questions. Are you sure you want to finish and submit?`
      );
      if (!confirmSubmit) return;
    } else {
      const confirmSubmit = window.confirm("Are you sure you want to submit your exam?");
      if (!confirmSubmit) return;
    }

    await triggerAutomaticSubmission();
  };

  // Convert time count to hh:mm:ss format
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Query / filters
  const filteredExams = exams.filter(exam => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === "all" || exam.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const getStudentSubmissions = () => {
    return submissions.filter(s => s.studentId === currentUser.id);
  };

  const mySubmissions = getStudentSubmissions();

  return (
    <div className="space-y-6" id="student-portal-wrapper">
      {/* 1. Exam Setup or Taking Container */}
      {activeExamId && activeExam ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" id="active-exam-container">
          {/* Proctoring cheating prevention bar */}
          <div className="bg-amber-500 text-white px-6 py-2.5 flex items-center justify-between text-xs font-semibold gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 animate-bounce" />
              <span>SECURITY MONITOR ACTIVE: Do NOT minimize or switch tabs! Tab changes are monitored and reported.</span>
            </div>
            {tabWarnings > 0 && (
              <span className="bg-amber-700/80 px-2 py-1 rounded inline-flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Warnings: {tabWarnings}
              </span>
            )}
          </div>

          {/* Exam Header */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50">
            <div>
              <span className="text-xs font-bold text-indigo-700 uppercase bg-indigo-50 px-2.5 py-1 rounded">
                {activeExam.subject}
              </span>
              <h2 className="text-xl font-bold text-slate-800 mt-2">{activeExam.title}</h2>
              <p className="text-slate-500 text-xs mt-1">Candidate: <span className="font-semibold text-slate-700">{currentUser.name}</span></p>
            </div>

            <div className="flex items-center gap-6">
              {/* Countdown timer */}
              <div className="text-center bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-xs">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Time Remaining</div>
                <div className={`text-xl font-mono font-bold mt-0.5 ${timeLeft < 60 ? "text-rose-600 animate-pulse" : "text-slate-700"}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>

              <div className="text-center bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-xs">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Question Level</div>
                <div className="text-xl font-bold mt-0.5 text-indigo-600">
                  {currentQuestionIndex + 1} / {activeExam.questions.length}
                </div>
              </div>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / activeExam.questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left/Middle: Current Question Display */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/60 max-w-none">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-3">
                  <span>QUESTION {currentQuestionIndex + 1}</span>
                  <span className="font-mono text-indigo-600 font-bold">{activeExam.questions[currentQuestionIndex].points} Points</span>
                </div>
                <h3 className="text-slate-800 font-semibold text-base md:text-lg select-none leading-relaxed">
                  {activeExam.questions[currentQuestionIndex].text}
                </h3>
              </div>

              {/* Options selection */}
              <div className="space-y-3">
                {activeExam.questions[currentQuestionIndex].options.map((opt, i) => {
                  const isSelected =
                    currentQuestionsAnswers[currentQuestionIndex]?.selectedOptionIndex === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(activeExam.questions[currentQuestionIndex].id, i)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 select-none ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-medium shadow-xs"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border shrink-0 flex items-center justify-center font-bold text-xs mt-0.5 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-300 text-slate-400"
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-sm md:text-base">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controller */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium transition-all disabled:opacity-40 disabled:hover:bg-white"
                >
                  Previous Question
                </button>

                {currentQuestionIndex < activeExam.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(activeExam.questions.length - 1, prev + 1))}
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-750 text-white text-sm font-medium transition-all shadow-xs"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitExamClick}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-750 text-white text-sm font-bold transition-all shadow-md animate-pulse focus:scale-95"
                  >
                    {submitting ? "Submitting..." : "Finish and Submit"}
                  </button>
                )}
              </div>
            </div>

            {/* Right Side: Questions Matrix / Palette */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider mb-4">
                Questions Grid
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {activeExam.questions.map((_, i) => {
                  const answer = currentQuestionsAnswers[i];
                  const hasAnswered = answer && answer.selectedOptionIndex !== -1;
                  const isCurrent = currentQuestionIndex === i;

                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentQuestionIndex(i)}
                      className={`aspect-square rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center ${
                        isCurrent
                          ? "bg-indigo-600 text-white shadow-xs scale-105"
                          : hasAnswered
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-5 border-t border-slate-200 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Answered Question</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded border border-slate-300 bg-white inline-block"></span>
                  <span>Unanswered Question</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-indigo-600 inline-block"></span>
                  <span>Active Selection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Recent Exam submission callback announcement */}
          {justSubmitted && (
            <div className="bg-white border text-slate-800 border-slate-200/80 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 outline outline-4 outline-emerald-50 shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900 text-lg">Exam Submitted Successfully!</h3>
                  <p className="text-emerald-700 text-sm mt-1">
                    Your answers were calculated. You scored <span className="font-bold">{justSubmitted.score} out of {justSubmitted.totalPoints} points</span> ({justSubmitted.percentage}%).
                  </p>
                  <p className="text-emerald-600 text-xs mt-1">
                    Proctor warnings logged: <span className="font-semibold text-slate-700">{justSubmitted.tabLeavesWarningCount} instances</span>.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {justSubmitted.passed ? (
                  <button
                    onClick={() => setActiveCertificateSubmission(justSubmitted)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-750 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Trophy className="w-4 h-4 text-emerald-100" />
                    Claim Certificate
                  </button>
                ) : (
                  <span className="bg-amber-100 text-amber-800 font-semibold px-3 py-1.5 rounded-lg text-xs">
                    Please practice and try again!
                  </span>
                )}
                <button
                  onClick={() => setJustSubmitted(null)}
                  className="px-3 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* 2. Standard Student View: Exams and score lists split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Active Exams for you to take */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Available Examination Papers</h3>
                  <p className="text-slate-500 text-xs">Select any open subject to begin taking your secure timed test.</p>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    {subjects.map(sub => (
                      <option key={sub} value={sub}>
                        {sub === "all" ? "All Subjects" : sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exam Card List Grid */}
              {filteredExams.length === 0 ? (
                <div className="bg-white border rounded-xl p-10 text-center text-slate-400">
                  <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium">No matches correspond with your search subject filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredExams.map(exam => {
                    const hasSubmitted = mySubmissions.some(s => s.examId === exam.id);
                    return (
                      <div
                        key={exam.id}
                        className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-400/50 hover:shadow-xs transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1.5 mb-3">
                            <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 rounded">
                              {exam.subject}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {exam.durationMinutes} Min
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-800 text-sm leading-snug">{exam.title}</h4>
                          <p className="text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                            {exam.description}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            Points: <strong className="text-slate-700">{exam.totalPoints}</strong>
                          </span>

                          {hasSubmitted ? (
                            <span className="bg-slate-100 text-slate-500 font-semibold px-3 py-1.5 rounded-lg text-xs cursor-not-allowed">
                              Completed
                            </span>
                          ) : (
                            <button
                              onClick={() => startExam(exam)}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm hover:translate-x-0.5 transition-all"
                            >
                              Take Exam
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Left: Private Student Records Scoreboard */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Your Submission Scorecard</h3>
                <p className="text-slate-400 text-xs mb-4">Official list of completed exams representing your credentials.</p>

                {mySubmissions.length === 0 ? (
                  <div className="text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No active attempts have been completed yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mySubmissions.map(sub => (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-2 hover:bg-white transition-all shadow-xs"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-slate-700 text-xs truncate max-w-[150px]" title={sub.examTitle}>
                              {sub.examTitle}
                            </h4>
                            <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded shrink-0 ${
                              sub.passed
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}>
                              {sub.passed ? "Passed" : "Retake"}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                            <span>{sub.subject}</span>
                            <span>•</span>
                            <span>Points: {sub.score}/{sub.totalPoints}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-slate-700">
                            {sub.percentage}%
                          </span>

                          {sub.passed && (
                            <button
                              onClick={() => setActiveCertificateSubmission(sub)}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                            >
                              <Trophy className="w-3.5 h-3.5" />
                              Award Card
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 3. Certificate vector rendering Modal Popover */}
      {activeCertificateSubmission && (
        <div className="fixed inset-0 bg-slate-900/60 back-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-auto">
            
            <button
              onClick={() => setActiveCertificateSubmission(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-1.5 rounded-full"
            >
              ✕
            </button>

            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mx-auto border-4 border-indigo-100/50">
                <Trophy className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800">Honorary Certificate Claimed</h3>
                <p className="text-slate-400 text-xs mt-1">This official document guarantees qualification completion.</p>
              </div>

              {/* Printable Vector Certificate */}
              <div className="border-[8px] border-double border-indigo-900 bg-amber-50/20 p-5 rounded-lg text-center font-serif relative" id="vector-certificate">
                <div className="absolute top-2 left-2 text-[10px] text-indigo-900/40 uppercase tracking-widest font-sans font-bold">Official Certificate</div>
                
                <h2 className="text-xl font-serif text-indigo-950 font-semibold tracking-wide">Certificate of Excellence</h2>
                <p className="text-[10px] uppercase font-sans tracking-widest text-slate-500 mt-2">DULY PRESENTED TO</p>
                
                <h3 className="text-lg font-serif italic text-slate-800 border-b border-slate-300 w-3/4 mx-auto pb-1 mt-2 mb-3">
                  {activeCertificateSubmission.studentName}
                </h3>

                <p className="text-xs text-slate-500 leading-normal font-sans">
                  for successfully completing the standardized assessment:
                </p>
                <h4 className="font-sans font-bold text-sm text-indigo-950 mt-1 mb-3">
                  {activeCertificateSubmission.examTitle}
                </h4>

                <p className="text-xs text-slate-500 font-sans">
                  with an aggregate score metric of <strong className="text-emerald-700 text-sm">{activeCertificateSubmission.percentage}%</strong> 
                  ({activeCertificateSubmission.score} / {activeCertificateSubmission.totalPoints} points)
                </p>

                <div className="flex justify-between items-end mt-6 pt-4 border-t border-slate-200 font-sans text-[10px] text-slate-400">
                  <div className="text-left">
                    <p>Date Issued: {new Date(activeCertificateSubmission.submittedAt).toLocaleDateString()}</p>
                    <p>Auth Ref: {activeCertificateSubmission.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="border-b border-slate-300 pb-1 italic text-slate-600">Sarah Jenkins</p>
                    <p className="mt-1">Examiner Signature</p>
                  </div>
                </div>
              </div>

              {/* Dismiss footer button */}
              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg text-xs font-semibold shadow-sm mt-4 hover:shadow transition-all"
              >
                Print Certificate / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
