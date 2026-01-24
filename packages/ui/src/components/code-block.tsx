"use client";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Button } from "../primitives/button";
import { ClipboardDocumentCheckIcon, ClipboardDocumentIcon } from "./icons";

type CodeBlockProps = {
    language: string;
    filename: string;
    highlightLines?: number[];
} & (
    | {
          code: string;
          tabs?: never;
      }
    | {
          code?: never;
          tabs: Array<{
              name: string;
              code: string;
              language?: string;
              highlightLines?: number[];
          }>;
      }
);

export const CodeBlock = ({ language, filename, code, highlightLines = [], tabs = [] }: CodeBlockProps) => {
    const [copied, setCopied] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState(0);

    const tabsExist = tabs.length > 0;

    const copyToClipboard = async () => {
        const textToCopy = tabsExist ? tabs[activeTab]?.code : code;
        if (textToCopy) {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const activeCode = tabsExist ? (tabs[activeTab]?.code ?? "") : (code ?? "");
    const activeLanguage = tabsExist ? (tabs[activeTab]?.language ?? language) : language;
    const activeHighlightLines = tabsExist ? (tabs[activeTab]?.highlightLines ?? []) : highlightLines;

    return (
        <div className="relative w-full rounded-lg bg-slate-900 p-4 font-mono text-sm">
            <div className="flex flex-col gap-2">
                {tabsExist && (
                    <div className="flex overflow-x-auto">
                        {tabs.map((tab, index) => (
                            <Button
                                className={`px-3 py-2! font-sans text-xs transition-colors ${activeTab === index ? "text-white" : "text-zinc-400 hover:text-zinc-200"}`}
                                key={`${tab.name}-${tab.language ?? "default"}`}
                                onClick={() => setActiveTab(index)}
                            >
                                {tab.name}
                            </Button>
                        ))}
                    </div>
                )}
                {!tabsExist && filename && (
                    <div className="flex items-center justify-between py-2">
                        <div className="text-xs text-zinc-400">{filename}</div>
                        <Button className="flex items-center gap-1 font-sans text-xs text-zinc-400 transition-colors hover:text-zinc-200" onClick={copyToClipboard}>
                            {copied ? <ClipboardDocumentCheckIcon size={14} /> : <ClipboardDocumentIcon size={14} />}
                        </Button>
                    </div>
                )}
            </div>
            <SyntaxHighlighter
                customStyle={{
                    margin: 0,
                    padding: 0,
                    background: "transparent",
                    fontSize: "0.875rem", // text-sm equivalent
                }}
                language={activeLanguage}
                lineProps={(lineNumber) => ({
                    style: {
                        backgroundColor: activeHighlightLines.includes(lineNumber) ? "rgba(255,255,255,0.1)" : "transparent",
                        display: "block",
                        width: "100%",
                    },
                })}
                PreTag="div"
                showLineNumbers={true}
                style={atomDark}
                wrapLines={true}
            >
                {String(activeCode)}
            </SyntaxHighlighter>
        </div>
    );
};
