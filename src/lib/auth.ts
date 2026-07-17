import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const { email, password } = credentialsSchema.parse(credentials);
          console.log("Authorize called for:", email);
          const user = await db.user.findUnique({ where: { email } });
          if (!user || !user.passwordHash) {
            console.log("User not found or no password hash");
            return null;
          }

          console.log("Checking password using bcrypt...");
          const passwordMatch = bcrypt.compareSync(password, user.passwordHash);
          console.log("Password match result:", passwordMatch);
          if (!passwordMatch) {
            console.log("Password did not match");
            return null;
          }

          console.log("User authenticated successfully");
          const company = user.companyId ? await db.company.findUnique({ where: { id: user.companyId } }) : null;
          const companyName = company?.name || "";
          const profile = user.id ? await db.profile.findUnique({ where: { userId: user.id } }) : null;
          return { id: user.id, email: user.email, role: user.role, name: user.name, companyName, jobTitle: profile?.jobTitle ?? null };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.companyName = (user as any).companyName;
        token.jobTitle = (user as any).jobTitle;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).companyName = token.companyName;
        (session.user as any).jobTitle = token.jobTitle;
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 }, // 24 hours
});
