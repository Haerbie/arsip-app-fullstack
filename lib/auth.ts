import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import { account, session, user, verification } from "@/db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "mysql",
        schema: {
            user: user,
            account: account,
            session: session,
            verification: verification,
        }
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // We'll handle verification through admin approval
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
    account: {
        accountLinking: {
            enabled: false,
        },
    },
    // Custom hooks to handle user registration with pending status
    hooks: {
        after: [
            {
                matcher(context) {
                    return context.path === "/sign-up" && context.method === "POST";
                },
                handler: async (ctx) => {
                    // New users are created with pending status by default
                    // The superadmin will need to approve them
                    return {
                        success: true,
                        message: "Pendaftaran berhasil. Menunggu persetujuan dari Super Admin."
                    };
                },
            },
        ],
    },
});