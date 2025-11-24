const version = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev"
const commit = typeof __APP_COMMIT_HASH__ !== "undefined" ? __APP_COMMIT_HASH__ : "local"
const buildTime = typeof __APP_BUILD_TIMESTAMP__ !== "undefined" ? __APP_BUILD_TIMESTAMP__ : ""

export function BuildInfoBadge() {
  const tooltip = `Version: ${version}\nCommit: ${commit}\nBuilt: ${buildTime}`

  return (
    <div
      className="fixed bottom-4 right-4 z-40 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-xs text-muted-foreground shadow-lg backdrop-blur"
      title={tooltip}
      aria-label={`MarkDeck build info ${version} ${commit}`}
    >
      <span className="font-medium text-foreground/80">v{version}</span>
      <span className="mx-1 text-muted-foreground">·</span>
      <span className="font-mono uppercase tracking-wide">{commit}</span>
    </div>
  )
}
