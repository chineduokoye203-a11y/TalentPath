import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function run() {
  const email = "test" + Date.now() + "@test.com";
  const password = "Password123!";
  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = await db.user.create({
    data: {
      email,
      name: "Test User",
      passwordHash,
      role: "EMPLOYEE"
    }
  });

  console.log("Created user", email);

  try {
    const csrfRes = await fetch("http://127.0.0.1:3001/api/auth/csrf");
    const csrfJson = await csrfRes.json();
    const csrfToken = csrfJson.csrfToken;

    const cookieHeader = csrfRes.headers.get("set-cookie");
    const cookies = cookieHeader ? cookieHeader.split(",").map(c => c.split(";")[0]).join("; ") : "";

    console.log("Got CSRF token", csrfToken);

    const res = await fetch("http://127.0.0.1:3001/api/auth/callback/credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": cookies
      },
      body: new URLSearchParams({
        email,
        password,
        csrfToken,
        json: "true"
      })
    });

    const resText = await res.text();
    console.log("Login response:", res.status, resText);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
run().catch(console.error);
