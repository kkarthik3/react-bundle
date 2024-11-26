"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {ChevronDown, Send } from "lucide-react";
import Draggable from "react-draggable";
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';
import styled, { css } from 'styled-components';

// Types
type Message = {
  sender: string;
  text: string;
};

const NotificationWrapper = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  background-color: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  transition: all 0.3s ease-in-out;
  opacity: 0;
  transform: translateY(10px);
  pointer-events: none;
  color: black;
  white-space: nowrap;

  ${props => props.className === 'show' && css`
    opacity: 1;
    transform: translateY(0);
  `}
`;

const ChatWrapper = styled.div`
  position: fixed;
  bottom: 10px;
  right: 10px;
  transition: all 0.3s ease-in-out;
`;

const ChatButton = styled.button`
  background-color: black;
  color: white;
  border-radius: 30px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  height: 70px;
  overflow: hidden;
  width: 70px;
  transition: width 0.5s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  
  &:hover {
    background-color: #333;
    width: 125px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  }
  
  div {
    display: none;
  }
  
  &:hover div {
    display: block;
  }
`;

const ChatWindow = styled.div<{ isDragging: boolean }>`
  position: fixed;
  bottom: 4px;
  right: 4px;
  width: 320px;
  background-color: white;
  border-radius: 25px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  flex-direction: column;
  display: flex;
  transform: ${({ isDragging }) => (isDragging ? "scale(1.2)" : "scale(1)")};
  transition: all 0.05s ease;
  overflow: hidden;
`;

const Header = styled.div`
  background-color: black;
  color: white;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MessageArea = styled.div`
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  max-height: 400px;
  background-color: #f8f8f8;
  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
`;

const MessageBubble = styled.div<{ sender: string }>`
  max-width: 80%;
  padding: 8px 15px;
  border-radius: 12px;
  margin: 8px;
  word-wrap: break-word;
  background-color: ${({ sender }) => (sender === "user" ? "black" : "#e0e0e0")};
  color: ${({ sender }) => (sender === "user" ? "white" : "black")};
`;

const MessageContainer = styled.div<{ sender: string }>`
  display: flex;
  justify-content: ${({ sender }) => (sender === "user" ? "flex-end" : "flex-start")};
  width: 100%;
`;

const InputArea = styled.div`
  padding: 8px;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 12px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border-radius: 35px;
  border: 1px solid #ddd;
  outline: none;
  transition: all 0.3s ease;
  &:focus {
    border-color: black;
  }
`;

const SendButton = styled.button`
  padding: 12px;
  background-color: black;
  color: white;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #333;
  }
`;

const ChatbotUI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userName, setUserName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Notification logic
  useEffect(() => {
    setShowNotification(true);
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Auto scroll to the bottom when new messages are added
  useEffect(() => {
    if (isOpen && chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [isOpen, messages]);

  // Initialize chat session when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ sender: "bot", text: "How would you like to be addressed?" }]);
      setSessionId(uuidv4());
    }
  }, [isOpen, messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    setMessages((prevMessages) => [...prevMessages, { sender: "user", text: input }]);
    setInput("");
    setIsLoading(true);

    if (!userName) {
      setUserName(input);
      setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: "How may I help you today?" }]);
      setIsLoading(false);
    } else {
      const payload = {
        brand: "chery",
        user_id: "rht",
        user_name: userName,
        chat_head_id: "658d0c508a09c124daca92b6",
        input_message_id: "668166a2ccf371c56d8697dd",
        message: input,
        session_id: sessionId || uuidv4(),
      };
      console.log("Payload:", payload);
      try {
        const response = await axios.post(
          "https://interim-cab-module-api.ispgnet.com/bot/message",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Basic " + btoa("ispg:ispg"),
            },
          }
        );

        const data = response.data;
        if (data.output?.text) {
          setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: data.output.text }]);
        }
      } catch (error) {
        setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: "I'm sorry, I couldn't process your request." }]);
      }
      setIsLoading(false);
    }
  }, [input, userName, sessionId]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <ChatWrapper>
        <NotificationWrapper className={showNotification ? 'show' : ''}>How may I help you today?</NotificationWrapper>
        <ChatButton onClick={() => setIsOpen(true)}>
          <Image src="/images/logo_chat.jpg" alt="Chat Logo" width={40} height={40} style={{ borderRadius: '30%' }} />
          <div>We&apos;re Online!</div>
        </ChatButton>
      </ChatWrapper>
    );
  }

  return (
    <Draggable handle=".drag-handle" onStart={() => setIsDragging(true)} onStop={() => setIsDragging(false)} bounds="parent">
      <ChatWindow isDragging={isDragging}>
        <Header className="drag-handle">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Image src="/images/logo_chat.jpg" alt="Chat Logo" width={30} height={30} style={{ borderRadius: '50%' }} />
            <div>Chat with us</div>
          </div>
          <button onClick={() => setIsOpen(false)}><ChevronDown className="w-5 h-5" /></button>
        </Header>

        <MessageArea ref={chatBodyRef}>
          {messages.map((msg, index) => (
            <MessageContainer key={index} sender={msg.sender}>
              <MessageBubble sender={msg.sender}>{msg.text}</MessageBubble>
            </MessageContainer>
          ))}
          {isLoading && <MessageBubble sender="bot">...</MessageBubble>}
        </MessageArea>

        <InputArea>
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={userName ? "Type your message..." : "Enter your name"}
          />
          <SendButton onClick={handleSend}><Send className="w-5 h-5" /></SendButton>
        </InputArea>
      </ChatWindow>
    </Draggable>
  );
};

export default ChatbotUI;
