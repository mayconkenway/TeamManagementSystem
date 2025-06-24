import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function Calendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    type: "lembrete",
    isAllUsers: false,
    assignedTo: [] as string[],
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/calendar"],
    queryFn: () => apiRequest("/api/calendar"),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => apiRequest("/api/users"),
    enabled: user?.role === "admin" || user?.role === "lider",
  });

  const createEventMutation = useMutation({
    mutationFn: (eventData: any) => apiRequest("/api/calendar", {
      method: "POST",
      body: JSON.stringify(eventData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        type: "lembrete",
        isAllUsers: false,
        assignedTo: [],
      });
      toast({
        title: "Evento criado",
        description: "Evento adicionado ao calendário com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o evento.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEventMutation.mutate({
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      assignedTo: formData.isAllUsers ? null : formData.assignedTo,
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "treinamento":
        return "bg-green-100 text-green-800 border-green-200";
      case "folga":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Calendário
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie eventos, lembretes e folgas
          </p>
        </div>
        {(user?.role === "admin" || user?.role === "lider") && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        )}
      </div>

      {showForm && (user?.role === "admin" || user?.role === "lider") && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lembrete">Lembrete</option>
                    <option value="folga">Folga</option>
                    <option value="treinamento">Treinamento</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Data de Fim (Opcional)</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAllUsers"
                  checked={formData.isAllUsers}
                  onChange={(e) => setFormData({ ...formData, isAllUsers: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <Label htmlFor="isAllUsers">Visível para todos os usuários</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={createEventMutation.isPending}>
                  {createEventMutation.isPending ? "Criando..." : "Criar Evento"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Carregando eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum evento programado</p>
          </div>
        ) : (
          events.map((event: any) => (
            <Card key={event.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {event.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        Início: {format(new Date(event.startDate), "dd/MM/yyyy HH:mm")}
                      </span>
                      {event.endDate && (
                        <span>
                          Fim: {format(new Date(event.endDate), "dd/MM/yyyy HH:mm")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}