import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            // The monolith's robots.txt bans every address carrying a query
            // string ("Disallow: *?*"), which here would hide every filtered
            // day. Only the search results are worth keeping out.
            disallow: ["/search", "/api/"],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
