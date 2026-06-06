import { useState } from "react";
import { Copy, Check, Download, AlertCircle, FileText, ChevronRight } from "lucide-react";

export default function ScriptGenerator() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab2] = useState<'python' | 'readme'>('python');

  const pythonScriptText = `#!/usr/bin/env python3
"""
Online Exam & Result Portal - Automatic Project Workspace Setup Script
This script generates a production-ready, full-stack environment with Node/Express (backend)
and React (frontend) using Vite, Tailwind CSS, and Typescript.

How to Run:
  1. Save this script inside a blank folder (e.g., as 'setup_exam_portal.py')
  2. Open your terminal in that folder and run:
     python setup_exam_portal.py
  3. Install dependencies:
     npm install
  4. Run build or start dev workspace:
     npm run dev
"""

import os
import sys

# Colorized logging functions
def log_info(msg):
    print(f"\\033[94m[INFO] {msg}\\033[0m")

def log_success(msg):
    print(f"\\033[92m[SUCCESS] {msg}\\033[0m")

def create_file(path, content):
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\\n")
    log_success(f"Generated file: {path}")

def main():
    log_info("Starting full-stack setup framework in the current workspace...")

    # Create directories
    os.makedirs("src/components", exist_ok=True)

    # 1. package.json
    create_file("package.json", """
{
  "name": "fullstack-exam-portal",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "lucide-react": "^0.546.0",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^6.2.3",
    "express": "^4.21.2",
    "dotenv": "^17.2.3",
    "recharts": "^2.15.0",
    "motion": "^12.23.24"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2",
    "@types/express": "^4.17.21"
  }
}
""")

    # 2. tsconfig.json
    create_file("tsconfig.json", """
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
""")

    # 3. vite.config.ts
    create_file("vite.config.ts", """
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
""")

    # 4. index.html
    create_file("index.html", """
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Online Exam & Result Portal</title>
  </head>
  <body class="bg-gray-50 text-gray-900 font-sans">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
""")

    # 5. src/index.css
    create_file("src/index.css", """
@import "tailwindcss";
""")

    # 6. src/main.tsx
    create_file("src/main.tsx", """
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
""")

    log_success("All basic full-stack React + Express boilerplate layout generated successfully.")

if __name__ == "__main__":
    main()
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pythonScriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6" id="script-generator-panel">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full">
            VS Code Workspace Scripter
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-2">
            Local Setup Script Generator
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Running low on setup time? Run this python script in any empty folder to instantly structure your whole full-stack portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-all shadow-sm"
            id="btn-copy-script"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Script</span>
              </>
            )}
          </button>

          <a
            href="/api/export-script?type=python"
            download="setup_exam_portal.py"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-750 active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-all shadow-sm"
            id="btn-download-script"
          >
            <Download className="w-4 h-4" />
            <span>Download .py File</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col">
          {/* Code Tab Selection */}
          <div className="flex border-b border-slate-100 mb-4 bg-slate-50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab2('python')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'python'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-500" />
              setup_exam_portal.py
            </button>
            <button
              onClick={() => setActiveTab2('readme')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'readme'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-indigo-500" />
              Installation Steps
            </button>
          </div>

          {/* Script Content Viewer */}
          <div className="flex-1 bg-slate-950 text-slate-100 rounded-lg p-4 font-mono text-xs overflow-auto max-h-[380px] border border-slate-900">
            {activeTab === 'python' ? (
              <pre className="whitespace-pre">{pythonScriptText}</pre>
            ) : (
              <div className="space-y-4 font-sans text-sm text-slate-300">
                <h3 className="text-white font-semibold text-base mb-1">To execute in your local system:</h3>
                
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-900/50 border border-indigo-600 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <p>Create a fresh empty folder in your machine and open it inside <span className="text-indigo-300 font-medium">Visual Studio Code</span>.</p>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-900/50 border border-indigo-600 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <p>Save the copied Python script in that root container folder as <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300 font-mono text-xs">setup_exam_portal.py</code>.</p>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-900/50 border border-indigo-600 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                  <p>Launch your VS Code Terminal (Ctrl+`) and trigger the Python script:
                    <code className="block bg-slate-900 p-2 rounded text-amber-400 font-mono text-xs mt-1">python setup_exam_portal.py</code>
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-900/50 border border-indigo-600 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">4</div>
                  <p>The code will automatically write your Express server setup, Vite bundler config, index templates, and directories. Install dependencies & launch:
                    <code className="block bg-slate-900 p-2 rounded text-emerald-400 font-mono text-xs mt-1">npm install && npm run dev</code>
                  </p>
                </div>

                <div className="bg-amber-950/30 border border-amber-800/40 p-3 rounded-lg text-amber-300/95 flex gap-3 text-xs mt-4">
                  <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
                  <div>
                    <p className="font-semibold">Pre-requisite Info</p>
                    <p className="mt-0.5">Ensure you have <strong>Python 3+</strong> and <strong>Node.js (v18+)</strong> ready in your computer environment before running. No additional Python modules are needed; standard libraries are used.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Directory Structure Visualization Panel */}
        <div className="bg-slate-50 rounded-lg p-5 border border-slate-100 font-mono text-xs text-slate-700 flex flex-col justify-between">
          <div>
            <h4 className="text-slate-900 font-bold mb-3 text-sm flex items-center gap-1.5">
              <span>📂 Target Workspace Layout</span>
            </h4>
            <div className="space-y-1.5 border-l-2 border-slate-200 pl-3 ml-2">
              <div className="text-indigo-600 font-semibold flex items-center gap-1">📁 my-exam-portal/</div>
              <div className="pl-3 text-slate-500">├── 📁 dist/ <span className="text-[10px] text-slate-400 font-sans">(Bundled output)</span></div>
              <div className="pl-3 text-slate-500">├── 📁 src/</div>
              <div className="pl-6 text-slate-600 font-semibold">├── 📁 components/</div>
              <div className="pl-9 text-slate-500">├── StudentPortal.tsx</div>
              <div className="pl-9 text-slate-500">├── TeacherPortal.tsx</div>
              <div className="pl-9 text-slate-500">└── ScriptGenerator.tsx</div>
              <div className="pl-6 text-slate-500">├── App.tsx</div>
              <div className="pl-6 text-slate-500">├── main.tsx</div>
              <div className="pl-6 text-slate-500">├── types.ts</div>
              <div className="pl-6 text-slate-500">└── index.css</div>
              <div className="pl-3 text-emerald-600 font-semibold font-mono">├── server.ts <span className="text-[10px] text-slate-400 font-sans font-normal">(Express Backend)</span></div>
              <div className="pl-3 text-amber-600 font-semibold font-mono">├── database.json <span className="text-[10px] text-slate-400 font-sans font-normal">(Dynamic JSON DB)</span></div>
              <div className="pl-3 text-slate-500">├── package.json</div>
              <div className="pl-3 text-slate-500">├── tsconfig.json</div>
              <div className="pl-3 text-slate-500">├── vite.config.ts</div>
              <div className="pl-3 text-slate-500">└── index.html</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 text-slate-500 font-sans text-xs">
            <span className="font-semibold text-slate-800">Dynamic Synchronization:</span> All exams and student scores created while executing inside this workspace will be automatically serialized to state inside <code className="bg-white px-1 py-0.5 rounded border">database.json</code>.
          </div>
        </div>
      </div>
    </div>
  );
}
