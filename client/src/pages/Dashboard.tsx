import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, MessageSquare, FileText, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export function Dashboard() {
  const { user } = useAuth();

  const { data: notices = [] } = useQuery({
    queryKey: ["/api/notices"],
    queryFn: () => apiRequest("/api/notices"),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => apiRequest("/api/users"),
    enabled: user?.role === "admin" || user?.role === "lider",
  });

  const { data: events = [] } = useQuery({
    queryKey: ["/api/calendar"],
    queryFn: () => apiRequest("/api/calendar"),
  });

  const { data: dailyTracking = [] } = useQuery({
    queryKey: ["/api/daily-tracking"],
    queryFn: () => apiRequest("/api/daily-tracking"),
    enabled: user?.role === "admin" || user?.role === "lider",
  });

  // Calculate weekly attendances for current week
  const currentWeekAttendances = dailyTracking
    .filter((track: any) => {
      const trackDate = new Date(track.date);
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      return trackDate >= weekStart;
    })
    .reduce((sum: number, track: any) => sum + track.weeklyAttendances, 0);

  const stats = [
    {
      title: "Avisos Ativos",
      value: notices.length,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Eventos do Mês",
      value: events.length,
      icon: CalendarDays,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    ...(user?.role === "admin" || user?.role === "lider" ? [
      {
        title: "Total de Usuários",
        value: users.length,
        icon: Users,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      },
      {
        title: "Atendimentos Semanais",
        value: currentWeekAttendances,
        icon: MessageSquare,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      }
    ] : [])
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bem-vindo de volta, {user?.firstName}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor} dark:bg-opacity-20`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Avisos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {notices.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Nenhum aviso disponível
              </p>
            ) : (
              <div className="space-y-3">
                {notices.slice(0, 5).map((notice: any) => (
                  <div key={notice.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {notice.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Nenhum evento programado
              </p>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 5).map((event: any) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      event.type === "treinamento" ? "bg-green-500" :
                      event.type === "folga" ? "bg-yellow-500" : "bg-blue-500"
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(event.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}