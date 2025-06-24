import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Clock, Calendar } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function Notices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    typeId: "",
    deadline: "",
    renewalDate: "",
    tags: [] as string[],
  });

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ["/api/notices"],
    queryFn: () => apiRequest("/api/notices"),
  });

  const { data: noticeTypes = [] } = useQuery({
    queryKey: ["/api/notice-types"],
    queryFn: () => apiRequest("/api/notice-types"),
  });

  const { data: noticeTags = [] } = useQuery({
    queryKey: ["/api/notice-tags"],
    queryFn: () => apiRequest("/api/notice-tags"),
  });

  const createNoticeMutation = useMutation({
    mutationFn: (noticeData: any) => apiRequest("/api/notices", {
      method: "POST",
      body: JSON.stringify(noticeData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      setShowForm(false);
      setFormData({
        title: "",
        content: "",
        typeId: "",
        deadline: "",
        renewalDate: "",
        tags: [],
      });
      toast({
        title: "Aviso criado",
        description: "Aviso publicado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o aviso.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createNoticeMutation.mutate({
      ...formData,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      renewalDate: formData.renewalDate ? new Date(formData.renewalDate).toISOString() : null,
    });
  };

  const getNoticeTypeColor = (typeId: string) => {
    const type = noticeTypes.find((t: any) => t.id === typeId);
    return type?.color || "#6366f1";
  };

  const getTagColor = (tagId: string) => {
    const tag = noticeTags.find((t: any) => t.id === tagId);
    return tag?.color || "#6366f1";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Avisos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comunicados e informações importantes
          </p>
        </div>
        {(user?.role === "admin" || user?.role === "lider") && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Aviso
          </Button>
        )}
      </div>

      {showForm && (user?.role === "admin" || user?.role === "lider") && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Aviso</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="content">Conteúdo</Label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full min-h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="typeId">Tipo de Aviso</Label>
                  <select
                    id="typeId"
                    value={formData.typeId}
                    onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione um tipo</option>
                    {noticeTypes.map((type: any) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <select
                    id="tags"
                    multiple
                    value={formData.tags}
                    onChange={(e) => {
                      const selectedTags = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData({ ...formData, tags: selectedTags });
                    }}
                    className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {noticeTags.map((tag: any) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="renewalDate">Data de Renovação</Label>
                  <Input
                    id="renewalDate"
                    type="datetime-local"
                    value={formData.renewalDate}
                    onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={createNoticeMutation.isPending}>
                  {createNoticeMutation.isPending ? "Criando..." : "Publicar Aviso"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Notices List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Carregando avisos...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum aviso disponível</p>
          </div>
        ) : (
          notices.map((notice: any) => (
            <Card key={notice.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {notice.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {notice.content}
                    </p>
                    
                    {/* Tags */}
                    {notice.tags && notice.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {notice.tags.map((tagId: string) => {
                          const tag = noticeTags.find((t: any) => t.id === tagId);
                          return tag ? (
                            <span
                              key={tagId}
                              className="px-2 py-1 text-xs font-medium rounded-full text-white"
                              style={{ backgroundColor: getTagColor(tagId) }}
                            >
                              {tag.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    {/* Dates */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Criado: {format(new Date(notice.createdAt), "dd/MM/yyyy")}</span>
                      </div>
                      {notice.deadline && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Prazo: {format(new Date(notice.deadline), "dd/MM/yyyy")}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Type Badge */}
                  <div className="ml-4">
                    {noticeTypes.map((type: any) => {
                      if (type.id === notice.typeId) {
                        return (
                          <span
                            key={type.id}
                            className="px-3 py-1 text-xs font-medium rounded-full text-white"
                            style={{ backgroundColor: type.color }}
                          >
                            {type.name}
                          </span>
                        );
                      }
                      return null;
                    })}
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