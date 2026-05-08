import type { Express } from "express";
import { z } from "zod";
import { getSupabaseAdmin } from "./supabase-admin";

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_markdown: string | null;
  content_html: string;
  cover_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  focus_keyword: string | null;
  schema_json: Record<string, unknown> | null;
  status: "draft" | "scheduled" | "published" | "failed";
  publish_at: string | null;
  published_at: string | null;
  source: string | null;
  ai_model: string | null;
  tokens_used: number | null;
  generation_error: string | null;
  created_at: string;
  updated_at: string;
};

type BlogPostDto = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentMarkdown: string | null;
  contentHtml: string;
  coverImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  focusKeyword: string | null;
  schemaJson: Record<string, unknown> | null;
  status: string;
  publishAt: string | null;
  publishedAt: string | null;
  source: string | null;
  aiModel: string | null;
  tokensUsed: number | null;
  generationError: string | null;
  createdAt: string;
  updatedAt: string;
};

type GeneratedPost = {
  title: string;
  excerpt: string;
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
  contentHtml: string;
  contentMarkdown?: string | null;
};

const publishDailyBodySchema = z.object({
  date: z.string().optional(),
  force: z.boolean().optional(),
});

const generateBodySchema = z.object({
  topic: z.string().min(5).max(180).optional(),
  force: z.boolean().optional(),
});

const upsertBlogPostSchema = z.object({
  title: z.string().min(10).max(180),
  slug: z.string().min(3).max(100).optional(),
  excerpt: z.string().max(400).optional().nullable(),
  contentMarkdown: z.string().optional().nullable(),
  contentHtml: z.string().min(50),
  coverImageUrl: z.string().url().optional().nullable(),
  metaTitle: z.string().max(90).optional().nullable(),
  metaDescription: z.string().max(200).optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable(),
  focusKeyword: z.string().max(120).optional().nullable(),
  status: z.enum(["draft", "scheduled", "published", "failed"]).optional(),
  publishAt: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
});

function mapBlogPost(row: BlogPostRow): BlogPostDto {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    contentMarkdown: row.content_markdown,
    contentHtml: row.content_html,
    coverImageUrl: row.cover_image_url,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    canonicalUrl: row.canonical_url,
    focusKeyword: row.focus_keyword,
    schemaJson: row.schema_json,
    status: row.status,
    publishAt: row.publish_at,
    publishedAt: row.published_at,
    source: row.source,
    aiModel: row.ai_model,
    tokensUsed: row.tokens_used,
    generationError: row.generation_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getBaseUrl() {
  const fromEnv = String(process.env.PUBLIC_BASE_URL || "").trim();
  return fromEnv || "https://dominicanshuttle.onrender.com";
}

function normalizeText(value: string, maxLength: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function slugify(input: string) {
  const base = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base.slice(0, 70);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fallbackGeneratedPost(topic: string): GeneratedPost {
  const title = normalizeText(topic || "Guía de transporte privado en Punta Cana", 90);
  const keyword = "transporte privado punta cana";
  const excerpt =
    "Descubre cómo organizar traslados seguros y puntuales en Punta Cana con recomendaciones prácticas para aeropuerto, hoteles y excursiones.";
  const contentHtml = `
<h1>${escapeHtml(title)}</h1>
<p>Planificar un traslado privado en Punta Cana ahorra tiempo, evita contratiempos y mejora la experiencia del viaje desde el primer día.</p>
<h2>1) Reserva con antelación y confirma horario</h2>
<p>Para rutas aeropuerto-hotel, confirma tu horario de llegada y deja margen para migración y equipaje.</p>
<h2>2) Define tipo de vehículo según equipaje</h2>
<p>No todos los grupos necesitan el mismo espacio. Verifica pasajeros y maletas para elegir sedan, SUV o van.</p>
<h2>3) Comparte referencia y canal de contacto</h2>
<p>Mantén a mano el ID de reserva y teléfono de contacto para resolver cualquier ajuste de última hora.</p>
<h2>Preguntas frecuentes</h2>
<h3>¿Cuánto tarda el traslado desde PUJ?</h3>
<p>Depende del destino final, pero la mayoría de rutas turísticas se resuelven entre 20 y 60 minutos.</p>
<h3>¿Se puede reservar para grupos?</h3>
<p>Sí, con flota adaptada para familias y grupos de diferentes tamaños.</p>
<p>Si quieres reservar tu próximo traslado, visita nuestra página de reservas y asegura disponibilidad con antelación.</p>
`;
  const metaTitle = normalizeText(`${title} | DominicanShuttle`, 60);
  const metaDescription = normalizeText(excerpt, 155);
  return {
    title,
    excerpt,
    focusKeyword: keyword,
    metaTitle,
    metaDescription,
    contentHtml: contentHtml.trim(),
    contentMarkdown: null,
  };
}

function buildArticleSchema(post: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAtIso: string;
}) {
  const url = `${getBaseUrl()}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAtIso,
    dateModified: post.publishedAtIso,
    author: {
      "@type": "Organization",
      name: process.env.BLOG_DEFAULT_AUTHOR || "DominicanShuttle",
    },
    publisher: {
      "@type": "Organization",
      name: "DominicanShuttle",
    },
    mainEntityOfPage: url,
  };
}

async function callOpenAi(topic: string): Promise<GeneratedPost> {
  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) return fallbackGeneratedPost(topic);

  const model = String(process.env.OPENAI_MODEL || "gpt-4o-mini").trim();
  const prompt = `
Eres redactor SEO para una agencia de transporte turístico en Punta Cana.
Devuelve JSON válido con estas claves:
- title
- excerpt
- focusKeyword
- metaTitle (max 60)
- metaDescription (max 155)
- contentHtml (HTML limpio con h1, h2, párrafos y FAQ)

Objetivo: contenido comercial útil, tono premium y claro.
Tema base: ${topic}
Idioma: español.
Incluir CTA final a reservar en /booking.
No incluyas scripts ni estilos.
`.trim();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Responde únicamente JSON válido." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    throw new Error(`OpenAI error ${response.status}: ${txt.slice(0, 300)}`);
  }

  const body = await response.json();
  const content = String(body?.choices?.[0]?.message?.content || "").trim();
  const parsed = JSON.parse(content);

  const generated: GeneratedPost = {
    title: normalizeText(String(parsed.title || topic), 90),
    excerpt: normalizeText(String(parsed.excerpt || ""), 180),
    focusKeyword: normalizeText(String(parsed.focusKeyword || "transporte punta cana"), 90),
    metaTitle: normalizeText(String(parsed.metaTitle || parsed.title || topic), 60),
    metaDescription: normalizeText(String(parsed.metaDescription || parsed.excerpt || ""), 155),
    contentHtml: String(parsed.contentHtml || "").trim(),
    contentMarkdown: parsed.contentMarkdown ? String(parsed.contentMarkdown) : null,
  };

  if (!generated.contentHtml || generated.contentHtml.length < 500) {
    return fallbackGeneratedPost(topic);
  }
  return generated;
}

async function uniqueSlug(baseSlug: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase admin no está configurado en el servidor");

  let slug = baseSlug;
  let suffix = 1;
  while (true) {
    const { data, error } = await supabase.from("blog_posts").select("id").eq("slug", slug).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

async function uniqueSlugForUpdate(baseSlug: string, currentId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase admin no está configurado en el servidor");

  let slug = baseSlug;
  let suffix = 1;
  while (true) {
    const { data, error } = await supabase.from("blog_posts").select("id").eq("slug", slug).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data || data.id === currentId) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

async function hasPostPublishedOnDate(dateIso: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase admin no está configurado en el servidor");

  const from = new Date(dateIso);
  from.setUTCHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 1);

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .gte("published_at", from.toISOString())
    .lt("published_at", to.toISOString())
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as BlogPostRow | null;
}

function pickDailyTopic(dateIso: string) {
  const dayNumber = Math.floor(new Date(dateIso).getTime() / 86400000);
  const topics = [
    "Guía para traslados privados en Punta Cana desde el aeropuerto",
    "Cómo elegir entre sedan, SUV o van para tu transporte en Punta Cana",
    "Consejos para traslados de hotel a excursiones en Punta Cana",
    "Errores comunes al reservar transporte turístico y cómo evitarlos",
    "Qué esperar de un servicio de transporte premium en Punta Cana",
    "Cómo optimizar tiempos de llegada y salida en vuelos a PUJ",
    "Checklist de viaje familiar con transporte privado en República Dominicana",
  ];
  return topics[Math.abs(dayNumber) % topics.length];
}

async function notifyBlogFailure(message: string) {
  const webhook = String(process.env.BLOG_ALERT_WEBHOOK_URL || "").trim();
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "blog.autopublish.failed",
        occurredAt: new Date().toISOString(),
        message,
      }),
    });
  } catch (error) {
    console.error("[blog] alert webhook failed:", error);
  }
}

function checkBlogSecret(req: any, res: any) {
  const secret = String(process.env.BLOG_AUTOPUBLISH_SECRET || "").trim();
  if (!secret) return true;
  const provided = String(req.header("x-blog-secret") || req.query.secret || "");
  if (provided !== secret) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }
  return true;
}

async function generateAndStorePost(args: { topic?: string; publishAt?: string }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase admin no está configurado en el servidor");

  const publishAtIso = args.publishAt || new Date().toISOString();
  const topic = args.topic || pickDailyTopic(publishAtIso);
  const generated = await callOpenAi(topic);
  const baseSlug = slugify(generated.title) || `blog-${Date.now()}`;
  const slug = await uniqueSlug(baseSlug);

  const schemaJson = buildArticleSchema({
    title: generated.title,
    excerpt: generated.excerpt,
    slug,
    publishedAtIso: publishAtIso,
  });
  const canonicalUrl = `${getBaseUrl()}/blog/${slug}`;

  const insertRow = {
    title: generated.title,
    slug,
    excerpt: generated.excerpt,
    content_markdown: generated.contentMarkdown ?? null,
    content_html: generated.contentHtml,
    cover_image_url: null,
    meta_title: generated.metaTitle,
    meta_description: generated.metaDescription,
    canonical_url: canonicalUrl,
    focus_keyword: generated.focusKeyword,
    schema_json: schemaJson,
    status: "published",
    publish_at: publishAtIso,
    published_at: publishAtIso,
    published_day: publishAtIso.slice(0, 10),
    source: process.env.OPENAI_API_KEY ? "ai" : "template",
    ai_model: process.env.OPENAI_MODEL || (process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "fallback-template"),
    tokens_used: null,
    generation_error: null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("blog_posts").insert(insertRow).select("*").single();
  if (error) throw new Error(error.message);
  return mapBlogPost(data as BlogPostRow);
}

async function publishDaily(args?: { date?: string; force?: boolean }) {
  const runDate = args?.date ? new Date(args.date) : new Date();
  const iso = runDate.toISOString();
  const existing = await hasPostPublishedOnDate(iso);

  if (existing && !args?.force) {
    return {
      published: false,
      reason: "already_published",
      post: mapBlogPost(existing),
    };
  }

  const post = await generateAndStorePost({
    topic: pickDailyTopic(iso),
    publishAt: iso,
  });

  return {
    published: true,
    reason: existing ? "force_republished" : "created",
    post,
  };
}

let blogSchedulerStarted = false;
let blogLastRunMarker = "";
let blogLastHealthAlertMarker = "";

function parseCronHourMinute() {
  const value = String(process.env.BLOG_AUTOPUBLISH_CRON || "07:30").trim();
  const match = value.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!match) return { hour: 7, minute: 30 };
  const hour = Math.min(23, Math.max(0, Number(match[1])));
  const minute = Math.min(59, Math.max(0, Number(match[2])));
  return { hour, minute };
}

export function startBlogAutopublishScheduler() {
  if (blogSchedulerStarted) return;
  blogSchedulerStarted = true;

  const enabled = String(process.env.BLOG_AUTOPUBLISH_ENABLED || "false").toLowerCase() !== "false";
  if (!enabled) return;

  const timezone = String(process.env.BLOG_AUTOPUBLISH_TIMEZONE || "America/Santo_Domingo");
  const { hour, minute } = parseCronHourMinute();

  setInterval(async () => {
    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) return;

      const now = new Date();
      const locale = now.toLocaleString("sv-SE", {
        timeZone: timezone,
        hour12: false,
      });
      const datePart = locale.slice(0, 10);
      const hourPart = Number(locale.slice(11, 13));
      const minutePart = Number(locale.slice(14, 16));
      const marker = `${datePart}-${hourPart}-${minutePart}`;

      if (hourPart !== hour || minutePart !== minute || marker === blogLastRunMarker) {
        // Health check every hour to detect stale publication.
        if (minutePart === 0) {
          const healthMarker = `${datePart}-${hourPart}`;
          if (healthMarker !== blogLastHealthAlertMarker) {
            blogLastHealthAlertMarker = healthMarker;
            const dayAgoIso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
            const { data, error } = await supabase
              .from("blog_posts")
              .select("id,published_at")
              .eq("status", "published")
              .gte("published_at", dayAgoIso)
              .order("published_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            if (!error && !data) {
              await notifyBlogFailure("[blog] No hay post publicado en las últimas 24 horas");
            }
          }
        }
        return;
      }

      blogLastRunMarker = marker;
      const result = await publishDaily();
      if (!result.published) {
        console.log("[blog] daily skipped:", result.reason);
      } else {
        console.log("[blog] daily post published:", result.post.slug);
      }
    } catch (error: any) {
      const message = `[blog] scheduler failed: ${error?.message || String(error)}`;
      console.error(message);
      await notifyBlogFailure(message);
    }
  }, 60000);
}

export function registerBlogRoutes(app: Express) {
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).json({ message: "Supabase admin no está configurado en el servidor" });
        return;
      }

      const query = z
        .object({
          page: z.coerce.number().int().min(1).optional(),
          limit: z.coerce.number().int().min(1).max(200).optional(),
          status: z.enum(["all", "draft", "scheduled", "published", "failed"]).optional(),
        })
        .parse(req.query);

      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const status = query.status || "published";

      let dbQuery = supabase
        .from("blog_posts")
        .select("*", { count: "exact" })
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (status !== "all") {
        dbQuery = dbQuery.eq("status", status);
      }

      const { data, count, error } = await dbQuery;

      if (error) {
        res.status(500).json({ message: "Failed to fetch blog posts", error: error.message });
        return;
      }

      res.json({
        items: (data || []).map((row) => mapBlogPost(row as BlogPostRow)),
        page,
        limit,
        total: count ?? 0,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid query params", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to fetch blog posts" });
      }
    }
  });

  app.get("/api/blog/posts/:slug", async (req, res) => {
    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).json({ message: "Supabase admin no está configurado en el servidor" });
        return;
      }

      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", req.params.slug)
        .eq("status", "published")
        .single();

      if (error || !data) {
        res.status(404).json({ message: "Blog post not found" });
        return;
      }

      res.json(mapBlogPost(data as BlogPostRow));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog/posts/generate", async (req, res) => {
    try {
      if (!checkBlogSecret(req, res)) return;
      const body = generateBodySchema.parse(req.body || {});
      const nowIso = new Date().toISOString();

      const post = await generateAndStorePost({
        topic: body.topic,
        publishAt: nowIso,
      });

      res.status(201).json({
        generated: true,
        post,
      });
    } catch (error: any) {
      const message = error?.message || "Failed to generate blog post";
      await notifyBlogFailure(message);
      res.status(500).json({ message: "Failed to generate blog post", error: message });
    }
  });

  app.post("/api/blog/posts", async (req, res) => {
    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).json({ message: "Supabase admin no está configurado en el servidor" });
        return;
      }

      const body = upsertBlogPostSchema.parse(req.body || {});
      const normalizedSlug = slugify(body.slug || body.title) || `blog-${Date.now()}`;
      const slug = await uniqueSlug(normalizedSlug);
      const nowIso = new Date().toISOString();
      const status = body.status || "draft";
      const publishedAt = status === "published" ? body.publishedAt || nowIso : null;
      const canonicalUrl = body.canonicalUrl || `${getBaseUrl()}/blog/${slug}`;
      const schemaJson =
        status === "published"
          ? buildArticleSchema({
              title: body.title,
              excerpt: body.excerpt || "",
              slug,
              publishedAtIso: publishedAt || nowIso,
            })
          : null;

      const { data, error } = await supabase
        .from("blog_posts")
        .insert({
          title: body.title,
          slug,
          excerpt: body.excerpt ?? null,
          content_markdown: body.contentMarkdown ?? null,
          content_html: body.contentHtml,
          cover_image_url: body.coverImageUrl ?? null,
          meta_title: body.metaTitle ?? null,
          meta_description: body.metaDescription ?? null,
          canonical_url: canonicalUrl,
          focus_keyword: body.focusKeyword ?? null,
          schema_json: schemaJson,
          status,
          publish_at: body.publishAt ?? null,
          published_at: publishedAt,
          published_day: publishedAt ? publishedAt.slice(0, 10) : null,
          source: "manual_dashboard",
          ai_model: null,
          tokens_used: null,
          generation_error: null,
          updated_at: nowIso,
        })
        .select("*")
        .single();

      if (error) {
        res.status(500).json({ message: "Failed to create blog post", error: error.message });
        return;
      }
      res.status(201).json(mapBlogPost(data as BlogPostRow));
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid blog post payload", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create blog post" });
      }
    }
  });

  app.patch("/api/blog/posts/:id", async (req, res) => {
    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).json({ message: "Supabase admin no está configurado en el servidor" });
        return;
      }

      const body = upsertBlogPostSchema.partial().parse(req.body || {});
      const nowIso = new Date().toISOString();
      const update: Record<string, unknown> = { updated_at: nowIso };

      if (body.title !== undefined) update.title = body.title;
      if (body.excerpt !== undefined) update.excerpt = body.excerpt ?? null;
      if (body.contentMarkdown !== undefined) update.content_markdown = body.contentMarkdown ?? null;
      if (body.contentHtml !== undefined) update.content_html = body.contentHtml;
      if (body.coverImageUrl !== undefined) update.cover_image_url = body.coverImageUrl ?? null;
      if (body.metaTitle !== undefined) update.meta_title = body.metaTitle ?? null;
      if (body.metaDescription !== undefined) update.meta_description = body.metaDescription ?? null;
      if (body.canonicalUrl !== undefined) update.canonical_url = body.canonicalUrl ?? null;
      if (body.focusKeyword !== undefined) update.focus_keyword = body.focusKeyword ?? null;
      if (body.publishAt !== undefined) update.publish_at = body.publishAt ?? null;

      if (body.slug !== undefined || body.title !== undefined) {
        const normalizedSlug = slugify(body.slug || body.title || `${Date.now()}`) || `blog-${Date.now()}`;
        update.slug = await uniqueSlugForUpdate(normalizedSlug, req.params.id);
      }

      if (body.status !== undefined) {
        update.status = body.status;
        const publishedAt = body.status === "published" ? body.publishedAt || nowIso : null;
        update.published_at = publishedAt;
        update.published_day = publishedAt ? publishedAt.slice(0, 10) : null;
      }

      const { data, error } = await supabase
        .from("blog_posts")
        .update(update)
        .eq("id", req.params.id)
        .select("*")
        .single();

      if (error) {
        res.status(500).json({ message: "Failed to update blog post", error: error.message });
        return;
      }
      res.json(mapBlogPost(data as BlogPostRow));
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid blog post payload", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update blog post" });
      }
    }
  });

  app.delete("/api/blog/posts/:id", async (req, res) => {
    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).json({ message: "Supabase admin no está configurado en el servidor" });
        return;
      }
      const { error } = await supabase.from("blog_posts").delete().eq("id", req.params.id);
      if (error) {
        res.status(500).json({ message: "Failed to delete blog post", error: error.message });
        return;
      }
      res.json({ ok: true });
    } catch {
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  app.post("/api/blog/publish-daily", async (req, res) => {
    try {
      if (!checkBlogSecret(req, res)) return;
      const body = publishDailyBodySchema.parse(req.body || {});
      const result = await publishDaily({
        date: body.date,
        force: body.force,
      });
      res.json(result);
    } catch (error: any) {
      const message = error?.message || "Failed to publish daily post";
      await notifyBlogFailure(message);
      res.status(500).json({ message: "Failed to publish daily post", error: message });
    }
  });

  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const supabase = getSupabaseAdmin();
      const baseUrl = getBaseUrl();
      const staticUrls = ["/", "/booking", "/tours", "/fleet", "/contact", "/tracking", "/blog"];

      const links = [...staticUrls.map((path) => ({ loc: `${baseUrl}${path}`, lastmod: new Date().toISOString() }))];

      if (supabase) {
        const { data } = await supabase
          .from("blog_posts")
          .select("slug,updated_at,published_at")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(500);
        for (const row of data || []) {
          links.push({
            loc: `${baseUrl}/blog/${row.slug}`,
            lastmod: row.updated_at || row.published_at || new Date().toISOString(),
          });
        }
      }

      const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${links
  .map((link) => {
    return `  <url><loc>${escapeXml(link.loc)}</loc><lastmod>${escapeXml(link.lastmod)}</lastmod></url>`;
  })
  .join("\n")}
</urlset>`;

      res.setHeader("content-type", "application/xml; charset=utf-8");
      res.status(200).send(body);
    } catch {
      res.status(500).send("Failed to build sitemap");
    }
  });

  app.get("/rss.xml", async (_req, res) => {
    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).send("Supabase admin no está configurado en el servidor");
        return;
      }
      const baseUrl = getBaseUrl();
      const { data, error } = await supabase
        .from("blog_posts")
        .select("title,slug,excerpt,content_html,published_at,updated_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(50);

      if (error) {
        res.status(500).send("Failed to build RSS");
        return;
      }

      const items = (data || [])
        .map((row) => {
          const link = `${baseUrl}/blog/${row.slug}`;
          const title = escapeXml(String(row.title || ""));
          const description = escapeXml(String(row.excerpt || ""));
          const pubDate = new Date(row.published_at || row.updated_at || Date.now()).toUTCString();
          const content = escapeHtml(String(row.content_html || ""));
          return `<item>
  <title>${title}</title>
  <link>${escapeXml(link)}</link>
  <guid>${escapeXml(link)}</guid>
  <pubDate>${escapeXml(pubDate)}</pubDate>
  <description>${description}</description>
  <content:encoded><![CDATA[${content}]]></content:encoded>
</item>`;
        })
        .join("\n");

      const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>DominicanShuttle Blog</title>
  <link>${escapeXml(`${baseUrl}/blog`)}</link>
  <description>Consejos de transporte y turismo en Punta Cana</description>
  <language>es</language>
  ${items}
</channel>
</rss>`;

      res.setHeader("content-type", "application/xml; charset=utf-8");
      res.status(200).send(body);
    } catch {
      res.status(500).send("Failed to build RSS");
    }
  });

  app.get("/robots.txt", (_req, res) => {
    const baseUrl = getBaseUrl();
    const body = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.status(200).send(body);
  });
}
