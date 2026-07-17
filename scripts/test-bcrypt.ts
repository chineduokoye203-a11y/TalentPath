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
  
  // Since we don't know the password, let's create a new user with a known password
  const password = "Password123!";
  const hash = await bcrypt.hash(password, 10);
  
  // Compare it using bcryptjs
  const match1 = await bcrypt.compare(password, hash);
  console.log("Fresh hash match:", match1);
  
  // Now let's try bcrypt compare with a manually created user
}
test().catch(console.error);
