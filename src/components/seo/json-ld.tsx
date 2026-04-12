type JsonLdProps = {
  /** Single object or array of schema.org nodes (with @context on the object if required). */
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Emits a JSON-LD script. Use only with trusted, server-built data (never user HTML).
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
