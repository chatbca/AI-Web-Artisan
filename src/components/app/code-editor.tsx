"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Editor from "@monaco-editor/react";
import type { Code, AppTheme } from "@/app/page";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CodeEditorProps {
  code: Code;
  onCodeChange: (filename: string, newContent: string) => void;
  theme: AppTheme;
  activeFile: string;
  setActiveFile: (filename: string) => void;
}

export function CodeEditor({ code, onCodeChange, theme, activeFile, setActiveFile }: CodeEditorProps) {
  const handleCodeEdit = (value?: string) => {
    onCodeChange(activeFile, value || "");
  };

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    wordWrap: "on" as const,
    scrollBeyondLastLine: false,
    automaticLayout: true,
  };

  const editorTheme = theme === "dark" ? "vs-dark" : "light";

  const allFiles = [
    ...code.pages.map(p => ({filename: p.filename, type: 'html', content: p.html})),
    {filename: 'style.css', type: 'css', content: code.css},
    {filename: 'script.js', type: 'javascript', content: code.js}
  ];

  const currentFile = allFiles.find(f => f.filename === activeFile);

  return (
    <Tabs value={activeFile} onValueChange={setActiveFile} className="w-full h-full flex flex-col">
      <ScrollArea className="w-full">
        <TabsList>
          {allFiles.map(file => (
            <TabsTrigger key={file.filename} value={file.filename}>{file.filename}</TabsTrigger>
          ))}
        </TabsList>
      </ScrollArea>
      <div className="flex-1 mt-2 rounded-md border overflow-hidden">
        {currentFile && (
           <Editor
            key={currentFile.filename}
            height="100%"
            language={currentFile.type}
            theme={editorTheme}
            value={currentFile.content}
            onChange={handleCodeEdit}
            options={editorOptions}
            loading={<Skeleton className="h-full w-full" />}
          />
        )}
      </div>
    </Tabs>
  );
}
