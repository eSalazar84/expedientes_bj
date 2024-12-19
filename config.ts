import { config } from 'dotenv';
config({ path: '.env.local' });

export const DB_TYPE: any = process.env.DB_TYPE;
export const SECRET: string | undefined = process.env.SECRET;
export const HOST: string | undefined = process.env.HOST;
export const USER_DB_NAME: string | undefined = process.env.USER_DB_NAME;
export const USER_DB_PASSWORD: string | undefined = process.env.USER_DB_PASSWORD;
export const PORT: number = parseInt(process.env.PORT || '3306', 10);
export const DATABASE_NAME: string | undefined = process.env.DATABASE_NAME;

export const SUPERADMIN_DEPENDENCIA: string = process.env.SUPERADMIN_DEPENDENCIA
export const SUPERADMIN_EMAIL: string = process.env.SUPERADMIN_EMAIL
export const SUPERADMIN_PASSWORD: string = process.env.SUPERADMIN_PASSWORD

export const EMAIL_SERVICE: string = process.env.EMAIL_SERVICE
export const EMAIL_USER: string = process.env.EMAIL_USER
export const EMAIL_PASSWORD: string = process.env.EMAIL_PASSWORD

