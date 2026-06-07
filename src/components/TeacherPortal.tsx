import React, { useState } from "react";
import { User, Exam, Question, Submission, ExamStats } from "../types";
import { Plus, Trash2, LayoutDashboard, FilePlus, Table, ShieldAlert, CheckCircle2, XCircle, TrendingUp, RefreshCw, BarChart as ChartIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

interface TeacherPortalProps {
  currentUser: User;
  exams: Exam[];
  submissions: Submission[];
  analytics: ExamStats[];
  onRefreshData: () => void;
}

export default function TeacherPortal({
  currentUser,
  exams,
  submissions,
  analytics,
  onRefreshData
}: TeacherPortalProps) {
  const [teacherViewTab, setTeacherViewTab] = useState<'dashboard' | 'create' | 'submissions'>('dashboard');

  // Exam Creator States
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSubject, setNewSubject] = useState("Computer Science");
  const [newDuration, setNewDuration] = useState(15);
  
  // Custom interactive questions collection
  const [newQuestions, setNewQuestions] = useState<Omit<Question, "id">[]>([
    {
      text: "What is the primary feature of Express Node.js framework?",
      options: [
        "Hardware compiler integrations",
        "Lightweight HTTP request middleware routing",
        "Enforcing strict database memory limits",
        "Writing styles inside html structures"
      ],
      correctAnswerIndex: 1,
      points: 10
    }
  ]);

  const [savingExam, setSavingExam] = useState(false);

  // Stats cards calculations
  const totalExams = exams.length;
  const totalSubmissions = submissions.length;
  
  const passedCount = submissions.filter(s => s.passed).length;
  const passingRate = totalSubmissions > 0 ? Number(((passedCount / totalSubmissions) * 100).toFixed(1)) : 0;
  
  const totalWarnings = submissions.reduce((acc, curr) => acc + (curr.tabLeavesWarningCount || 0), 0);

  // Chart data formulation
  const barChartData = analytics.map(stat => ({
    name: stat.examTitle.length > 20 ? stat.examTitle.substring(0, 18) + "..." : stat.examTitle,
    Average: stat.averagePercentage,
    Submissions: stat.totalSubmissions
  }));

  const pieChartData = [
    { name: "Passed", value: passedCount, color: "#10b981" },
    { name: "Failed", value: totalSubmissions - passedCount, color: "#f43f5e" }
  ].filter(c => c.value > 0);

  const handleAddQuestionObj = () => {
    setNewQuestions(prev => [
      ...prev,
      {
        text: "",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswerIndex: 0,
        points: 10
      }
    ]);
  };

  const handleRemoveQuestionObj = (index: number) => {
    if (newQuestions.length <= 1) {
      alert("At least one question is required to create an exam paper!");
      return;
    }
    setNewQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleChangeQuestionText = (index: number, text: string) => {
    setNewQuestions(prev =>
      prev.map((q, i) => (i === index ? { ...q, text } : q))
    );
  };

  const handleChangeQuestionOption = (qIdx: number, optIdx: number, val: string) => {
    setNewQuestions(prev =>
      prev.map((q, i) => {
        if (i === qIdx) {
          const updatedOpts = [...q.options];
          updatedOpts[optIdx] = val;
          return { ...q, options: updatedOpts };
        }
        return q;
      })
    );
  };

  const handleChangeQuestionCorrectIndex = (qIdx: number, optIdx: number) => {
    setNewQuestions(prev =>
      prev.map((q, i) => (i === qIdx ? { ...q, correctAnswerIndex: optIdx } : q))
    );
  };

  const handleChangeQuestionPoints = (qIdx: number, val: number) => {
    setNewQuestions(prev =>
      prev.map((q, i) => (i === qIdx ? { ...q, points: Number(val) || 10 } : q))
    );
  };

  // Submit new examination
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim()) {
      alert("Please supply an Exam Title!");
      return;
    }

    const blanks = newQuestions.filter(q => !q.text.trim());
    if (blanks.length > 0) {
      alert("Please fill in question texts for all selected question cards!");
      return;
    }

    setSavingExam(true);

    try {
      const examData = {
        title: newTitle,
        description: newDescription,
        subject: newSubject,
        durationMinutes: Number(newDuration) || 15,
        questions: newQuestions,
        creatorId: currentUser.id
      };

      const response = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examData)
      });

      if (response.ok) {
        alert("Exam saved successfully in cloud storage!");
        // Reset state
        setNewTitle("");
        setNewDescription("");
        setNewDuration(15);
        setNewQuestions([
          {
            text: "",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswerIndex: 0,
            points: 10
          }
        ]);
        onRefreshData();
        setTeacherViewTab('dashboard');
      } else {
        const err = await response.json();
        alert("Error saving exam: " + err.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to communicate with Express server endpoints.");
    } finally {
      setSavingExam(false);
    }
  };

  return (
    <div className="space-y-6" id="teacher-portal-panel">
      
      {/* Navigation Top Tabs Selection */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-sm gap-2 max-w-md">
        <button
          onClick={() => setTeacherViewTab('dashboard')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all border ${
            teacherViewTab === 'dashboard'
              ? 'bg-indigo-50 text-indigo-700 border-indigo-100 font-bold shadow-2xs'
              : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>

        <button
          onClick={() => setTeacherViewTab('create')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all border ${
            teacherViewTab === 'create'
              ? 'bg-indigo-50 text-indigo-700 border-indigo-100 font-bold shadow-2xs'
              : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <FilePlus className="w-4 h-4" />
          New Exam
        </button>

        <button
          onClick={() => setTeacherViewTab('submissions')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all border ${
            teacherViewTab === 'submissions'
              ? 'bg-indigo-50 text-indigo-700 border-indigo-100 font-bold shadow-2xs'
              : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <Table className="w-4 h-4" />
          Results Table
        </button>
      </div>

      {teacherViewTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Stats Grid layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                {totalExams}
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Active Exams</p>
                <h2 className="text-2xl font-bold text-slate-900 leading-none">{totalExams}</h2>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                {totalSubmissions}
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Submissions</p>
                <h2 className="text-2xl font-bold text-slate-900 leading-none">{totalSubmissions}</h2>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">
                {passingRate}%
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Avg. Score</p>
                <h2 className="text-2xl font-bold text-slate-900 leading-none">{passingRate}%</h2>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg">
                {totalWarnings}
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Security Alerts</p>
                <h2 className="text-2xl font-bold text-slate-900 leading-none">{totalWarnings}</h2>
              </div>
            </div>
          </div>

          {/* Recharts Analytics Displays */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Exam Average Performance Timelines</h3>
                  <p className="text-slate-400 text-xs">Standardized pass-rate percentage average per exam title.</p>
                </div>
                <button onClick={onRefreshData} className="p-1.5 hover:bg-slate-50 border rounded-lg text-slate-500 transition-all">
                  <RefreshCw className="w-3.5 h-3.5 cursor-pointer" />
                </button>
              </div>

              {barChartData.length === 0 ? (
                <div className="h-60 flex items-center justify-center text-slate-400 text-xs">
                  No submissions have been registered to formulate data yet.
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <Tooltip formatter={(value) => [`${value}%`, 'Average Score']} />
                      <Bar dataKey="Average" fill="#6366f1" radius={[4, 4, 0, 0]}>
                        {barChartData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#14b8a6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Pie Chart / Pass distribution representation */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Overall Candidate Results Overview</h3>
                <p className="text-slate-400 text-xs mt-0.5">Passed status vs Retake count metrics.</p>
              </div>

              {pieChartData.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-slate-400 text-xs">
                  Zero metrics collected. Take an exam as a student to see the breakdown.
                </div>
              ) : (
                <div className="h-40 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Absolute Center percentage */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
                    <span className="text-xl font-extrabold text-slate-800">{passingRate}%</span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Pass Rate</span>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100 pt-3 flex gap-4 text-xs font-medium justify-center text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block"></span>
                  <span>Passed ({passedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-rose-500 inline-block"></span>
                  <span>Retake ({totalSubmissions - passedCount})</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {teacherViewTab === 'create' && (
        <form onSubmit={handleSaveExam} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6" id="exam-creation-form">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Generate Standard Assessment</h3>
            <p className="text-slate-400 text-xs mt-0.5">Duly write multiple-choice questions matching standardized course curriculums.</p>
          </div>

          {/* Core Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">EXAM PAPER TITLE</label>
              <input
                type="text"
                required
                placeholder="e.g. Relational Databases Basics"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full text-sm bg-slate-50 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-slate-700 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">SUBJECT CLASSIFICATION</label>
              <select
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                className="w-full text-sm bg-slate-50 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-700"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Algorithms">Algorithms</option>
                <option value="Web Engineering">Web Engineering</option>
                <option value="General Aptitude">General Aptitude</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">TIME LIMIT (MINUTES)</label>
              <input
                type="number"
                min={1}
                required
                value={newDuration}
                onChange={e => setNewDuration(Number(e.target.value) || 15)}
                className="w-full text-sm bg-slate-50 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">DESCRIPTION / DIRECTIONS</label>
            <textarea
              rows={2}
              placeholder="Provide clean instructions, scope parameters, or prerequisites..."
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              className="w-full text-sm bg-slate-50 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-700"
            />
          </div>

          {/* Interactive Multiple-Choice Questions Fields */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-slate-800 font-bold text-sm">Questions Deck ({newQuestions.length})</h4>
              <button
                type="button"
                onClick={handleAddQuestionObj}
                className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Question Card
              </button>
            </div>

            {newQuestions.map((q, qIndex) => (
              <div key={qIndex} className="p-5 border border-slate-200/75 rounded-xl bg-slate-50 space-y-4 shadow-xs relative">
                
                {/* Deletes Question Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveQuestionObj(qIndex)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 transition-all p-1.5 hover:bg-rose-50 rounded-lg"
                  title="Remove this question"
                >
                  <Trash2 className="w-4 h-4 cursor-pointer" />
                </button>

                {/* Question Info parameters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Question Text #{qIndex + 1}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Which algorithm does Binary Search utilize?"
                      value={q.text}
                      onChange={e => handleChangeQuestionText(qIndex, e.target.value)}
                      className="w-full text-sm bg-white border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-600 text-slate-700 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Points Value</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={q.points}
                      onChange={e => handleChangeQuestionPoints(qIndex, Number(e.target.value))}
                      className="w-full text-sm bg-white border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-600 text-slate-700"
                    />
                  </div>
                </div>

                {/* Multiple Options collection */}
                <div className="space-y-2">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Answer Options & Correct Option Radio</label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2 bg-white p-2 border rounded-lg shadow-2xs">
                        {/* Radio select correct answer */}
                        <input
                          type="radio"
                          name={`correct-answer-radio-${qIndex}`}
                          checked={q.correctAnswerIndex === optIndex}
                          onChange={() => handleChangeQuestionCorrectIndex(qIndex, optIndex)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={e => handleChangeQuestionOption(qIndex, optIndex, e.target.value)}
                          className="flex-1 bg-transparent px-1 text-xs text-slate-700 focus:outline-none focus:border-b focus:border-slate-300 font-semibold"
                        />
                        <span className="text-[10px] text-slate-300 font-mono">#{String.fromCharCode(65 + optIndex)}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>

          <div className="border-t pt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setTeacherViewTab('dashboard')}
              className="px-4 py-2 border rounded-lg hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-all"
            >
              Cancel Creation
            </button>
            <button
              type="submit"
              disabled={savingExam}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-lg text-sm transition-all shadow-sm shadow-indigo-600/20 disabled:opacity-50"
            >
              {savingExam ? "Saving Question Deck..." : "Save Assessment"}
            </button>
          </div>
        </form>
      )}

      {teacherViewTab === 'submissions' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800">Dynamic Submissions Table</h3>
            <p className="text-slate-400 text-xs mt-0.5">Real-time compilation of raw evaluations, scores, and proctored security feedback.</p>
          </div>

          {submissions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed rounded-xl">
              No exam attempts are currently registered. Try answering an assessment as a student beforehand!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500 border border-slate-100 rounded-lg">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-100 select-none font-bold">
                  <tr>
                    <th scope="col" className="px-6 py-4">Student</th>
                    <th scope="col" className="px-6 py-4">Assessment</th>
                    <th scope="col" className="px-6 py-4">Subject</th>
                    <th scope="col" className="px-6 py-4">Points</th>
                    <th scope="col" className="px-6 py-4">Percentage</th>
                    <th scope="col" className="px-6 py-4">Proctor Warnings</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-all font-medium text-slate-600">
                      <td className="px-6 py-4 font-bold text-slate-800">{sub.studentName}</td>
                      <td className="px-6 py-4">{sub.examTitle}</td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-50 text-indigo-700 font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                          {sub.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{sub.score} / {sub.totalPoints}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">{sub.percentage}%</td>
                      <td className="px-6 py-4">
                        {sub.tabLeavesWarningCount > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 font-bold px-2 py-0.5 rounded text-[10px] animate-pulse">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                            {sub.tabLeavesWarningCount} Alerts
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-normal">0 warnings</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {sub.passed ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold leading-none">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-1 rounded-full text-xs font-bold leading-none">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Retake
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
