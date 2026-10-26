import dotenv from 'dotenv';
dotenv.config();

function getEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is not defined`);
    }
    return value;
}

export const env = {
    BASE_URL: getEnv('BASE_URL'),
    LOGIN_USERNAME: getEnv('LOGIN_USERNAME'),
    LOGIN_PASSWORD: getEnv('LOGIN_PASSWORD'),
}
