import { Info } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const version = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev"
const commit = typeof __APP_COMMIT_HASH__ !== "undefined" ? __APP_COMMIT_HASH__ : "local"
const buildTime = typeof __APP_BUILD_TIMESTAMP__ !== "undefined" ? __APP_BUILD_TIMESTAMP__ : ""

export function BuildInfoButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1" aria-label="Open build info">
          <Info weight="duotone" className="h-4 w-4" />
          <span>About</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>About this MarkDeck build</DialogTitle>
          <DialogDescription>Deployment information for support and debugging.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">App version</span>
            <span className="font-mono text-foreground">{version}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Commit</span>
            <span className="font-mono uppercase text-foreground">{commit}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Built</span>
            <span className="text-foreground/80">{buildTime || "local"}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
