import { Fragment, ReactNode } from "react";

// The corpus uses a narrow slice of Markdown — **bold**, occasional italics and
// links, plus paragraph and line breaks. That is small enough to render into
// React nodes directly, which is both far lighter than a full Markdown parser
// and safe by construction: nothing is ever handed to dangerouslySetInnerHTML.
//
// Note that scripta keep "/" and "//" literal on purpose — they are liturgical
// caesura marks, not markup.

const INLINE = /(\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|\[[^\]\n]+\]\([^)\s]+\))/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

const isExternal = (url: string) => /^https?:\/\//.test(url);

const renderInline = (text: string, keyPrefix: string): ReactNode[] => {
    const parts = text.split(INLINE);

    return parts.map((part, index) => {
        const key = `${keyPrefix}-${index}`;

        if (!part) return null;

        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={key}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("__") && part.endsWith("__")) {
            return <strong key={key}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
            return <em key={key}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith("_") && part.endsWith("_")) {
            return <em key={key}>{part.slice(1, -1)}</em>;
        }

        const link = LINK.exec(part);
        if (link) {
            const [, label, url] = link;
            return (
                <a
                    key={key}
                    href={url}
                    {...(isExternal(url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                    {label}
                </a>
            );
        }

        return <Fragment key={key}>{part}</Fragment>;
    });
};

const withLineBreaks = (paragraph: string, keyPrefix: string): ReactNode[] =>
    paragraph.split("\n").flatMap((line, index) => [
        index > 0 ? <br key={`${keyPrefix}-br-${index}`} /> : null,
        ...renderInline(line, `${keyPrefix}-${index}`),
    ]);

// For places that carry text but cannot carry markup — a feed summary, a
// calendar file description — the markers are removed rather than shown as
// literal asterisks.
export const plainText = (source?: string | null): string => {
    if (!source) return "";

    return source
        .replace(/\[([^\]\n]+)\]\([^)\s]+\)/g, "$1")
        .replace(/\*\*([^*\n]+)\*\*/g, "$1")
        .replace(/__([^_\n]+)__/g, "$1")
        .replace(/\*([^*\n]+)\*/g, "$1")
        .replace(/_([^_\n]+)_/g, "$1");
};

interface MarkdownProps {
    source?: string | null;
    // Inline mode renders no paragraphs — for places like a list row where the
    // text has to stay on one line.
    inline?: boolean;
    className?: string;
}

const Markdown = ({ source, inline = false, className }: MarkdownProps) => {
    if (!source) return null;

    if (inline) {
        return <span className={className}>{renderInline(source.replace(/\s+/g, " "), "i")}</span>;
    }

    const paragraphs = source.split(/\n{2,}/).filter((p) => p.trim());

    return (
        <div className={className}>
            {paragraphs.map((paragraph, index) => (
                <p key={index}>{withLineBreaks(paragraph, `p${index}`)}</p>
            ))}
        </div>
    );
};

export default Markdown;
