import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET() {
  try {
    const query =
      "select * from habits h left join habit_category hc on h.cat_hab_id = hc.id left join performance p on h.id = p.habit_id where h.is_active = 1";

    const [rows] = await pool.query<RowDataPacket[]>(query);

    // Transform database rows to frontend format
    const habits = rows.map((row: any) => ({
      id: row.id?.toString(),
      name: row.habit_name,
      category: row.type,
      active: row.is_active === 1 || row.is_active === true,
      startDate: row.start_date || new Date().toISOString().split("T")[0],
      streak: row.streak || 0,
      lastCheckedIn: row.last_checked_in || null,
    }));

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
    const { name, category } = body;

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
