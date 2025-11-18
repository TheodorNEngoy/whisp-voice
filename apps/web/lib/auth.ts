import { getServerSession, NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "github-client",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "github-secret",
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER ?? "smtp://localhost:1025",
      from: process.env.EMAIL_FROM ?? "noreply@whisp.local",
    }),
  ],
  session: { strategy: "jwt" },
};

export function auth() {
  return getServerSession(authOptions);
}
