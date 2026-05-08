import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentHtml: string;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  schemaJson: Record<string, unknown> | null;
  publishedAt: string | null;
};

function upsertMeta(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertPropertyMeta(property: string, content: string) {
  let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

export default function BlogPostPage() {
  const [match, params] = useRoute("/blog/:slug");
  const slug = match ? params.slug : "";

  const { data, isLoading, isError } = useQuery<BlogPost>({
    queryKey: [`/api/blog/posts/${slug}`],
    enabled: Boolean(slug),
  });

  useEffect(() => {
    if (!data) return;
    const title = data.metaTitle || data.title;
    const description = data.metaDescription || data.excerpt || "Artículo del blog DominicanShuttle.";

    document.title = title;
    upsertMeta("description", description);
    upsertPropertyMeta("og:title", title);
    upsertPropertyMeta("og:description", description);
    upsertPropertyMeta("og:type", "article");
    upsertPropertyMeta("og:url", data.canonicalUrl || window.location.href);
    upsertMeta("twitter:card", "summary_large_image");
    upsertMeta("twitter:title", title);
    upsertMeta("twitter:description", description);

    let canonical = document.querySelector(`link[rel="canonical"]`) as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = data.canonicalUrl || window.location.href;

    const scriptId = "blog-schema-jsonld";
    let schemaScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schemaScript.id = scriptId;
      schemaScript.type = "application/ld+json";
      document.head.appendChild(schemaScript);
    }
    schemaScript.text = JSON.stringify(data.schemaJson || {});

    return () => {
      if (schemaScript) schemaScript.remove();
    };
  }, [data]);

  return (
    <section className="bg-black text-white min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/blog" className="text-coco-gold text-sm hover:underline">
          ← Volver al blog
        </Link>

        {isLoading && <p className="mt-8 text-white/70">Cargando artículo...</p>}
        {isError && <p className="mt-8 text-red-300">No se pudo cargar este artículo.</p>}

        {data ? (
          <article className="mt-6">
            <p className="text-sm text-white/50 mb-2">
              {data.publishedAt ? new Date(data.publishedAt).toLocaleDateString("es-DO") : "Sin fecha"}
            </p>
            <h1 className="text-3xl md:text-4xl font-serif font-semibold leading-tight mb-5">{data.title}</h1>
            {data.excerpt ? <p className="text-lg text-white/75 mb-10">{data.excerpt}</p> : null}
            <div
              className="prose prose-invert prose-headings:text-white prose-p:text-white/85 prose-a:text-coco-gold max-w-none"
              dangerouslySetInnerHTML={{ __html: data.contentHtml }}
            />

            <div className="mt-12 rounded-xl border border-coco-gold/40 bg-coco-gold/10 p-6">
              <h2 className="text-xl font-semibold mb-2">¿Listo para reservar tu traslado?</h2>
              <p className="text-white/80 mb-4">
                Agenda tu transporte en minutos y recibe confirmación rápida.
              </p>
              <Link
                href="/booking"
                className="inline-flex items-center rounded-md bg-coco-gold text-black font-semibold px-4 py-2 hover:opacity-90"
              >
                Reservar ahora
              </Link>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}
