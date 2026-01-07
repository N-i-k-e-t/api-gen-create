import { jwtVerify, SignJWT } from 'jose';


const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'default-insecure-secret-CHANGE-ME');
const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH || 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f'; // sha256 of '12345678'

export async function signSession(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(SECRET_KEY);
}

export async function verifySession(token: string | undefined) {
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload;
    } catch (e) {
        return null;
    }
}

export async function hashPassword(password: string): Promise<string> {
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyLogin(password: string): Promise<boolean> {
    const hash = await hashPassword(password);
    return hash === ADMIN_HASH;
}
