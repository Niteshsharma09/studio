"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input }s "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, X, Loader2, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { chat } from "@/ai/flows/chatbot";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUser } from "@/firebase";

type Message = {
  role: "user" | "model";
  content: string;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const historyForAI = messages.map(msg => ({
        role: msg.role,
        content: [{ text: msg.content }]
      }));
      const result = await chat({ history: historyForAI, message: input });
      const modelMessage: Message = { role: "model", content: result.reply };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { role: "model", content: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <>
      <div className={cn(
          "fixed bottom-4 right-4 z-50 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-[calc(100%+2rem)]" : "translate-x-0"
      )}>
        <Button onClick={() => setIsOpen(true)} size="icon" className="w-14 h-14 rounded-full shadow-lg">
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>

      <div
        className={cn(
          "fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] h-[calc(100vh-5rem)] max-w-sm max-h-[600px] flex flex-col bg-card border rounded-lg shadow-xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
          "sm:w-full sm:h-auto"
        )}
      >
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold">Techno-i Assistant</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </header>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === 'model' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                        <Bot className="w-5 h-5"/>
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "p-3 rounded-lg max-w-[80%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                 {message.role === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.photoURL || ''} />
                    <AvatarFallback>{getInitials(user?.displayName || user?.email)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                 <Avatar className="w-8 h-8">
                    <AvatarFallback>
                        <Bot className="w-5 h-5"/>
                    </AvatarFallback>
                  </Avatar>
                <div className="p-3 rounded-lg bg-muted">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <footer className="p-4 border-t">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="Ask a question..."
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </footer>
      </div>
    </>
  );
}
