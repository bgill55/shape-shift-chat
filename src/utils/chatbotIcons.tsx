import React from 'react';

// Define a set of shapes, each with a fixed color
const SHAPES_WITH_COLORS = [
  { shape: <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>, color: "bg-red-500" }, // Circle
  { shape: <svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16"/></svg>, color: "bg-blue-500" }, // Square
  { shape: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20z"/></svg>, color: "bg-green-500" }, // Triangle
  { shape: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>, color: "bg-yellow-500" }, // Star
  { shape: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 6v12l9 5 9-5V6z"/></svg>, color: "bg-purple-500" }, // Hexagon
  { shape: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>, color: "bg-pink-500" }, // Hollow Circle
  { shape: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm0 16H5V5h14v14z"/></svg>, color: "bg-indigo-500" }, // Hollow Square
  { shape: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5L2 21h20L12 4.5zm0 3.33L17.5 18H6.5L12 7.83z"/></svg>, color: "bg-teal-500" }, // Hollow Triangle
];

// Simple hashing function to get a consistent index from a string
const stringToHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash * 31) + char; // Use a prime number (31) for multiplication
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Use a global Map to ensure consistent icon assignment across components
const chatbotIconMap = new Map();

export const getChatbotIcon = (chatbotId: string) => {
  if (!chatbotIconMap.has(chatbotId)) {
    const hash = stringToHash(chatbotId);
    const assignedIcon = SHAPES_WITH_COLORS[hash % SHAPES_WITH_COLORS.length];

    console.log(`[getChatbotIcon] Chatbot ID: ${chatbotId}, Hash: ${hash}, Assigned Index: ${hash % SHAPES_WITH_COLORS.length}`);
    console.log(`[getChatbotIcon] Assigned Shape: ${assignedIcon.shape.type}, Color: ${assignedIcon.color}`);

    chatbotIconMap.set(chatbotId, {
      shape: assignedIcon.shape,
      color: assignedIcon.color,
    });
  }
  return chatbotIconMap.get(chatbotId);
};
