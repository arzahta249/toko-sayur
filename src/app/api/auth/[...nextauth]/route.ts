// src/app/api/auth/[...nextauth]/route.ts
export const dynamic = "force-dynamic";

import NextAuth from "next-auth";
import { authOptions } from "@/utils/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
