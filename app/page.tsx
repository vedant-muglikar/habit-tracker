"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Target,
  Flame,
  Calendar,
  TrendingUp,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import HabitCard from "@/components/HabitCard";

interface Habit {
  id: string;
  name: string;
  category: string;
  active: boolean;
  startDate: string;
  streak: number;
  lastCheckedIn: string | null;
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [formData, setFormData] = useState({ name: "", category: "health" });
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  // Fetch habits from database
  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await fetch("/api/habits");
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setHabits(data);
      }
    } catch (error) {
      console.error("Failed to fetch habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
        }),
      });

      if (response.ok) {
        const newHabit = await response.json();
        setHabits([...habits, newHabit]);
        setFormData({ name: "", category: "health" });
      }
    } catch (error) {
      console.error("Failed to add habit:", error);
    }
  };

  const checkIn = async (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    const habit = habits.find((h) => h.id === id);

    if (habit?.lastCheckedIn === today) return;

    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkIn" }),
      });

      if (response.ok) {
        setHabits(
          habits.map((h) =>
            h.id === id
              ? { ...h, streak: h.streak + 1, lastCheckedIn: today }
              : h,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to check in:", error);
    }
  };

  const toggleActive = async (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleActive",
          active: !habit.active,
        }),
      });

      if (response.ok) {
        setHabits(
          habits.map((h) => (h.id === id ? { ...h, active: !h.active } : h)),
        );
      }
    } catch (error) {
      console.error("Failed to toggle active:", error);
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setHabits(habits.filter((h) => h.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete habit:", error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      health: "#ef4444",
      fitness: "#f97316",
      learning: "#3b82f6",
      wellness: "#8b5cf6",
      work: "#06b6d4",
    };
    return colors[category] || "#6b7280";
  };

  const getCategoryBgColor = (category: string) => {
    const colors: Record<string, string> = {
      health: "#fee2e2",
      fitness: "#ffedd5",
      learning: "#dbeafe",
      wellness: "#ede9fe",
      work: "#cffafe",
    };
    return colors[category] || "#f3f4f6";
  };

  const today = new Date().toISOString().split("T")[0];

  // Calculate stats
  const activeHabits = habits.filter((h) => h.active).length;
  const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);
  const completedToday = habits.filter((h) => h.lastCheckedIn === today).length;
  const completionRate =
    activeHabits > 0 ? (completedToday / activeHabits) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Habit Tracker
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Build better habits, one day at a time
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Active Habits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {activeHabits}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Currently tracking
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Total Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {totalStreak}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Days combined
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
                Completed Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {completedToday}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Of {activeHabits} habits
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {Math.round(completionRate)}%
              </div>
              <Progress value={completionRate} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Add Habit Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Habit
            </CardTitle>
            <CardDescription>
              Start tracking a new habit to build consistency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={addHabit}
              className="flex flex-col lg:flex-row gap-3">
              <Input
                type="text"
                placeholder="Habit name (e.g., Morning Run)"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="flex-1"
                required
              />
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="health">🏥 Health</SelectItem>
                  <SelectItem value="fitness">💪 Fitness</SelectItem>
                  <SelectItem value="learning">📚 Learning</SelectItem>
                  <SelectItem value="wellness">🧘 Wellness</SelectItem>
                  <SelectItem value="work">💼 Work</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full lg:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Habit
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Habits List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-lg">
                    Loading habits...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : habits.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building better habits by adding your first one!
                  </p>
                  <Button
                    onClick={() =>
                      document.querySelector('input[type="text"]')?.focus()
                    }>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Habit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  checkIn={checkIn}
                  toggleActive={toggleActive}
                  deleteHabit={deleteHabit}
                  today={today}
                  getCategoryColor={getCategoryColor}
                  getCategoryBgColor={getCategoryBgColor}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
