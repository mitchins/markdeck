const version = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev"
const commit = typeof __APP_COMMIT_HASH__ !== "undefined" ? __APP_COMMIT_HASH__ : "local"
const buildTime = typeof __APP_BUILD_TIMESTAMP__ !== "undefined" ? __APP_BUILD_TIMESTAMP__ : ""

export function BuildInfoBadge() {
  const tooltip = `MarkDeck Build\nVersion: ${version}\nCommit: ${commit}\nBuilt: ${buildTime}`

  return (
    <div
      className="fixed bottom-3 left-3 z-40 flex items-center gap-1.5 rounded-full border border-border/50 bg-card/70 px-2.5 py-1 text-[11px] text-muted-foreground shadow-md backdrop-blur-sm opacity-70 transition-opacity hover:opacity-100"
      title={tooltip}
      aria-label={`MarkDeck build info version ${version} commit ${commit}`}
    >
      <span className="font-semibold text-foreground/80">MarkDeck</span>
      <span className="text-foreground/70">v{version}</span>
      <span className="text-muted-foreground">·</span>
      <span className="font-mono uppercase tracking-wide">{commit}</span>
    </div>
  )
}
