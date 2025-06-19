import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./connect";
import { NextApiRequest, NextApiResponse } from "next";

// Tambahan deklarasi tipe untuk session dan JWT
import { User } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: User & {
      isAdmin: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin: boolean;
  }
}

// Konfigurasi NextAuth
export const authOptions: NextAuthOptions = {
  debug: false,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
    async jwt({ token }) {
      const userInDb = await prisma.user.findUnique({
        where: {
          email: token.email!,
        },
      });
      token.isAdmin = userInDb?.isAdmin ?? false;
      return token;
    },
  },
};

// Fungsi untuk digunakan di pages/api/*
export const getAuthSession = (req: NextApiRequest, res: NextApiResponse) =>
  getServerSession(req, res, authOptions);
