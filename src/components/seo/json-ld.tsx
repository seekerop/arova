interface JsonLdProps {
  data: Record<string, any> | Array<Record<string, any>> | null | undefined;
}

export function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;

  // Protect against script tags in stringified content
  const jsonString = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}

