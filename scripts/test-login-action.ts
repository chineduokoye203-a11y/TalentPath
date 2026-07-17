import { loginAction } from "../src/features/identity/actions/login";
import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function test() {
  const email = "actiontest@test.com";
  const password = "Password123!";
  const passwordHash = await bcrypt.hash(password, 10);
  
  await db.user.create({
    data: { email, name: "Test User", passwordHash, role: "EMPLOYEE" }
  });

  const fd = new FormData();
  fd.append("email", email);
  fd.append("password", password);
  
  console.log("Calling loginAction...");
  const result = await loginAction(fd);
  console.log("Result:", result);
}
test().catch(console.error);
