import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Project {
  data: {
    title: string;
    slug: string;
    description: string;
    category: string;
    logo?: string;
    heroImage?: string;
  };
}

interface WorkGridProps {
  posts: Project[];
  categoryLabels: Record<string, string>;
  pageTitle: string;
  description: string;
  allCategories: string[];
  currentCategory?: string | null;
}

type ViewMode = "staggered" | "grid" | "list";
export default function WorkGrid({
  posts,
  categoryLabels,
  pageTitle,
  description,
  allCategories,
  currentCategory,
}: WorkGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("staggered");

  useEffect(() => {
    const savedView = localStorage.getItem("workViewPreference") as ViewMode;
    if (savedView) {
      setViewMode(savedView);
    }
  }, []);

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("workViewPreference", mode);
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

  return (
    <>
      {/* Title and View Toggle Buttons */}
      <div className="slide-up flex items-center justify-between">
        <h1 className="mb-4 w-fit text-4xl font-bold md:text-5xl">
          {pageTitle}
        </h1>
      </div>

      <p className="text-foreground-muted mb-6 max-w-prose">{description}</p>

      {/* Category Filters */}
      <ul className="mt-6 mb-6">
        <li className="my-2 mr-4 inline-block">
          <a
            className={`hover:bg-foreground-muted/20 rounded-full px-4 py-2 text-sm transition ${
              !currentCategory
                ? "bg-foreground-muted/30"
                : "bg-foreground-muted/10"
            }`}
            href="/work"
          >
            All
          </a>
        </li>
        {allCategories.map((category) => (
          <li key={category} className="my-2 mr-4 inline-block">
            <a
              className={`hover:bg-foreground-muted/20 rounded-full px-4 py-2 text-sm transition ${
                currentCategory === category
                  ? "bg-foreground-muted/30"
                  : "bg-foreground-muted/10"
              }`}
              href={`/work/${category.toLowerCase()}`}
            >
              {categoryLabels[category] || category}
            </a>
          </li>
        ))}
      </ul>

      <ViewButtons className="-mb-8" />

      {viewMode === "staggered" && (
        <motion.ul
          key="staggered"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="col-span-4 mt-12 grid w-full md:mt-0"
        >
          {posts.map((project, idx) => (
            <motion.li
              key={project.data.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="work-item my-6 md:my-20"
            >
              <a
                className="group flex flex-col"
                href={`/work/${project.data.slug}`}
              >
                <div
                  className={`border-lines relative w-full overflow-hidden border md:w-3/4 ${
                    idx % 2 === 0 ? "float-left mr-4" : "ml-auto"
                  }`}
                >
                  {project.data.logo ? (
                    <div className="grid aspect-video place-items-center bg-white p-8">
                      <img
                        src={project.data.logo}
                        alt={`${project.data.title} logo`}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        style={
                          {
                            viewTransitionName: `work-image-${project.data.slug}`,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  ) : project.data.heroImage ? (
                    <div className="grid aspect-video place-items-center overflow-hidden">
                      <img
                        src={project.data.heroImage}
                        alt={`${project.data.title} hero image`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        style={
                          {
                            viewTransitionName: `work-image-${project.data.slug}`,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  ) : (
                    <div className="from-primary/20 to-primary/5 grid aspect-video place-items-center bg-gradient-to-br">
                      <span className="text-primary/30 text-4xl font-bold">
                        {project.data.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className={`mt-4 flex w-full flex-col md:w-3/4 ${
                    idx % 2 === 0 ? "" : "ml-auto"
                  }`}
                >
                  <span className="text-foreground-muted/70 mb-2 text-xs">
                    {categoryLabels[project.data.category] ||
                      project.data.category}
                  </span>
                  <h3 className="group-hover:text-primary text-2xl font-semibold transition-colors">
                    {project.data.title}
                  </h3>
                  <p className="text-foreground-muted mt-2">
                    {project.data.description}
                  </p>
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
          className="mt-18 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {posts.map((project, idx) => (
            <motion.a
              key={project.data.slug}
              href={`/work/${project.data.slug}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="border-lines hover:border-primary group block border bg-black/1 p-6 backdrop-blur-xs transition-colors"
            >
              <div className="flex h-full flex-col">
                {project.data.logo ? (
                  <div className="mb-4 grid size-16 place-items-center rounded bg-white">
                    <img
                      src={project.data.logo}
                      alt={`${project.data.title} logo`}
                      className="size-12 object-contain"
                      style={
                        {
                          viewTransitionName: `work-image-${project.data.slug}`,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                ) : project.data.heroImage ? (
                  <div className="mb-4 overflow-hidden rounded">
                    <img
                      src={project.data.heroImage}
                      alt={`${project.data.title} hero image`}
                      className="aspect-video w-full object-cover"
                      style={
                        {
                          viewTransitionName: `work-image-${project.data.slug}`,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                ) : (
                  <div className="from-primary/20 to-primary/5 mb-4 grid size-16 place-items-center rounded bg-gradient-to-br">
                    <span className="text-primary/30 text-2xl font-bold">
                      {project.data.title.charAt(0)}
                    </span>
                  </div>
                )}
                <h3 className="group-hover:text-primary mb-2 text-lg font-semibold transition-colors">
                  {project.data.title}
                </h3>
                <span className="text-foreground-muted/70 mb-3 text-xs">
                  {categoryLabels[project.data.category] ||
                    project.data.category}
                </span>
                <p className="text-foreground-muted mt-auto text-sm">
                  {project.data.description}
                </p>
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
          className="mt-16"
        >
          {posts.map((project, idx) => (
            <motion.li
              key={project.data.slug}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="border-lines border-b py-6 transition-colors"
            >
              <a
                href={`/work/${project.data.slug}`}
                className="group flex items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="group-hover:text-primary text-lg! font-semibold transition-colors md:text-3xl!">
                      {project.data.title}
                    </h3>

                    <span className="bg-foreground-muted/10 text-foreground-muted rounded-full px-2 py-1 text-xs">
                      {categoryLabels[project.data.category] ||
                        project.data.category}
                    </span>
                  </div>
                  <p className="text-foreground-muted text-sm">
                    {project.data.description}
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-foreground-muted group-hover:text-primary size-5 transition-all group-hover:translate-x-1"
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
