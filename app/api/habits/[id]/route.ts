import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { id } from "date-fns/locale";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: habitId } = await params;

    // Delete from performance table first (foreign key constraint)
    await pool.query(`DELETE FROM performance WHERE habit_id = ${habitId}`);

    //Delete from description table
    await pool.query(
      `DELETE FROM habit_description WHERE habit_id = ${habitId}`,
    );

    //Delete from check_in table
    await pool.query(`DELETE FROM check_in WHERE habit_id = ${habitId}`);

    // Delete from habits table
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM habits WHERE id = ?",
      [habitId],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Habit deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Delete habit error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: habitId } = await params;
    const body = await request.json();
    const { action, active } = body;

    if (action === "checkIn") {
      const today = new Date().toISOString().split("T")[0];

      // Get current streak and last check-in date
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT streak, DATE_FORMAT(last_checked_in, '%Y-%m-%d') AS last_checked_in FROM performance WHERE habit_id = ?",
        [habitId],
      );

      if (rows.length === 0) {
        return NextResponse.json(
          { error: "Habit performance record not found" },
          { status: 404 },
        );
      }

      const currentStreak = rows[0].streak || 0;
      const lastCheckedInStr = rows[0].last_checked_in;

      if (lastCheckedInStr === today) {
        // Already checked in today, do not update db
        return NextResponse.json({
          message: "Already checked in today",
          streak: currentStreak,
        });
      }

      let newStreak = 1; // Default: start fresh streak

      if (lastCheckedInStr) {
        const lastDate = new Date(`${lastCheckedInStr}T00:00:00Z`);
        const todayDate = new Date(`${today}T00:00:00Z`);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day, increment streak
          newStreak = currentStreak + 1;
        } else if (diffDays <= 0) {
          // Fallback if future date
          newStreak = currentStreak;
        }
        // else: diffDays > 1, streak is reset to 1 (missed days)
      }

      // Update streak and last_checked_in
      await pool.query(
        "UPDATE performance SET streak = ?, last_checked_in = ? WHERE habit_id = ?",
        [newStreak, today, habitId],
      );

      return NextResponse.json({
        message: "Checked in successfully",
        streak: newStreak,
      });
    }

    if (action === "toggleActive") {
      await pool.query("UPDATE habits SET is_active = ? WHERE id = ?", [
        active ? 1 : 0,
        habitId,
      ]);

      return NextResponse.json({ message: "Habit status updated" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Update habit error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
