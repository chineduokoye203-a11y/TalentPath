import { db } from "../src/lib/db";

async function run() {
  const users = await db.user.findMany();
  let updated = 0;
  for (const user of users) {
    const lowerEmail = user.email.toLowerCase().trim();
    if (user.email !== lowerEmail) {
      console.log(`Updating ${user.email} to ${lowerEmail}`);
      try {
        await db.user.update({
          where: { id: user.id },
          data: { email: lowerEmail },
        });
        updated++;
      } catch (err) {
        console.error(`Failed to update ${user.email}:`, err);
      }
    }
  }
  console.log(`Updated ${updated} users.`);
}

run().catch(console.error);
