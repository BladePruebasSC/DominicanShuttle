import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string | null;
  focusKeyword: string | null;
};

type BlogListResponse = {
  items: BlogPost[];
  page: number;
  limit: number;
  total: number;
};

export default function BlogPage() {
  const { data, isLoading, isError } = useQuery<BlogListResponse>({
    queryKey: ["/api/blog/posts?limit=12"],
  });

  return (
    <section className="bg-black text-white min-h-screen pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-coco-gold uppercase tracking-[0.28em] text-xs font-bold mb-3">Blog</p>
        <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Guías de transporte y turismo</h1>
        <p className="text-white/70 max-w-3xl mb-10">
          Consejos prácticos para planificar traslados en Punta Cana, elegir vehículo y optimizar tu experiencia de viaje.
        </p>

        {isLoading && <p className="text-white/70">Cargando artículos...</p>}
        {isError && <p className="text-red-300">No se pudieron cargar los artículos del blog.</p>}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(data?.items || []).map((post) => (
            <article
              key={post.id}
              className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-coco-gold/60 hover:bg-white/10"
            >
              {post.focusKeyword ? (
                <p className="text-[11px] uppercase tracking-[0.2em] text-coco-gold mb-3">{post.focusKeyword}</p>
              ) : null}
              <h2 className="text-lg font-semibold leading-snug mb-3">{post.title}</h2>
              <p className="text-sm text-white/70 mb-4 line-clamp-4">{post.excerpt || "Sin extracto disponible."}</p>
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("es-DO") : "Sin fecha"}</span>
                <Link href={`/blog/${post.slug}`} className="text-coco-gold hover:underline">
                  Leer más
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
