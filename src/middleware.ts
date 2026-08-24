import { NextRequest, NextResponse } from "next/server";

// Legacy (Rails monolith) addresses are still honoured, but only as 301s:
//   /:slug                    -> /memory/:slug
//   /:slug/gallery            -> /memory/:slug/gallery
//   /:slug/:event             -> /memory/:slug/:event
//   /:slug/:event/gallery     -> /memory/:slug/:event/gallery
//   /:calendary/:slug         -> /memory/:slug?c=:calendary
//   /:calendary/:slug/:event  -> /memory/:slug/:event?c=:calendary
// The monolith disambiguated these with route constraints in routes.rb; we do it
// here on decoded segments so the app's own routes can stay namespaced and
// unambiguous. This whole file is the deprecation surface — when the old links
// have aged out, deleting it removes legacy support in one step.

// Top-level segments owned by the app; never read as a slug.
const RESERVED = new Set(["memory", "day", "search", "gallery", "rites", "about", "api", "_next"]);

// Monolith slugs are short lowercase Cyrillic (routes.rb: /[ёа-я0-9]{1,6}/).
const SLUG_RE = /^[ёа-я0-9]{1,8}$/;
const EVENT_RE = /^[0-9]{1,6}$/;

const isSlug = (part: string) => SLUG_RE.test(part);
const isEvent = (part: string) => EVENT_RE.test(part);

interface LegacyTarget {
    path: string;
    calendary?: string;
}

const resolveLegacyPath = (parts: string[]): LegacyTarget | null => {
    const [first, second, third] = parts;

    if (parts.length === 1 && isSlug(first)) {
        return { path: `/memory/${first}` };
    }

    if (parts.length === 2) {
        if (isSlug(first) && second === "gallery") return { path: `/memory/${first}/gallery` };
        if (isSlug(first) && isEvent(second)) return { path: `/memory/${first}/${second}` };
        // /:calendary/:slug — both Cyrillic, calendary comes first.
        if (isSlug(first) && isSlug(second)) return { path: `/memory/${second}`, calendary: first };
    }

    if (parts.length === 3) {
        if (isSlug(first) && isEvent(second) && third === "gallery") {
            return { path: `/memory/${first}/${second}/gallery` };
        }
        if (isSlug(first) && isSlug(second) && isEvent(third)) {
            return { path: `/memory/${second}/${third}`, calendary: first };
        }
    }

    return null;
};

const decode = (part: string) => {
    try {
        return decodeURIComponent(part);
    } catch {
        return part;
    }
};

export function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;
    const parts = pathname.split("/").filter(Boolean).map(decode);

    if (parts.length === 0 || RESERVED.has(parts[0])) {
        return NextResponse.next();
    }

    const target = resolveLegacyPath(parts);

    if (!target) {
        return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = target.path;
    // A calendary in the old path implied a selection; carry it across.
    if (target.calendary && !searchParams.has("c")) {
        url.searchParams.set("c", target.calendary);
    }

    const response = NextResponse.redirect(url, 301);
    // RFC 8594 — marks the old shape as on its way out for anything automated.
    response.headers.set("Deprecation", "true");
    response.headers.set("Link", `<${url.pathname}>; rel="successor-version"`);

    return response;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
