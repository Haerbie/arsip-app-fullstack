import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
    out: './drizzle',
    schema: './db/schema/index.ts',
    dialect: 'mysql',
    dbCredentials: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'arsip_app',
    },
    tablesFilter: ["arsip_app_*"],
} satisfies Config;
