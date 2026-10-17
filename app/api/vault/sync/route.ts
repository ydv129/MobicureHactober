import { type NextRequest, NextResponse } from "next/server";
import { getDbPool, initVaultTable } from "@/lib/db/vault-db";

export async function GET() {
  const pool = getDbPool();
  if (!pool) {
    return NextResponse.json({
      connected: false,
      message: "DATABASE_URL not configured. Using local browser storage.",
      items: [],
    });
  }

  try {
    await initVaultTable();
    const result = await pool.query(
      "SELECT id, title, category, encrypted_data, created_at, updated_at FROM vault_items ORDER BY updated_at DESC"
    );

    const items = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      data: JSON.parse(row.encrypted_data || "{}"),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({
      connected: true,
      items,
    });
  } catch (error) {
    console.error("[Vault Sync GET] Error querying database:", error);
    return NextResponse.json(
      {
        connected: false,
        error: "Failed to query vault database",
        items: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const pool = getDbPool();
  if (!pool) {
    return NextResponse.json({
      connected: false,
      message: "DATABASE_URL not configured. Operation skipped on server.",
    });
  }

  try {
    const item = await request.json();
    if (!item?.id || !item?.title) {
      return NextResponse.json({ error: "Invalid item payload" }, { status: 400 });
    }

    await initVaultTable();

    const query = `
      INSERT INTO vault_items (id, title, category, encrypted_data, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        encrypted_data = EXCLUDED.encrypted_data,
        updated_at = NOW()
    `;

    await pool.query(query, [
      item.id,
      item.title,
      item.category || "Secure Note",
      JSON.stringify(item.data || {}),
    ]);

    return NextResponse.json({ success: true, connected: true });
  } catch (error) {
    console.error("[Vault Sync POST] Error saving item:", error);
    return NextResponse.json(
      { error: "Failed to persist vault item to database" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const pool = getDbPool();
  if (!pool) {
    return NextResponse.json({
      connected: false,
      message: "DATABASE_URL not configured. Operation skipped on server.",
    });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    await initVaultTable();
    await pool.query("DELETE FROM vault_items WHERE id = $1", [id]);

    return NextResponse.json({ success: true, connected: true });
  } catch (error) {
    console.error("[Vault Sync DELETE] Error removing item:", error);
    return NextResponse.json(
      { error: "Failed to remove item from database" },
      { status: 500 }
    );
  }
}
