import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface TypingIndicatorProps {
  currentUsername: string;
}

export function TypingIndicator({ currentUsername }: TypingIndicatorProps) {
  const { data: typingData } = useQuery({
    queryKey: ["/api/typing", currentUsername],
    queryFn: () => fetch(`/api/typing?exclude=${encodeURIComponent(currentUsername)}`).then(res => res.json()),
    refetchInterval: 1000, // Poll every second for typing status
    enabled: !!currentUsername,
  });

  const typingUsers = typingData?.typingUsers || [];
  
  if (typingUsers.length === 0) {
    return null;
  }

  const getTypingText = (users: string[]) => {
    if (users.length === 1) {
      return `${users[0]} is typing...`;
    } else if (users.length === 2) {
      return `${users[0]} and ${users[1]} are typing...`;
    } else if (users.length > 2) {
      return `${users[0]}, ${users[1]} and ${users.length - 2} other${users.length - 2 > 1 ? 's' : ''} are typing...`;
    }
    return "";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.9 }}
        transition={{ 
          duration: 0.2,
          ease: "easeOut"
        }}
        className="fixed bottom-20 left-4 z-50"
      >
        <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <motion.div
                className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  delay: 0
                }}
              />
              <motion.div
                className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  delay: 0.2
                }}
              />
              <motion.div
                className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  delay: 0.4
                }}
              />
            </div>
            <span className="text-sm font-medium">
              {getTypingText(typingUsers)}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}