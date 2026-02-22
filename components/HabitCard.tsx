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
      className={`transition-all duration-300 hover:shadow-lg ${
        !habit.active ? "opacity-60" : ""
      } ${isCheckedInToday ? "ring-2 ring-green-500/20 border-green-200 dark:border-green-800" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">{getCategoryIcon(habit.category)}</div>
              <div className="flex-1">
                <h3
                  className={`text-xl font-semibold ${
                    !habit.active ? "text-muted-foreground" : "text-foreground"
                  }`}>
                  {habit.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: getCategoryBgColor(habit.category),
                      color: getCategoryColor(habit.category),
                    }}>
                    {habit.category}
                  </Badge>
                  {habit.active ? (
                    <Badge
                      variant="default"
                      className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                  {isCheckedInToday && (
                    <Badge
                      variant="default"
                      className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Done Today
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
            <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {habit.streak}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400">
              Day Streak
            </div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {daysSinceStart}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Days Total
            </div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {Math.round(consistencyRate)}%
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              Consistency
            </div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
            <Target className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              {new Date(habit.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">
              Started
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Consistency Progress</span>
            <span className="font-medium">{Math.round(consistencyRate)}%</span>
          </div>
          <Progress value={consistencyRate} className="h-2" />
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {habit.active && (
            <Button
              onClick={() => checkIn(habit.id)}
              disabled={isCheckedInToday}
              className={`flex-1 ${
                isCheckedInToday
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-primary hover:bg-primary/90"
              }`}>
              {isCheckedInToday ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completed Today
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4 mr-2" />
                  Check In
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => toggleActive(habit.id)}
            className="flex-1 sm:flex-initial">
            <Power className="h-4 w-4 mr-2" />
            {habit.active ? "Deactivate" : "Activate"}
          </Button>

          <Button
            variant="outline"
            onClick={() => deleteHabit(habit.id)}
            className="flex-1 sm:flex-initial text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitCard;
