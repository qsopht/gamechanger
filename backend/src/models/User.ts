import { sql } from '../db';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  created_at: Date;
  updated_at: Date;
}

export async function createUser(email: string, passwordHash: string, fullName?: string): Promise<User> {
  const result = await sql`
    INSERT INTO users (email, password_hash, full_name)
    VALUES (${email}, ${passwordHash}, ${fullName || null})
    RETURNING *
  `;
  return result[0];
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE id = ${id}
  `;
  return result[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;
  return result[0] || null;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const result = await sql`
    UPDATE users
    SET 
      full_name = COALESCE(${updates.full_name || null}, full_name),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}
