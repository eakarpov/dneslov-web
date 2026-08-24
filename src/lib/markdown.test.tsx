import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "./markdown";

const render = (source?: string | null, inline = false) =>
    renderToStaticMarkup(<Markdown source={source} inline={inline} />);

describe("Markdown", () => {
    it("renders nothing for empty input", () => {
        expect(render(null)).toBe("");
        expect(render("")).toBe("");
    });

    it("renders bold and italics", () => {
        expect(render("а **б** в")).toContain("<strong>б</strong>");
        expect(render("а __б__ в")).toContain("<strong>б</strong>");
        expect(render("а *б* в")).toContain("<em>б</em>");
        expect(render("а _б_ в")).toContain("<em>б</em>");
    });

    it("renders links and opens external ones in a new tab", () => {
        const external = render("см. [Древо](https://drevo-info.ru/articles/28.html)");
        expect(external).toContain('href="https://drevo-info.ru/articles/28.html"');
        expect(external).toContain('target="_blank"');
        expect(external).toContain('rel="noopener noreferrer"');

        const internal = render("см. [память](/memory/спас)");
        expect(internal).toContain('href="/memory/спас"');
        expect(internal).not.toContain("target=");
    });

    it("splits paragraphs on a blank line and keeps single breaks", () => {
        const html = render("первый\nвторой\n\nтретий");
        expect(html).toBe("<div><p>первый<br/>второй</p><p>третий</p></div>");
    });

    it("emits no paragraphs in inline mode", () => {
        const html = render("первый\nвторой", true);
        expect(html).not.toContain("<p>");
        expect(html).toBe("<span>первый второй</span>");
    });

    it("escapes anything that looks like markup", () => {
        // Texts come from the backend; nothing here may become live markup.
        const html = render('<script>alert("x")</script> и <b>жирный</b>');
        expect(html).not.toContain("<script>");
        expect(html).not.toContain("<b>");
        expect(html).toContain("&lt;script&gt;");
    });

    it("leaves liturgical slashes alone", () => {
        // "/" and "//" are caesura marks in scripta, not markup.
        const html = render("Апостолов первопрестольницы/ и вселенныя учителие,// и душам нашим");
        expect(html).toContain("первопрестольницы/ и вселенныя учителие,// и душам");
    });

    it("does not treat an unpaired asterisk as emphasis", () => {
        expect(render("5 * 3 = 15")).toContain("5 * 3 = 15");
    });
});
