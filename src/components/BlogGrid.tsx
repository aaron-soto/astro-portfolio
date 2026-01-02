import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface BlogPost {
  data: {
    title: string;
    slug: string;
    heroImage: string;
    heroAlt?: string;
    pubDate: string;
  };
}

interface BlogGridProps {
  posts: BlogPost[];
  allTags: string[];
  currentTag?: string | null;
  pageTitle: string;
  description: string;
}

type ViewMode = "staggered" | "grid" | "list";

export default function BlogGrid({
  posts,
  allTags,
  currentTag,
  pageTitle,
  description,
}: BlogGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("staggered");

  useEffect(() => {
    const savedView = localStorage.getItem("blogViewPreference") as ViewMode;
    if (savedView) {
      setViewMode(savedView);
    }
  }, []);

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("blogViewPreference", mode);
  };

  const ViewButtons = ({ className }: { className?: string }) => (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={() => handleViewChange("staggered")}
        className={`border px-4 py-2 transition-colors ${
          viewMode === "staggered"
            ? "bg-primary/20 border-primary"
            : "border-lines hover:border-primary"
        }`}
        aria-label="Staggered view"
        title="Staggered view"
      >
        <img
          src={
            viewMode === "staggered"
              ? "/icons/staggered-active.svg"
              : "/icons/staggered.svg"
          }
          alt="Staggered view"
          className="size-5"
        />
      </button>
      <button
        onClick={() => handleViewChange("grid")}
        className={`border px-4 py-2 transition-colors ${
          viewMode === "grid"
            ? "bg-primary/20 border-primary"
            : "border-lines hover:border-primary"
        }`}
        aria-label="Grid view"
        title="Grid view"
      >
        <img
          src={
            viewMode === "grid" ? "/icons/grid-active.svg" : "/icons/grid.svg"
          }
          alt="Grid view"
          className="size-5"
        />
      </button>
      <button
        onClick={() => handleViewChange("list")}
        className={`border px-4 py-2 transition-colors ${
          viewMode === "list"
            ? "bg-primary/20 border-primary"
            : "border-lines hover:border-primary"
        }`}
        aria-label="List view"
        title="List view"
      >
        <img src="/icons/list.svg" alt="List view" className="size-5" />
      </button>
    </div>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      {/* Title and View Toggle Buttons */}
      <div className="slide-up mb-8 flex items-center justify-between">
        <h1 className="w-fit text-4xl font-bold md:text-5xl">{pageTitle}</h1>
      </div>

      <p className="text-foreground-muted mb-4 max-w-prose">{description}</p>

      {/* Tag Filters */}
      <ul className="mt-4 mb-8">
        <li className="my-2 mr-4 inline-block">
          <a
            className={`hover:bg-foreground-muted/20 rounded-full px-4 py-2 text-sm transition ${
              !currentTag ? "bg-foreground-muted/30" : "bg-foreground-muted/10"
            }`}
            href="/blog"
          >
            All
          </a>
        </li>
        {allTags.map((tag) => {
          // Create URL-safe slug by replacing slashes and special characters
          const tagSlug = tag
            .toLowerCase()
            .replace(/\//g, "-")
            .replace(/\s+/g, "-");
          return (
            <li key={tag} className="my-2 mr-4 inline-block">
              <a
                className={`hover:bg-foreground-muted/20 rounded-full px-4 py-2 text-sm transition ${
                  currentTag === tag
                    ? "bg-foreground-muted/30"
                    : "bg-foreground-muted/10"
                }`}
                href={`/blog/${tagSlug}`}
              >
                #{tag}
              </a>
            </li>
          );
        })}
      </ul>

      <ViewButtons className="mb-8" />

      {/* Staggered View */}
      {viewMode === "staggered" && (
        <motion.ul
          key="staggered"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="col-span-4 grid w-full"
        >
          {posts.map((post, idx) => (
            <motion.li
              key={post.data.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="blog-post my-6 md:my-20"
            >
              <a
                className="group flex flex-col"
                href={`/blog/${post.data.slug}`}
              >
                <div
                  className={`relative w-full overflow-hidden md:w-3/4 ${
                    idx % 2 === 0 ? "float-left mr-4" : "ml-auto"
                  }`}
                >
                  <img
                    src={post.data.heroImage}
                    alt={post.data.heroAlt || "Blog Post Hero Image"}
                    className="w-full transition-transform duration-300 group-hover:scale-105"
                    style={
                      {
                        viewTransitionName: `blog-image-${post.data.slug}`,
                      } as React.CSSProperties
                    }
                  />
                </div>
                <div
                  className={`mt-4 flex w-full flex-col md:w-3/4 ${
                    idx % 2 === 0 ? "" : "ml-auto"
                  }`}
                >
                  <span className="text-foreground-muted my-1 text-sm">
                    {formatDate(post.data.pubDate)}
                  </span>
                  <h3 className="group-hover:text-primary text-2xl! font-semibold transition-colors">
                    {post.data.title}
                  </h3>
                </div>
              </a>
            </motion.li>
          ))}
        </motion.ul>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <motion.div
          key="grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {posts.map((post, idx) => (
            <motion.a
              key={post.data.slug}
              href={`/blog/${post.data.slug}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="group block overflow-hidden"
            >
              <div className="flex h-full flex-col">
                <div className="mb-4 overflow-hidden">
                  <img
                    src={post.data.heroImage}
                    alt={post.data.heroAlt || "Blog Post Hero Image"}
                    className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    style={
                      {
                        viewTransitionName: `blog-image-${post.data.slug}`,
                      } as React.CSSProperties
                    }
                  />
                </div>
                <span className="text-foreground-muted mb-2 text-xs">
                  {formatDate(post.data.pubDate)}
                </span>
                <h3 className="group-hover:text-primary text-lg! font-semibold transition-colors md:text-2xl!">
                  {post.data.title}
                </h3>
              </div>
            </motion.a>
          ))}
        </motion.div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <motion.ul
          key="list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {posts.map((post, idx) => (
            <motion.li
              key={post.data.slug}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="border-lines border-b py-3 transition-colors md:py-6"
            >
              <a
                href={`/blog/${post.data.slug}`}
                className="group flex items-center justify-between gap-6"
              >
                <div className="flex flex-1 items-center gap-6">
                  <div className="hidden w-32 flex-shrink-0 overflow-hidden sm:block">
                    <img
                      src={post.data.heroImage}
                      alt={post.data.heroAlt || "Blog Post Hero Image"}
                      className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      style={
                        {
                          viewTransitionName: `blog-image-${post.data.slug}`,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="group-hover:text-primary text-lg! font-semibold transition-colors md:mb-1 md:text-xl">
                      {post.data.title}
                    </h3>
                    <span className="text-foreground-muted text-sm">
                      {formatDate(post.data.pubDate)}
                    </span>
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-foreground-muted group-hover:text-primary size-5 flex-shrink-0 transition-all group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </>
  );
}
