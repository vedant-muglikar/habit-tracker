import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Flame,
  Calendar,
  CheckCircle,
  Circle,
  Power,
  Trash2,
  TrendingUp,
  Target,
} from "lucide-react";

interface Habit {
  id: string;
  name: string;
  category: string;
  active: boolean;
  startDate: string;
  streak: number;
  lastCheckedIn: string | null;
}

interface HabitCardProps {
  habit: Habit;
  checkIn: (id: string) => void;
  toggleActive: (id: string) => void;
  deleteHabit: (id: string) => void;
  today: string;
  getCategoryColor: (category: string) => string;
  getCategoryBgColor: (category: string) => string;
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    health: "🏥",
    fitness: "💪",
    learning: "📚",
    wellness: "🧘",
    work: "💼",
  };
  return icons[category] || "📌";
};

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  checkIn,
  uncheckIn,
  toggleActive,
  deleteHabit,
  today,
  getCategoryColor,
  getCategoryBgColor,
}) => {
  const isCheckedInToday = habit.lastCheckedIn === today;
  const daysSinceStart =
    Math.floor(
      (new Date().getTime() - new Date(habit.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;

  const consistencyRate =
    daysSinceStart > 0 ? (habit.streak / daysSinceStart) * 100 : 0;

  return (
    <Card
      className={`group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-900/10 hover:-translate-y-1 bg-white/70 dark:bg-black/40 backdrop-blur-xl border-indigo-200/60 dark:border-white/5 ${
        !habit.active ? "opacity-60 grayscale-[0.3]" : ""
      } ${
        isCheckedInToday
          ? "ring-2 ring-emerald-500/30 border-emerald-300 dark:border-emerald-800/50"
          : "border-indigo-100/50 dark:border-indigo-900/20"
      }`}>
      <CardHeader className="pb-3 px-5 pt-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white dark:bg-black/50 shadow-md shadow-indigo-900/5 text-2xl border border-indigo-200/60 dark:border-white/5 group-hover:scale-105 transition-transform">
                {getCategoryIcon(habit.category)}
              </div>
              <div className="flex-1">
                <h3
                  className={`text-2xl font-bold tracking-tight ${
                    !habit.active ? "text-muted-foreground" : "text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                  }`}>
                  {habit.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge
                    variant="secondary"
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: getCategoryBgColor(habit.category),
                      color: getCategoryColor(habit.category),
                    }}>
                    {habit.category}
                  </Badge>
                  {habit.active ? (
                    <Badge
                      variant="default"
                      className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 border-transparent shadow-none">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs px-2.5 py-0.5 rounded-full font-medium">
                      Inactive
                    </Badge>
                  )}
                  {isCheckedInToday && (
                    <Badge
                      variant="default"
                      className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20 border-transparent hover:from-emerald-600 hover:to-teal-500">
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      Done Today
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-5 pb-5">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-orange-50/80 to-red-50/80 dark:from-orange-950/30 dark:to-red-950/30 rounded-2xl border border-orange-100/50 dark:border-orange-900/30 shadow-sm transition-transform group-hover:scale-[1.03]">
            <Flame className="h-5 w-5 text-orange-500 mb-1.5 drop-shadow-sm" />
            <div className="text-2xl font-extrabold text-orange-600 dark:text-orange-400 leading-none mb-1">
              {habit.streak}
            </div>
            <div className="text-[11px] font-semibold tracking-wider text-orange-600/70 dark:text-orange-400/70 uppercase">
              Day Streak
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl border border-blue-100/50 dark:border-blue-900/30 shadow-sm transition-transform group-hover:scale-[1.03]">
            <Calendar className="h-5 w-5 text-blue-500 mb-1.5 drop-shadow-sm" />
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 leading-none mb-1">
              {daysSinceStart}
            </div>
            <div className="text-[11px] font-semibold tracking-wider text-blue-600/70 dark:text-blue-400/70 uppercase">
              Days Total
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30 shadow-sm transition-transform group-hover:scale-[1.03]">
            <TrendingUp className="h-5 w-5 text-emerald-500 mb-1.5 drop-shadow-sm" />
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none mb-1">
              {Math.round(consistencyRate)}%
            </div>
            <div className="text-[11px] font-semibold tracking-wider text-emerald-600/70 dark:text-emerald-400/70 uppercase">
              Consistency
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl border border-purple-100/50 dark:border-purple-900/30 shadow-sm transition-transform group-hover:scale-[1.03]">
            <Target className="h-5 w-5 text-purple-500 mb-1.5 drop-shadow-sm" />
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400 leading-tight mb-1">
              {new Date(habit.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="text-[11px] font-semibold tracking-wider text-purple-600/70 dark:text-purple-400/70 uppercase">
              Started
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mt-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">Consistency Progress</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{Math.round(consistencyRate)}%</span>
          </div>
          <Progress value={consistencyRate} className="h-2.5 bg-emerald-100 dark:bg-emerald-950" />
        </div>

        <Separator className="my-5 opacity-50" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {habit.active && (
            <Button
              onClick={() => isCheckedInToday ? uncheckIn(habit.id) : checkIn(habit.id)}
              className={`flex-1 rounded-xl shadow-md transition-all h-11 ${
                isCheckedInToday
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-red-500 hover:to-orange-500 text-white shadow-emerald-500/20 opacity-100 group/btn"
                  : "bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-indigo-500/20"
              }`}>
              {isCheckedInToday ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2 group-hover/btn:hidden" />
                  <Circle className="h-5 w-5 mr-2 hidden group-hover/btn:block group-hover/btn:text-white" />
                  <span className="group-hover/btn:hidden">Checked In</span>
                  <span className="hidden group-hover/btn:block">Uncheck</span>
                </>
              ) : (
                <>
                  <Circle className="h-5 w-5 mr-2" />
                  Check In
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => toggleActive(habit.id)}
            className="flex-1 sm:flex-initial rounded-xl h-11 border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors">
            <Power className="h-4 w-4 mr-2" />
            {habit.active ? "Deactivate" : "Activate"}
          </Button>

          <Button
            variant="outline"
            onClick={() => deleteHabit(habit.id)}
            className="flex-1 sm:flex-initial rounded-xl h-11 border-red-100 dark:border-red-900/30 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitCard;
