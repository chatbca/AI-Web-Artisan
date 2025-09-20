"use client";

import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Code, Device, Page } from "@/app/page";

interface LivePreviewProps {
  code: Code;
  device: Device;
}

const deviceStyles: Record<Device, string> = {
  desktop: "w-full h-full",
  tablet: "w-[768px] h-[1024px] border-4 border-gray-700 rounded-2xl shadow-xl",
  mobile: "w-[375px] h-[667px] border-4 border-gray-800 rounded-2xl shadow-xl",
};

export function LivePreview({ code, device }: LivePreviewProps) {
  const [activePage, setActivePage] = useState<Page>(
    code.pages.find(p => p.filename === 'index.html') || code.pages[0]
  );
  
  useEffect(() => {
    // Reset to index.html when code changes if it exists, otherwise first page
     const newActivePage = code.pages.find(p => p.filename === 'index.html') || code.pages[0];
     if (newActivePage) {
        setActivePage(newActivePage);
     }
  }, [code]);

  const srcDoc = useMemo(() => {
    if (!activePage) return "";

    const hasAssets = activePage.html.includes("/assets/");
    const baseTag = hasAssets ? `<base href="${window.location.origin}">` : '';

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseTag}
          <style>${code.css}</style>
          <script>
            document.addEventListener('DOMContentLoaded', () => {
              document.addEventListener('click', e => {
                const anchor = e.target.closest('a');
                if (anchor && anchor.href && anchor.target !== '_blank') {
                  e.preventDefault();
                  const targetPage = anchor.getAttribute('href').replace(/^\\//, '');
                   window.parent.postMessage({ type: 'navigate', page: targetPage }, '*');
                }
              });
            });
          </script>
        </head>
        <body>
          ${activePage.html}
          <script>${code.js}</script>
        </body>
        </html>
      `;
  }, [code, activePage]);

   useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'navigate') {
        const newPage = code.pages.find(p => p.filename === event.data.page);
        if (newPage) {
          setActivePage(newPage);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [code.pages]);


  return (
    <div className="w-full h-full bg-muted flex items-center justify-center p-4 overflow-auto rounded-md">
      <div
        className={cn(
          "bg-white transition-all duration-300 ease-in-out",
          deviceStyles[device]
        )}
      >
        <iframe
          key={activePage?.filename}
          srcDoc={srcDoc}
          title="Live Preview"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          className="w-full h-full"
          frameBorder="0"
        />
      </div>
    </div>
  );
}
