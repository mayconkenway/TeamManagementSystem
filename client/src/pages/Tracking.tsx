import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, BarChart3 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function Tracking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    date: selectedDate,
    status: "trabalhou",
    weeklyAttendances: 0,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => apiRequest("/api/users"),
  });

  const { data: tracking = [], isLoading } = useQuery({
    queryKey: ["/api/daily-tracking", selectedDate],
    queryFn: () => apiRequest(`/api/daily-tracking?date=${selectedDate}`),
  });

  const createTrackingMutation = useMutation({
    mutationFn: (trackingData: any) => apiRequest("/api/daily-tracking", {
      method: "POST",
      body: JSON.stringify(trackingData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-tracking"] });
      setShowForm(false);
      setFormData({
        userId: "",
        date: selectedDate,
        status: "trabalhou",
        weeklyAttendances: 0,
      });
      toast({
        title: "Registro criado",
        description: "Acompanhamento registrado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o registro.",
        variant: "destructive",
      });
    },
  });

  const updateTrackingMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest(`/api/daily-tracking/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-tracking"] });
      toast({
        title: "Registro atualizado",
        description: "Acompanhamento atualizado com sucesso.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTrackingMutation.mutate(formData);
  };

  const handleAttendanceChange = (trackingId: string, value: number) => {
    updateTrackingMutation.mutate({
      id: trackingId,
      data: { weeklyAttendances: value }
    });
  };

  const getAttendanceColor = (attendances: number) => {
    if (attendances < 30) return "bg-red-100 text-red-800 border-red-200";
    if (attendances <= 35) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "atestado":
        return "bg-red-100 text-red-800 border-red-200";
      case "ferias":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  if (user?.role === "colaborador") {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Acesso Restrito
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Você não tem permissão para acessar esta área.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Acompanhamento Diário
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Controle de presença e atendimentos semanais
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Registro
        </Button>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <Label htmlFor="date">Data:</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Registro de Acompanhamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userId">Colaborador</Label>
                  <select
                    id="userId"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione um colaborador</option>
                    {users.map((user: any) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="trabalhou">Trabalhou</option>
                    <option value="atestado">Atestado</option>
                    <option value="ferias">Férias</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="weeklyAttendances">Atendimentos Semanais</Label>
                  <Input
                    id="weeklyAttendances"
                    type="number"
                    min="0"
                    value={formData.weeklyAttendances}
                    onChange={(e) => setFormData({ ...formData, weeklyAttendances: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={createTrackingMutation.isPending}>
                  {createTrackingMutation.isPending ? "Criando..." : "Criar Registro"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tracking Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Registros de {format(new Date(selectedDate), "dd/MM/yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Carregando registros...</p>
            </div>
          ) : tracking.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum registro encontrado para esta data
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold">Colaborador</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Atendimentos Semanais</th>
                    <th className="text-left py-3 px-4 font-semibold">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {tracking.map((track: any) => {
                    const trackUser = users.find((u: any) => u.id === track.userId);
                    return (
                      <tr key={track.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4">
                          {trackUser ? `${trackUser.firstName} ${trackUser.lastName}` : "Usuário não encontrado"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(track.status)}`}>
                            {track.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {track.status === "trabalhou" ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                value={track.weeklyAttendances}
                                onChange={(e) => handleAttendanceChange(track.id, parseInt(e.target.value) || 0)}
                                className="w-20"
                              />
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getAttendanceColor(track.weeklyAttendances)}`}>
                                {track.weeklyAttendances < 30 ? "Baixo" :
                                 track.weeklyAttendances <= 35 ? "Médio" : "Alto"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {format(new Date(track.date), "dd/MM/yyyy")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}