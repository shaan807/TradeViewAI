"use client";

import type { AnalyzeStockDataOutput } from '@/ai/flows/analyze-stock-data';
import { analyzeStockData } from '@/ai/flows/analyze-stock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, User, CornerDownLeft, Loader2, Send } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface ChatbotProps {
  stockDataCsv: string;
}

const templateQuestions = [
  "What was the highest price TSLA reached in this dataset?",
  "How many days was the direction 'LONG'?",
  "What was the average trading volume?",
  "On which date did TSLA have the largest price change in a single day?",
  "What are the support and resistance levels for 2023-01-03?",
];

const Chatbot: React.FC<ChatbotProps> = ({ stockDataCsv }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (questionText?: string) => {
    const currentQuestion = questionText || inputValue;
    if (!currentQuestion.trim() || !stockDataCsv) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: currentQuestion,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result: AnalyzeStockDataOutput = await analyzeStockData({
        question: currentQuestion,
        stockData: stockDataCsv,
      });
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: result.answer,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error analyzing stock data:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I encountered an error trying to process your request.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTemplateQuestionClick = (question: string) => {
    setInputValue(question);
    handleSubmit(question); 
  };


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl flex flex-col h-[calc(100vh-180px)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot size={24} /> AI Analyst Chat
        </CardTitle>
        <CardDescription>Ask questions about the TSLA stock data.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : ''
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="bg-primary p-2 rounded-full text-primary-foreground">
                    <Bot size={18} />
                  </div>
                )}
                <div
                  className={`p-3 rounded-lg max-w-[75%] ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-muted-foreground rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === 'user' && (
                  <div className="bg-muted p-2 rounded-full text-muted-foreground">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="bg-primary p-2 rounded-full text-primary-foreground">
                  <Bot size={18} />
                </div>
                <div className="p-3 rounded-lg bg-muted text-muted-foreground rounded-bl-none">
                  <Loader2 size={20} className="animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <div className="flex flex-col w-full gap-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {templateQuestions.map((q, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => handleTemplateQuestionClick(q)}
                disabled={isLoading}
                className="whitespace-nowrap"
              >
                {q}
              </Button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex w-full items-center space-x-2"
          >
            <Input
              type="text"
              placeholder="Type your question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon">
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Chatbot;
