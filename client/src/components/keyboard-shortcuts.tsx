import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Keyboard, X } from "lucide-react";

interface KeyboardShortcutsProps {
  onCenterRover?: () => void;
  onToggleLayers?: () => void;
  onToggleFullscreen?: () => void;
  onRefreshData?: () => void;
  onToggleTimeline?: () => void;
  className?: string;
}

const shortcuts = [
  { key: 'Space', description: 'Center rover on map' },
  { key: 'L', description: 'Toggle map layers' },
  { key: 'F', description: 'Toggle fullscreen mode' },
  { key: 'R', description: 'Refresh rover data' },
  { key: 'T', description: 'Toggle timeline playback' },
  { key: '1-4', description: 'Switch camera feeds' },
  { key: 'Arrow Keys', description: 'Pan map view' },
  { key: '+/-', description: 'Zoom in/out' },
  { key: 'Esc', description: 'Close dialogs' },
  { key: '?', description: 'Show this help' }
];

export function KeyboardShortcuts({ 
  onCenterRover,
  onToggleLayers,
  onToggleFullscreen,
  onRefreshData,
  onToggleTimeline,
  className 
}: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ':
          event.preventDefault();
          onCenterRover?.();
          break;
        case 'l':
          event.preventDefault();
          onToggleLayers?.();
          break;
        case 'f':
          event.preventDefault();
          onToggleFullscreen?.();
          break;
        case 'r':
          event.preventDefault();
          onRefreshData?.();
          break;
        case 't':
          event.preventDefault();
          onToggleTimeline?.();
          break;
        case '?':
          event.preventDefault();
          setIsOpen(true);
          break;
        case 'escape':
          setIsOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCenterRover, onToggleLayers, onToggleFullscreen, onRefreshData, onToggleTimeline]);

  return (
    <>
      {/* Floating help button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`fixed bottom-4 right-4 bg-black/90 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono z-40 ${className}`}
            data-testid="button-keyboard-help"
          >
            <Keyboard className="w-4 h-4 mr-1" />
            ?
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900/95 border-cyan-500/30 backdrop-blur-sm max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 font-mono flex items-center justify-between">
              <span>KEYBOARD SHORTCUTS</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">{shortcut.description}</span>
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 font-mono text-xs">
                  {shortcut.key}
                </Badge>
              </div>
            ))}
            
            <div className="border-t border-gray-700 pt-3 mt-4">
              <p className="text-gray-400 text-xs text-center">
                Press <kbd className="bg-gray-800 px-1 py-0.5 rounded text-cyan-400">?</kbd> anytime to toggle this help
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status indicator when shortcuts are active */}
      <div className="fixed top-4 right-4 z-30 opacity-20 hover:opacity-100 transition-opacity">
        <Card className="bg-black/90 border-cyan-500/30 backdrop-blur-sm">
          <CardContent className="p-2">
            <div className="text-cyan-400 font-mono text-xs flex items-center gap-1">
              <Keyboard className="w-3 h-3" />
              Shortcuts Active
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}