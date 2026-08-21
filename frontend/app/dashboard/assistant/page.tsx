"use client";
import { useState, useRef, useEffect } from "react";
import {
  createChatSession,
  getChatSession,
  saveChatMessage,
  streamChatWithRepository,
} from "../../../services/api";

import { Sidebar } from "@/components/sidebar/sidebar";
import { GradientButton } from "../../../components/ui/gradient-button";

import ReactMarkdown from "react-markdown";

import { Prism as SyntaxHighlighter } from
  "react-syntax-highlighter";

import { oneDark } from
  "react-syntax-highlighter/dist/esm/styles/prism";
  
export default function AssistantPage() {

    
    const [question, setQuestion] =
    useState("");

    const [messages, setMessages] =
    useState<
    {
      role: "user" | "assistant";
      content: string;
      timestamp: string;
    }[]
    >([]);

    

    const [chatLoading, setChatLoading] =
      useState(false);
    const messagesEndRef =
      useRef<HTMLDivElement | null>(null);
    const activeSessionIdRef =
      useRef<string | null>(null);
      
      

      

      useEffect(() => {

      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });

      }, [messages, chatLoading]);

      useEffect(() => {
        localStorage.setItem(
          "devinsight-chat",
          JSON.stringify(messages)
        );
      }, [messages]);

      useEffect(() => {
        const savedSessionId =
          localStorage.getItem(
            "devinsight-active-chat-session"
          );

        if (!savedSessionId) return;

        activeSessionIdRef.current =
          savedSessionId;

        getChatSession(savedSessionId)
          .then((session) => {
            setMessages(
              session.messages
                .filter(
                  (message) =>
                    message.role !== "SYSTEM"
                )
                .map((message) => ({
                  role:
                    message.role === "USER"
                      ? "user"
                      : "assistant",
                  content: message.content,
                  timestamp:
                    new Date(
                      message.createdAt
                    ).toLocaleTimeString(),
                }))
            );
          })
          .catch(() => {
            activeSessionIdRef.current = null;
            localStorage.removeItem(
              "devinsight-active-chat-session"
            );
          });
      }, []);

    const getOrCreateSession = async (
      title: string
    ) => {
      if (activeSessionIdRef.current) {
        return activeSessionIdRef.current;
      }

      const persistentRepositoryId =
        localStorage.getItem(
          "devinsight-active-persistent-repository"
        );

      if (!persistentRepositoryId) {
        return null;
      }

      try {
        const sessionId =
          await createChatSession(
            persistentRepositoryId,
            title
          );

        activeSessionIdRef.current = sessionId;
        localStorage.setItem(
          "devinsight-active-chat-session",
          sessionId
        );

        return sessionId;
      } catch (error) {
        console.error(error);
        return null;
      }
    };

    const handleSendMessage = async (
        customQuestion?: string
      ) => {

      const currentQuestion =
        typeof customQuestion === "string"
          ? customQuestion
          : question;

      if (!currentQuestion.trim()) return;

      const userMessage = {
        role: "user" as const,
        content: currentQuestion,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [
        ...prev,
        userMessage,
      ]);

      setQuestion("");
      setChatLoading(true);

      try {
        const sessionId =
          await getOrCreateSession(
            currentQuestion
          );

        if (sessionId) {
          saveChatMessage(
            sessionId,
            "USER",
            currentQuestion
          ).catch(console.error);
        }

        const repositoryId =
          localStorage.getItem(
            "devinsight-active-repository"
          );

        const assistantTimestamp =
          new Date().toLocaleTimeString();
        let streamedContent = "";

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "",
            timestamp: assistantTimestamp,
          },
        ]);

        await streamChatWithRepository(
            currentQuestion,
            repositoryId,
            messages.slice(-6).map(
              ({ role, content }) => ({
                role,
                content,
              })
            ),
            (token) => {
              streamedContent += token;

              setMessages((prev) =>
                prev.map((message, index) =>
                  index === prev.length - 1
                    ? {
                        ...message,
                        content:
                          message.content + token,
                      }
                    : message
                )
              );
            }
          );

        if (sessionId && streamedContent) {
          saveChatMessage(
            sessionId,
            "ASSISTANT",
            streamedContent
          ).catch(console.error);
        }

        setChatLoading(false);

      } catch (error) {

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to connect to AI backend.";

        setMessages((prev) => {
          const lastMessage =
            prev[prev.length - 1];

          if (
            lastMessage?.role === "assistant"
            && !lastMessage.content
          ) {
            return prev.map((message, index) =>
              index === prev.length - 1
                ? {
                    ...message,
                    content: errorMessage,
                  }
                : message
            );
          }

          return [
            ...prev,
            {
              role: "assistant",
              content: errorMessage,
              timestamp:
                new Date().toLocaleTimeString(),
            },
          ];
        });
        setChatLoading(false);
      }
    };

   

    
  return (
    <main className="flex min-h-screen bg-background text-foreground transition-colors duration-200">

      <Sidebar />

      <section className="flex flex-1 flex-col">

        {/* Header */}
        <div className="border-b border-border px-5 pb-5 pt-20 sm:px-7 lg:px-10 lg:py-6">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                DevInsight AI Assistant
              </h1>

              <p className="mt-2 text-muted-foreground">
                Interact with your repositories using local AI semantic retrieval.
              </p>
            </div>

            {messages.length > 0 && (

              <div className="mb-6 flex items-center gap-3">

                <button
                  onClick={() => {
                    setMessages([]);
                    localStorage.removeItem("devinsight-chat");
                    activeSessionIdRef.current = null;
                    localStorage.removeItem(
                      "devinsight-active-chat-session"
                    );
                  }}
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-300 transition-all hover:bg-red-500/20"
                >
                  Clear Chat
                </button>

                <button
                  onClick={() => {

                    const chatContent =
                      messages
                        .map(
                          (msg) =>
                             `${msg.role.toUpperCase()}:\n${msg.content}\n`
                        )
                        .join("\n-------------------\n");

                    const blob = new Blob(
                      [chatContent],
                      { type: "text/plain" }
                    );

                    const url =
                      URL.createObjectURL(blob);

                    const a =
                      document.createElement("a");

                    a.href = url;

                    a.download =
                      "devinsight-chat.txt";

                    a.click();

                    URL.revokeObjectURL(url);
                  }}
                  className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-600 dark:text-cyan-300 transition-all hover:bg-cyan-500/20"
                >
                  Export Chat
                </button>

              </div>

            )}

          </div>

        </div>

        {/* Chat Area */}
        <div className="flex flex-1 flex-col px-4 py-6 sm:px-7 lg:px-10 lg:py-8">

          {messages.length > 0 ? (
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-6">

               {messages.map((message, index) => (

                  <div
                    key={index}
                    style={{
                      animation: "fadeInUp 0.3s ease-out",
                    }}
                    className={`flex items-start gap-3 ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                   >

                    {message.role === "assistant" && (

                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 text-sm font-bold shadow-lg">
                        AI
                      </div>

                    )}

                    <div
                      className={`max-w-[82%] rounded-3xl px-4 py-4 text-sm leading-7 shadow-2xl transition-all sm:px-6 sm:py-5 sm:leading-8 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white"
                          : "border border-border bg-card/80 text-foreground backdrop-blur-xl"
                      }`}
                    >

                      <div className="prose prose-invert max-w-none prose-p:leading-8 prose-pre:rounded-2xl prose-pre:border prose-pre:border-border prose-code:text-cyan-300">

                        <ReactMarkdown
                          components={{
                            code(props) {

                              const { className, children } = props;

                              const match =
                                /language-(\w+)/.exec(
                                  className || ""
                                );

                              return match ? (

                                <div className="relative">

                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        String(children)
                                      );
                                    }}
                                    className="absolute right-3 top-3 z-10 rounded-lg border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-all hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-300"
                                  >
                                    Copy
                                  </button>

                                  <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                  >
                                    {String(children).replace(/\n$/, "")}
                                  </SyntaxHighlighter>

                                </div>

                              ) : (

                                <code className="rounded bg-muted px-1 py-0.5">
                                  {children}
                                </code>

                              );
                            },
                          }}
                        >
                          {
                            message.content
                            || "Connecting to Ollama..."
                          }
                        </ReactMarkdown>

                      </div>

                      <p className="mt-3 text-[11px] opacity-60">
                        {message.timestamp}
                      </p>

                    </div>

                    {message.role === "user" && (

                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 text-sm font-bold shadow-lg">
                        U
                      </div>

                    )}

                  </div>

                ))}

                {chatLoading && (

                  <div className="mr-auto flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-4 text-muted-foreground">

                    <div className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:0.2s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-pink-400 [animation-delay:0.4s]" />

                    <span className="ml-2 text-sm">
                      AI is thinking...
                    </span>

                  </div>

                )}

                <div ref={messagesEndRef} />
               </div>

               ) : (

                <div className="flex items-center justify-center text-center">

                {/* Empty State */}

                <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 p-10 shadow-2xl shadow-violet-500/10 backdrop-blur-xl">

                <h2 className="text-4xl font-bold">
                  Ask Anything About Your Codebase
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                  Analyze repositories, understand architectures,
                  inspect APIs, review workflows, and explore code using AI.
                </p>

                {/* Suggestion Chips */}
                <div className="mt-8 flex flex-wrap justify-center gap-3">

                  {[
                    "Explain project architecture",
                    "Show technologies used",
                    "Summarize repository",
                    "Explain backend workflow",
                    "Show important files",
                    "Describe API structure",
                  ].map((item) => (

                    <button
                      key={item}
                      onClick={() => handleSendMessage(item)}
                      className="rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-200 transition-all hover:border-violet-400/40 hover:bg-violet-500/20"
                    >
                      {item}
                    </button>

                  ))}
              </div>
            </div>
          </div>
        )}

          {/* Chat Input */}
          <div className="sticky bottom-0 mt-10 border-t border-border bg-background pt-6">

            <div className="flex gap-4">

              <textarea
                  disabled={chatLoading}
                  placeholder="Ask something about your repository..."
                  value={question}
                  onChange={(e) =>
                    setQuestion(e.target.value)
                  }
                  onInput={(e) => {

                    const target =
                      e.target as HTMLTextAreaElement;

                    target.style.height = "auto";

                    target.style.height =
                      `${target.scrollHeight}px`;
                  }}
                  onKeyDown={(e) => {

                    if (
                      e.key === "Enter" &&
                      !e.shiftKey
                    ) {

                      e.preventDefault();

                      handleSendMessage();
                    }
                  }}
                  rows={1}
                  className="min-h-[56px] max-h-40 flex-1 resize-none overflow-y-auto rounded-2xl border border-input bg-card px-5 py-4 text-foreground outline-none transition-all focus:border-violet-500"
                />

              <GradientButton
                onClick={handleSendMessage}
                disabled={chatLoading}
                className="h-14 px-8"
                >
                Ask AI
                </GradientButton>



            </div>
          </div>

        </div>

      </section>
    </main>
  );
}
