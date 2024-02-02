"use client";
import React, { useState } from "react";
import axios from "axios";
import * as z from "zod";
import { Heading } from "@/components/heading";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/loader";

interface Message {
  role: "user" | "bot";
  content: string;
}

const ConversationPage = () => {
  const [urlResponse, setUrlResponse] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const scrapeForm = useForm({
    resolver: zodResolver(
      z.object({
        url: z.string().url({ message: "Please enter a valid URL." }),
      })
    ),
  });
  const chatForm = useForm({
    resolver: zodResolver(
      z.object({
        message: z.string().min(1, { message: "Message is required." }),
      })
    ),
  });

  const onScrapeSubmit = async (data: any) => {
    try {
      console.log("Sending URL:", data.url);
      const endpoint = `/api/scrape`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: data.url }),
      });

      const json = await response.json();
      console.log(json);
      setUrlResponse("URL successfully processed. Start your conversation.");
    } catch (error) {
      console.error("Error scraping URL: ", error);
      setUrlResponse("Failed to process URL.");
    }
  };

  const onChatSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/chat", { message: data.message });
      setMessages([
        ...messages,
        { role: "user", content: data.message },
        { role: "bot", content: response.data },
      ]);
    } catch (error) {
      console.error("Error in chat: ", error);
    }
    setIsLoading(false);
    chatForm.reset();
  };

  return (
    <div>
      <Heading
        title="Interactive Chatbot"
        description="Engage in a conversation. Provide a URL for contextual responses."
      />

      {/* URL Scrape Form */}
      <div className="px-4 lg:px-8 mt-4">
        <Form {...scrapeForm}>
          <form
            onSubmit={scrapeForm.handleSubmit(onScrapeSubmit)}
            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
          >
            <FormField
              name="url"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Input {...field} placeholder="Enter URL to scrape" />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button className="col-span-12 lg:col-span-2 w-full" type="submit">
              Scrape URL
            </Button>
          </form>
        </Form>
        {urlResponse && <p className="mt-4">{urlResponse}</p>}
      </div>

      {/* Chat Interaction Form */}
      <div className="px-4 lg:px-8 mt-4">
        <Form {...chatForm}>
          <form
            onSubmit={chatForm.handleSubmit(onChatSubmit)}
            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
          >
            <FormField
              name="message"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Input {...field} placeholder="Type your message" />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              className="col-span-12 lg:col-span-2 w-full bg-green text-white"
              type="submit"
            >
              Send Message
            </Button>
          </form>
        </Form>
        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {
            messages.length === 0 &&
              urlResponse === "" &&
              !isLoading &&
              null /* This will not render anything */
          }
          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-8 w-full flex items-start gap-x-8 rounded-lg ${
                  message.role === "user"
                    ? "bg-white border border-black/10"
                    : "bg-muted"
                }`}
              >
                {message.role === "user" ? "User" : "Bot"}
                <p className="text-sm">{message.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
