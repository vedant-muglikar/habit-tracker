import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET() {
  try {
    const query =
      "SELECT h.id, h.habit_name, h.is_active, hc.type, DATE_FORMAT(p.start_date, '%Y-%m-%d') AS start_date, p.streak, DATE_FORMAT(p.last_checked_in, '%Y-%m-%d') AS last_checked_in FROM habits h LEFT JOIN habit_category hc ON h.cat_hab_id = hc.id LEFT JOIN performance p ON h.id = p.habit_id WHERE h.is_active = 1";

    const [rows] = await pool.query<RowDataPacket[]>(query);

    const today = new Date().toISOString().split("T")[0];
    const todayDate = new Date(`${today}T00:00:00Z`);

    const habitsToReset: number[] = [];

    // Transform database rows to frontend format
    const habits = rows.map((row: any) => {
      let effectiveStreak = row.streak || 0;
      const lastCheckedIn = row.last_checked_in || null;

      if (lastCheckedIn && effectiveStreak > 0) {
        const lastDate = new Date(`${lastCheckedIn}T00:00:00Z`);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
          effectiveStreak = 0;
          habitsToReset.push(row.id);
        }
      }

      return {
        id: row.id.toString(),
        name: row.habit_name,
        category: row.type,
        active: row.is_active === 1 || row.is_active === true,
        startDate: row.start_date || new Date().toISOString().split("T")[0],
        streak: effectiveStreak,
        lastCheckedIn: lastCheckedIn,
      };
    });

    if (habitsToReset.length > 0) {
      // Async update in the background so we don't block the request unnecessarily
      pool.query("UPDATE performance SET streak = 0 WHERE habit_id IN (?)", [
        habitsToReset,
      ]).catch(err => console.error("Failed to reset streaks:", err));
    }

    return NextResponse.json(habits);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, description } = body;

    // Get category ID from category name
    const [categoryRows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM habit_category WHERE type = ?",
      [category],
    );

    let categoryId: number;
    if (categoryRows.length === 0) {
      // Create new category if it doesn't exist
      const [categoryResult] = await pool.query<ResultSetHeader>(
        "INSERT INTO habit_category (type, polarity) VALUES (?, ?)",
        [category, "positive"],
      );
      categoryId = categoryResult.insertId;
    } else {
      categoryId = (categoryRows[0] as any).id;
    }

    // Insert into habits table
    const [habitResult] = await pool.query<ResultSetHeader>(
      "INSERT INTO habits (habit_name, cat_hab_id, is_active) VALUES (?, ?, ?)",
      [name, categoryId, 1],
    );

    const habitId = habitResult.insertId;

    // Insert into performance table
    const startDate = new Date().toISOString().split("T")[0];
    await pool.query<ResultSetHeader>(
      "INSERT INTO performance (habit_id, start_date, streak) VALUES (?, ?, ?)",
      [habitId, startDate, 0],
    );

    // Insert into habit_description table if description is provided
    if (description && description.trim()) {
      await pool.query<ResultSetHeader>(
        "INSERT INTO habit_description (habit_id, description) VALUES (?, ?)",
        [habitId, description.trim()],
      );
    }

    return NextResponse.json(
      {
        id: habitId.toString(),
        name,
        category,
        active: true,
        startDate,
        streak: 0,
        lastCheckedIn: null,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
