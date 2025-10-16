import React from 'react';
import { Github, Twitter, Instagram, Coffee, ExternalLink, Bot } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="bg-[rgb(var(--card))] text-[rgb(var(--fg))] border-t border-[rgb(var(--border))] p-4 text-center text-sm">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
        <div className="flex space-x-4">
          <a href="https://www.instagram.com/bgill55_art/" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500">
            <Instagram className="h-5 w-5" aria-label="Instagram" />
          </a>
          <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="hover:text-purple-500">
            <Bot className="h-5 w-5" aria-label="OpenRouter" />
          </a>
          <a href="https://x.com/bgill55_art" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700">
            <Twitter className="h-5 w-5" aria-label="X (Twitter)" />
          </a>
          <a href="https://kee.so/bgill55_art" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">
            <ExternalLink className="h-5 w-5" aria-label="All other links" />
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} Shape Shift. All rights reserved.</p>
        <div>
          <a 
            href="https://coff.ee/bgill55art" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <Coffee className="h-5 w-5 mr-2" />
            Buy Me a Coffee
          </a>
        </div>
      </div>
    </footer>
  );
}
