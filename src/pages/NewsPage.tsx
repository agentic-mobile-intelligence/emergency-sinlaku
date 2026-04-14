import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ExternalLink, Clock, Star, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

type NewsArticle = {
  id: string
  title: string
  summary: string | null
  body: string | null
  source_url: string
  image_url: string | null
  category: string
  featured: boolean
  author_name: string | null
  published_at: string | null
  created_at: string
}

const CATEGORY_STYLES: Record<string, { label: string; className: string }> = {
  federal: { label: "Federal", className: "bg-blue-100 text-blue-800 border-blue-200" },
  local: { label: "Local", className: "bg-green-100 text-green-800 border-green-200" },
  community: { label: "Community", className: "bg-purple-100 text-purple-800 border-purple-200" },
  weather: { label: "Weather", className: "bg-orange-100 text-orange-800 border-orange-200" },
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    supabase
      .from("news_articles")
      .select("*")
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setArticles((data as NewsArticle[]) ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const featured = articles.find((a) => a.featured)
  const filtered = filter === "all"
    ? articles.filter((a) => !a.featured)
    : articles.filter((a) => a.category === filter && !a.featured)

  const categories = [...new Set(articles.map((a) => a.category))]

  return (
    <div className="min-h-[calc(100vh-88px)] bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-[#1E3A5F] hover:opacity-70 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">News & Updates</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : articles.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">No news articles published yet.</p>
        ) : (
          <>
            {/* Featured Article */}
            {featured && (
              <Card className="border-2 border-[#1E3A5F]/30 bg-[#1E3A5F]/5">
                <CardContent className="pt-5 pb-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#1E3A5F] fill-[#1E3A5F]" />
                    <span className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wide">Featured</span>
                    <CategoryBadge category={featured.category} />
                  </div>
                  <h2 className="text-lg font-bold text-[#1E3A5F]">{featured.title}</h2>
                  {featured.summary && (
                    <p className="text-sm text-gray-600">{featured.summary}</p>
                  )}
                  {featured.body && (
                    <p className="text-sm text-gray-700 whitespace-pre-line">{featured.body}</p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {featured.author_name && <span>by {featured.author_name}</span>}
                      {featured.published_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(featured.published_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <a
                      href={featured.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A5F] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Source
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${filter === "all" ? "bg-[#1E3A5F] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                All
              </button>
              {categories.map((cat) => {
                const style = CATEGORY_STYLES[cat]
                return (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${filter === cat ? "bg-[#1E3A5F] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {style?.label ?? cat}
                  </button>
                )
              })}
            </div>

            {/* Article list */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No articles in this category.</p>
              ) : (
                filtered.map((article) => (
                  <Card key={article.id} className="hover:shadow-sm transition">
                    <CardContent className="pt-4 pb-3 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CategoryBadge category={article.category} />
                          </div>
                          <h3 className="font-semibold text-sm">{article.title}</h3>
                          {article.summary && (
                            <p className="text-xs text-gray-600">{article.summary}</p>
                          )}
                        </div>
                        <a
                          href={article.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-[#1E3A5F] hover:opacity-70"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {article.author_name && <span>by {article.author_name}</span>}
                        {article.published_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(article.published_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_STYLES[category] ?? { label: category, className: "bg-gray-100 text-gray-700 border-gray-200" }
  return <Badge variant="outline" className={`text-xs ${style.className}`}>{style.label}</Badge>
}
