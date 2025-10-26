import { Github, Globe } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/80 backdrop-blur-md mt-10 fixed bottom-0 left-0 right-0">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com/bytegen-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="text-sm">GitHub</span>
            </a>

            <a
              href="https://x.com/bytegen_dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <FaXTwitter className="h-5 w-5" />
              <span className="text-sm">X/Twitter</span>
            </a>

            <a
              href="https://bytegen.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="h-5 w-5" />
              <span className="text-sm">Website</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
