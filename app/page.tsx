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
import { Textarea } from "@/components/ui/textarea";
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
  const [formData, setFormData] = useState({
    name: "",
    category: "health",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const [today, setToday] = useState(new Date().toISOString().split("T")[0]);

  // Fetch habits from database
  useEffect(() => {
    fetchHabits();
  }, []);

  // Update "today" dynamically so check-ins reset at midnight
  useEffect(() => {
    const interval = setInterval(() => {
      const newToday = new Date().toISOString().split("T")[0];
      if (newToday !== today) {
        setToday(newToday);
        fetchHabits();
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [today]);

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
          description: formData.description,
        }),
      });

      if (response.ok) {
        const newHabit = await response.json();
        setHabits([...habits, newHabit]);
        setFormData({ name: "", category: "health", description: "" });
      }
    } catch (error) {
      console.error("Failed to add habit:", error);
    }
  };

  const checkIn = async (id: string) => {
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

  const uncheckIn = async (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (habit?.lastCheckedIn !== today) return;

    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "uncheckIn" }),
      });

      if (response.ok) {
        const data = await response.json();
        setHabits(
          habits.map((h) =>
            h.id === id
              ? { ...h, streak: data.streak, lastCheckedIn: data.lastCheckedIn }
              : h,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to uncheck in:", error);
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

  // Calculate stats
  const activeHabits = habits.filter((h) => h.active).length;
  const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);
  const completedToday = habits.filter((h) => h.lastCheckedIn === today).length;
  const completionRate =
    activeHabits > 0 ? (completedToday / activeHabits) * 100 : 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-cyan-50 dark:from-indigo-950/40 dark:via-background dark:to-cyan-950/20">
      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl shadow-lg shadow-indigo-500/20">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent transform transition-all tracking-tight">
                Habit Tracker
              </h1>
            </div>
            <p className="text-muted-foreground text-lg ml-1 font-medium">
              Build better habits, one day at a time
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full shadow-md bg-white/50 dark:bg-black/20 backdrop-blur border-indigo-100 dark:border-indigo-900/30 hover:bg-white dark:hover:bg-black/40 transition-all h-11 w-11">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <Card className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border-indigo-200/60 dark:border-white/5 shadow-xl shadow-blue-900/5 dark:shadow-blue-900/10 transition-transform hover:scale-[1.02]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide text-blue-600 dark:text-blue-400 uppercase">
                Active Habits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-blue-950 dark:text-blue-50">
                {activeHabits}
              </div>
              <p className="text-sm font-medium text-blue-600/70 dark:text-blue-400/70 mt-1">
                Currently tracking
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border-indigo-200/60 dark:border-white/5 shadow-xl shadow-orange-900/5 dark:shadow-orange-900/10 transition-transform hover:scale-[1.02]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide text-orange-600 dark:text-orange-400 flex items-center gap-2 uppercase">
                <Flame className="h-4 w-4" />
                Total Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-orange-950 dark:text-orange-50">
                {totalStreak}
              </div>
              <p className="text-sm font-medium text-orange-600/70 dark:text-orange-400/70 mt-1">
                Days combined
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border-indigo-200/60 dark:border-white/5 shadow-xl shadow-green-900/5 dark:shadow-green-900/10 transition-transform hover:scale-[1.02]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide text-green-600 dark:text-green-400 uppercase">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-green-950 dark:text-green-50">
                {completedToday}
              </div>
              <p className="text-sm font-medium text-green-600/70 dark:text-green-400/70 mt-1">
                Of {activeHabits} habits today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border-indigo-200/60 dark:border-white/5 shadow-xl shadow-purple-900/5 dark:shadow-purple-900/10 transition-transform hover:scale-[1.02]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide text-purple-600 dark:text-purple-400 flex items-center gap-2 uppercase">
                <TrendingUp className="h-4 w-4" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-purple-950 dark:text-purple-50">
                {Math.round(completionRate)}%
              </div>
              <Progress value={completionRate} className="mt-3 h-2.5 bg-purple-100 dark:bg-purple-950" />
            </CardContent>
          </Card>
        </div>

        {/* Add Habit Form */}
        <Card className="mb-10 bg-white/70 dark:bg-black/40 backdrop-blur-xl border-indigo-200/60 dark:border-white/5 shadow-xl shadow-indigo-900/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5 text-indigo-500" />
              Add New Habit
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground/80">
              Start tracking a new habit to build consistency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addHabit} className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="Habit name (e.g., Morning Run)"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="flex-1 h-12 rounded-xl border-indigo-100 dark:border-indigo-900/30 bg-white/50 dark:bg-black/20 focus-visible:ring-indigo-500/50"
                  required
                />
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }>
                  <SelectTrigger className="w-full lg:w-48 h-12 rounded-xl border-indigo-100 dark:border-indigo-900/30 bg-white/50 dark:bg-black/20 focus:ring-indigo-500/50">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-indigo-100 dark:border-indigo-900/30">
                    <SelectItem value="health" className="rounded-lg">🏥 Health</SelectItem>
                    <SelectItem value="fitness" className="rounded-lg">💪 Fitness</SelectItem>
                    <SelectItem value="learning" className="rounded-lg">📚 Learning</SelectItem>
                    <SelectItem value="wellness" className="rounded-lg">🧘 Wellness</SelectItem>
                    <SelectItem value="work" className="rounded-lg">💼 Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Description (optional - e.g., Run for 30 minutes every morning)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="min-h-[100px] resize-none rounded-xl border-indigo-100 dark:border-indigo-900/30 bg-white/50 dark:bg-black/20 focus-visible:ring-indigo-500/50 p-4"
              />
              <div className="flex justify-end">
                <Button type="submit" className="w-full lg:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Habit
                </Button>
              </div>
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
                      (document.querySelector('input[type="text"]') as HTMLElement)?.focus()
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
                  uncheckIn={uncheckIn}
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
