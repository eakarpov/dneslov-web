import { serializeJsonLd } from "../../../lib/jsonld";

const JsonLd = ({ data }: { data: object }) => (
    <script
        type="application/ld+json"
        // Escaped by serializeJsonLd; nothing from the payload can break out.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
);

export default JsonLd;
