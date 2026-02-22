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

      // Update streak and last_checked_in
      await pool.query(
        "UPDATE performance SET streak = streak + 1 WHERE habit_id = ?",
        [habitId],
      );

      return NextResponse.json({ message: "Checked in successfully" });
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
