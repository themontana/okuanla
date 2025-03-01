import { NextResponse } from "next/server";

const rateLimit = new Map();

export function middleware(req) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();

    if (!rateLimit.has(ip)) {
        rateLimit.set(ip, { count: 1, time: now });
    } else {
        const entry = rateLimit.get(ip);
        const timeElapsed = now - entry.time;

        if (timeElapsed < 60000) { // 60 saniye içinde...
            if (entry.count >= 5) { // Maksimum 5 istek
                return new NextResponse("Çok fazla istek attınız, lütfen biraz bekleyin.", { status: 429 });
            }
            entry.count += 1;
        } else {
            // Zaman aşımı, tekrar sıfırla
            rateLimit.set(ip, { count: 1, time: now });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/api/:path*", // Sadece API isteklerine uygula
};
