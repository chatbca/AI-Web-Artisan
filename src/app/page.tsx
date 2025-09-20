"use client";

import { useState, useEffect, useTransition } from "react";
import { AppHeader } from "@/components/app/app-header";
import { CodeEditor } from "@/components/app/code-editor";
import { LivePreview } from "@/components/app/live-preview";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateWebsite } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileManager } from "@/components/app/file-manager";

export type ViewMode = "split" | "code" | "preview";
export type Device = "desktop" | "tablet" | "mobile";
export type AppTheme = "light" | "dark";

export type Page = {
  filename: string;
  html: string;
};

export type Code = {
  pages: Page[];
  css: string;
  js: string;
};

const initialCode: Code = {
  pages: [
    {
      filename: "index.html",
      html: `
<div class="container">
  <h1>Welcome to AI Web Artisan</h1>
  <p>Enter a prompt in the sidebar to generate a website with AI.</p>
  <p>You can describe what you want, like "a portfolio for a photographer with an about page" or "a landing page for a new SaaS product."</p>
</div>
`,
    },
  ],
  css: `
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  background-color: #f0f2f5;
  color: #333;
}
.container {
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}
h1 {
  font-size: 2.5rem;
  color: #1a73e8;
}
`,
  js: `console.log("Welcome to AI Web Artisan!");`,
};

export default function Home() {
  const [code, setCode] = useState<Code>(initialCode);
  const [view, setView] = useState<ViewMode>("split");
  const [device, setDevice] = useState<Device>("desktop");
  const [appTheme, setAppTheme] = useState<AppTheme>("light");
  const [prompt, setPrompt] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const [activeFile, setActiveFile] = useState<string>("index.html");

  useEffect(() => {
    document.documentElement.className = appTheme;
  }, [appTheme]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const result = await generateWebsite(prompt);
        if (result) {
          setCode(result.code);
          setAppTheme(result.theme);
          setActiveFile(result.code.pages[0]?.filename || "index.html");
          toast({
            title: "Success!",
            description: "Your website has been generated.",
          });
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: error.message,
        });
      }
    });
  };
  
  const handleCodeChange = (filename: string, newContent: string) => {
    if(filename === 'style.css') {
      setCode(prev => ({...prev, css: newContent}));
    } else if (filename === 'script.js') {
       setCode(prev => ({...prev, js: newContent}));
    } else {
       setCode(prev => ({
        ...prev,
        pages: prev.pages.map(p => p.filename === filename ? {...p, html: newContent} : p)
      }));
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      <AppHeader
        code={code}
        view={view}
        setView={setView}
        device={device}
        setDevice={setDevice}
      />
      <main className="flex-1 grid md:grid-cols-2 overflow-hidden">
        <div
          className={cn(
            "flex flex-col p-4 gap-4 transition-all duration-300",
            view === 'preview' && 'hidden md:hidden',
            view === 'code' && 'md:col-span-2',
            view === 'split' && 'md:col-span-1'
          )}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Textarea
              placeholder="e.g., A portfolio website for a software engineer with a contact form and dark mode."
              className="flex-1 resize-none h-28 text-base"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button type="submit" disabled={isPending}>
              <Wand2 className="mr-2 h-4 w-4" />
              {isPending ? "Generating..." : "Generate Website"}
            </Button>
          </form>
           <Tabs defaultValue="code" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
            </TabsList>
            <TabsContent value="code" className="flex-1 mt-2 rounded-md overflow-hidden">
               <Card className="flex-1 flex flex-col h-full">
                <CardContent className="p-0 flex-1">
                  {isPending ? (
                    <div className="p-4 space-y-4">
                      <Skeleton className="h-8 w-1/3" />
                      <Skeleton className="h-48 w-full" />
                    </div>
                  ) : (
                    <CodeEditor
                      code={code}
                      onCodeChange={handleCodeChange}
                      theme={appTheme}
                      activeFile={activeFile}
                      setActiveFile={setActiveFile}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="assets" className="flex-1 mt-2 rounded-md overflow-hidden">
               <Card className="flex-1 flex flex-col h-full">
                <CardContent className="p-0 flex-1">
                  <FileManager />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div
          className={cn(
            "flex flex-col p-4 gap-4 transition-all duration-300",
             view === 'code' && 'hidden md:hidden',
             view === 'preview' && 'md:col-span-2',
             view === 'split' && 'md:col-span-1'
          )}
        >
           <Card className="flex-1">
            <CardContent className="p-0 h-full">
              {isPending ? (
                <div className="p-4">
                   <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <LivePreview code={code} device={device} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
