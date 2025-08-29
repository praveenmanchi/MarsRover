import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TimelineEvent {
  sol: number;
  date: string;
  event: string;
  type: 'milestone' | 'science' | 'discovery';
  coordinates: [number, number];
  description: string;
}

interface AnimatedTimelineProps {
  rover: string;
  onEventSelect?: (event: TimelineEvent) => void;
  className?: string;
}

export function AnimatedTimeline({ rover, onEventSelect, className }: AnimatedTimelineProps) {
  const [currentSol, setCurrentSol] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);

  const { data: timelineData } = useQuery<{ events: TimelineEvent[] }>({
    queryKey: ["/api/timeline", rover],
  });

  const events = timelineData?.events || [];
  const maxSol = events.length > 0 ? Math.max(...events.map(e => e.sol)) : 4500;

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying || events.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSol(prev => {
        const next = prev + (10 * playbackSpeed);
        return next > maxSol ? 0 : next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, maxSol, events.length]);

  // Find current active events
  const activeEvents = events.filter(event => event.sol <= currentSol);
  const currentEvent = activeEvents[activeEvents.length - 1];

  const handleEventClick = (event: TimelineEvent, index: number) => {
    setSelectedEventIndex(index);
    setCurrentSol(event.sol);
    onEventSelect?.(event);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'milestone': return 'border-yellow-500/50 text-yellow-400';
      case 'science': return 'border-blue-500/50 text-blue-400';
      case 'discovery': return 'border-green-500/50 text-green-400';
      default: return 'border-gray-500/50 text-gray-400';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={`bg-black/90 border-cyan-500/30 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 font-mono text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          MISSION TIMELINE - SOL {currentSol}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            onClick={() => setCurrentSol(0)}
            data-testid="button-timeline-start"
          >
            <SkipBack className="w-3 h-3" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            onClick={() => setIsPlaying(!isPlaying)}
            data-testid="button-timeline-play"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            onClick={() => setCurrentSol(maxSol)}
            data-testid="button-timeline-end"
          >
            <SkipForward className="w-3 h-3" />
          </Button>

          <div className="flex items-center gap-2 ml-4">
            <span className="text-gray-400 text-xs">SPEED</span>
            <Slider
              value={[playbackSpeed]}
              onValueChange={(value) => setPlaybackSpeed(value[0])}
              min={0.1}
              max={5}
              step={0.1}
              className="w-16"
              data-testid="slider-playback-speed"
            />
            <span className="text-cyan-400 text-xs font-mono w-8">{playbackSpeed.toFixed(1)}x</span>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-2">
          <Slider
            value={[currentSol]}
            onValueChange={(value) => setCurrentSol(value[0])}
            max={maxSol}
            step={1}
            className="w-full"
            data-testid="slider-timeline-position"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>SOL 0</span>
            <span>{formatDate(new Date().toISOString())}</span>
            <span>SOL {maxSol}</span>
          </div>
        </div>

        {/* Current Event Display */}
        {currentEvent && (
          <div className="bg-gray-900/50 rounded border border-cyan-500/20 p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-white font-mono text-sm font-semibold">
                  SOL {currentEvent.sol} - {formatDate(currentEvent.date)}
                </div>
                <Badge variant="outline" className={`mt-1 font-mono text-xs ${getEventTypeColor(currentEvent.type)}`}>
                  {currentEvent.type.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center text-gray-400 text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {currentEvent.coordinates[0].toFixed(4)}, {currentEvent.coordinates[1].toFixed(4)}
              </div>
            </div>
            <div className="text-cyan-400 font-semibold text-sm mb-1">
              {currentEvent.event}
            </div>
            <div className="text-gray-300 text-xs">
              {currentEvent.description}
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="max-h-40 overflow-y-auto space-y-1">
          {events.map((event, index) => (
            <div
              key={index}
              className={`cursor-pointer p-2 rounded border transition-colors ${
                event.sol <= currentSol
                  ? 'border-cyan-500/30 bg-cyan-500/5'
                  : 'border-gray-700/30 bg-gray-900/20'
              } ${selectedEventIndex === index ? 'ring-1 ring-cyan-500/50' : ''}`}
              onClick={() => handleEventClick(event, index)}
              data-testid={`event-item-${index}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">SOL {event.sol}</span>
                    <Badge variant="outline" className={`font-mono text-xs ${getEventTypeColor(event.type)}`}>
                      {event.type.charAt(0).toUpperCase()}
                    </Badge>
                  </div>
                  <div className={`text-sm font-medium ${
                    event.sol <= currentSol ? 'text-white' : 'text-gray-500'
                  }`}>
                    {event.event}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {formatDate(event.date)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}