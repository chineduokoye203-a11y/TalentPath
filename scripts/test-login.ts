import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function test() {
  const users = await db.user.findMany({ take: 1, orderBy: { createdAt: "desc" } });
  if (users.length === 0) {
    console.log("No users found");
    return;
  }
  const user = users[0];
  console.log("Latest user email:", user.email);
  console.log("Latest user passwordHash:", user.passwordHash);
}
test().catch(console.error);
