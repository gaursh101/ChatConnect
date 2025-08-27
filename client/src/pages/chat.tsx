import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { TypingIndicator } from "@/components/typing-indicator";
import { MessageCircle, Send, Users, Wifi } from "lucide-react";
import type { Message } from "@shared/schema";

export default function Chat() {
  const [username, setUsername] = useState(localStorage.getItem("chatUsername") || "");
  const [showUsernameDialog, setShowUsernameDialog] = useState(!username);
  const [messageInput, setMessageInput] = useState("");
  const [tempUsername, setTempUsername] = useState("");
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch messages with polling
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    refetchInterval: 2000, // Poll every 2 seconds for new messages
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; username: string }) => {
      const response = await apiRequest("POST", "/api/messages", data);
      return response.json();
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      // Auto-focus the input after sending message
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      } else {
        setNotificationPermission(Notification.permission);
      }
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle notifications for new messages
  useEffect(() => {
    if (messages.length > 0 && previousMessageCount > 0) {
      const newMessages = messages.slice(previousMessageCount);
      const newMessagesFromOthers = newMessages.filter(msg => msg.username !== username);
      
      if (newMessagesFromOthers.length > 0 && 
          notificationPermission === 'granted' && 
          document.hidden) {
        const latestMessage = newMessagesFromOthers[newMessagesFromOthers.length - 1];
        const notification = new Notification(`New message from ${latestMessage.username}`, {
          body: latestMessage.content,
          icon: '/favicon.ico',
          tag: 'chat-message'
        });
        
        // Auto-close notification after 4 seconds
        setTimeout(() => notification.close(), 4000);
        
        // Focus window when notification is clicked
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    }
    
    setPreviousMessageCount(messages.length);
  }, [messages, username, notificationPermission, previousMessageCount]);

  // Handle typing indicator
  const updateTypingStatus = async () => {
    if (!username) return;
    
    try {
      await apiRequest("POST", "/api/typing", { username });
    } catch (error) {
      // Silently fail for typing indicator
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    
    // Update typing status
    updateTypingStatus();
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing indicator after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      // Typing will naturally expire on server after 3 seconds
    }, 3000);
    
    setTypingTimeout(timeout);
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUsername.trim().length >= 2) {
      setUsername(tempUsername.trim());
      localStorage.setItem("chatUsername", tempUsername.trim());
      setShowUsernameDialog(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && username) {
      sendMessageMutation.mutate({
        content: messageInput.trim(),
        username: username,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-blue-400 to-blue-600",
      "from-green-400 to-green-600",
      "from-purple-400 to-purple-600",
      "from-orange-400 to-orange-600",
      "from-pink-400 to-pink-600",
      "from-indigo-400 to-indigo-600",
    ];
    const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get unique users count
  const uniqueUsers = new Set(messages.map((m) => m.username)).size;

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-lg transition-colors">
      {/* Username Selection Dialog */}
      <Dialog open={showUsernameDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-username">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="text-primary text-2xl" />
              </div>
              Welcome to ChatApp
            </DialogTitle>
            <p className="text-gray-600 text-sm text-center">Choose a username to start chatting</p>
          </DialogHeader>
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-sm font-medium">
                Your Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username..."
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                maxLength={20}
                required
                autoFocus
                data-testid="input-username"
              />
            </div>
            <Button type="submit" className="w-full" data-testid="button-start-chat">
              Start Chatting
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-primary text-white shadow-sm" data-testid="header-chat">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <MessageCircle className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">ChatApp</h1>
            <p className="text-xs text-white/80">General Chat Room</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-white/90">Connected</span>
          </div>
          <div className="text-xs text-white/70 flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span data-testid="text-online-users">{uniqueUsers} online</span>
          </div>
        </div>
      </header>

      {/* Message Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-4 space-y-4" data-testid="container-messages">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="text-gray-500 dark:text-gray-400">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center">
              <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full transition-colors">
                Welcome to the chat room! Start the conversation.
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.username === username;
              return (
                <div
                  key={message.id}
                  className={`flex space-x-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}
                  data-testid={`message-${message.id}`}
                >
                  <div
                    className={`w-8 h-8 bg-gradient-to-br ${
                      isCurrentUser ? "from-primary to-indigo-600" : getAvatarColor(message.username)
                    } rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white text-sm font-medium">
                      {getInitials(message.username)}
                    </span>
                  </div>
                  <div className={`flex-1 min-w-0 ${isCurrentUser ? "flex flex-col items-end" : ""}`}>
                    <div
                      className={`flex items-baseline space-x-2 ${
                        isCurrentUser ? "flex-row-reverse" : ""
                      }`}
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm transition-colors" data-testid={`text-username-${message.id}`}>
                        {isCurrentUser ? "You" : message.username}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors" data-testid={`text-timestamp-${message.id}`}>
                        {formatTime(message.timestamp.toString())}
                      </span>
                    </div>
                    <div
                      className={`mt-1 rounded-lg px-3 py-2 inline-block max-w-xs md:max-w-md transition-colors ${
                        isCurrentUser
                          ? "bg-primary text-white"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <p className={`text-sm transition-colors ${isCurrentUser ? "text-white" : "text-gray-800 dark:text-gray-200"}`} data-testid={`text-content-${message.id}`}>
                        {message.content}
                      </p>
                    </div>
                    {isCurrentUser && (
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-xs text-gray-400 dark:text-gray-500 transition-colors">Delivered</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 transition-colors" data-testid="container-message-input">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <div className="flex-1 relative">
            <Input
              ref={messageInputRef}
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              maxLength={500}
              className="pr-12 rounded-full"
              disabled={sendMessageMutation.isPending}
              data-testid="input-message"
              autoFocus
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span
                className={`text-xs ${
                  messageInput.length > 450 ? "text-red-500" : "text-gray-400"
                }`}
                data-testid="text-char-counter"
              >
                {messageInput.length}/500
              </span>
            </div>
          </div>

          <Button
            type="submit"
            size="icon"
            className="rounded-full"
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
            data-testid="button-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {sendMessageMutation.isPending && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center transition-colors" data-testid="status-sending">
            <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin mr-2"></div>
            Sending message...
          </div>
        )}
      </div>
      
      {/* Typing Indicator */}
      <TypingIndicator currentUsername={username} />
    </div>
  );
}
