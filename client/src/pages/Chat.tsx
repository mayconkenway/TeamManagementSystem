import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Smile, Image, Pause, Play, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/chat/messages"],
    queryFn: () => apiRequest("/api/chat/messages"),
  });

  const { data: chatSettings } = useQuery({
    queryKey: ["/api/chat/settings"],
    queryFn: () => apiRequest("/api/chat/settings"),
    enabled: user?.role === "admin" || user?.role === "lider",
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData: any) => apiRequest("/api/chat/messages", {
      method: "POST",
      body: JSON.stringify(messageData),
    }),
    onSuccess: (newMessage) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      // Send via WebSocket for real-time updates
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "new_message", message: newMessage }));
      }
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    },
  });

  const updateChatSettingsMutation = useMutation({
    mutationFn: (settings: any) => apiRequest("/api/chat/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/settings"] });
      toast({
        title: "Configurações atualizadas",
        description: "As configurações do chat foram alteradas.",
      });
    },
  });

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("WebSocket conectado");
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_message") {
        queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      }
    };

    websocket.onclose = () => {
      console.log("WebSocket desconectado");
      setWs(null);
    };

    return () => {
      websocket.close();
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || chatSettings?.isPaused) return;

    sendMessageMutation.mutate({
      content: message,
      type: "text",
    });
    setMessage("");
  };

  const handleEmojiClick = (emoji: string) => {
    if (chatSettings?.isPaused) return;
    
    sendMessageMutation.mutate({
      content: emoji,
      type: "emoji",
    });
  };

  const toggleChatPause = () => {
    updateChatSettingsMutation.mutate({
      isPaused: !chatSettings?.isPaused,
    });
  };

  const commonEmojis = ["😀", "😂", "👍", "👎", "❤️", "🎉", "👏", "🔥"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Chat da Equipe
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comunicação em tempo real
          </p>
        </div>
        {(user?.role === "admin" || user?.role === "lider") && (
          <Button
            onClick={toggleChatPause}
            variant={chatSettings?.isPaused ? "destructive" : "outline"}
          >
            {chatSettings?.isPaused ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Reativar Chat
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pausar Chat
              </>
            )}
          </Button>
        )}
      </div>

      <Card className="h-96">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Mensagens
            {chatSettings?.isPaused && (
              <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
                Chat Pausado
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-full flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">Carregando mensagens...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">Nenhuma mensagem ainda</p>
              </div>
            ) : (
              messages.reverse().map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.userId === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.userId === user?.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                    } ${msg.isPriority ? "ring-2 ring-red-500" : ""}`}
                  >
                    {msg.type === "emoji" ? (
                      <span className="text-2xl">{msg.content}</span>
                    ) : msg.type === "image" ? (
                      <img
                        src={msg.imageUrl}
                        alt="Imagem compartilhada"
                        className="max-w-full h-auto rounded"
                      />
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-75">
                        {format(new Date(msg.createdAt), "HH:mm")}
                      </span>
                      {msg.isEdited && (
                        <span className="text-xs opacity-75">editado</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Emoji Bar */}
          <div className="flex space-x-2 mb-4">
            {commonEmojis.map((emoji) => (
              <Button
                key={emoji}
                size="sm"
                variant="outline"
                onClick={() => handleEmojiClick(emoji)}
                disabled={chatSettings?.isPaused}
                className="text-lg p-2"
              >
                {emoji}
              </Button>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                chatSettings?.isPaused 
                  ? "Chat pausado..." 
                  : "Digite sua mensagem..."
              }
              disabled={chatSettings?.isPaused || sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={
                !message.trim() || 
                chatSettings?.isPaused || 
                sendMessageMutation.isPending
              }
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}