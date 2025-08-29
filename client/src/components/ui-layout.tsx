import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PanelLeftOpen, PanelRightOpen, Minimize2, Maximize2 } from "lucide-react";

interface UILayoutProps {
  leftPanels: React.ReactNode[];
  rightPanels: React.ReactNode[];
  children: React.ReactNode;
  className?: string;
}

export function UILayout({ leftPanels, rightPanels, children, className }: UILayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState("0");
  const [activeRightTab, setActiveRightTab] = useState("0");

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Main content area */}
      <div className="absolute inset-0">
        {children}
      </div>

      {/* Left Sidebar */}
      <div className={`absolute top-4 left-4 bottom-20 z-30 transition-all duration-300 ${
        leftCollapsed ? 'w-12' : 'w-80'
      }`}>
        <Card className="h-full bg-black/95 border-cyan-500/30 backdrop-blur-sm overflow-hidden">
          {leftCollapsed ? (
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeftCollapsed(false)}
                className="w-full text-cyan-400 hover:bg-cyan-500/10"
                data-testid="button-expand-left"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 border-b border-cyan-500/30">
                <h3 className="text-cyan-400 font-mono text-sm font-semibold">SCIENTIFIC DATA</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLeftCollapsed(true)}
                  className="text-cyan-400 hover:bg-cyan-500/10 p-1"
                  data-testid="button-collapse-left"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
              </div>
              
              <Tabs value={activeLeftTab} onValueChange={setActiveLeftTab} className="h-full flex flex-col">
                <TabsList className="grid grid-cols-3 bg-gray-900/50 m-2">
                  <TabsTrigger value="0" className="data-[state=active]:bg-cyan-600 text-xs">ENV</TabsTrigger>
                  <TabsTrigger value="1" className="data-[state=active]:bg-cyan-600 text-xs">WEATHER</TabsTrigger>
                  <TabsTrigger value="2" className="data-[state=active]:bg-cyan-600 text-xs">3D</TabsTrigger>
                </TabsList>
                
                <div className="flex-1 overflow-y-auto p-2">
                  {leftPanels.map((panel, index) => (
                    <TabsContent key={index} value={index.toString()} className="mt-0">
                      {panel}
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </>
          )}
        </Card>
      </div>

      {/* Right Sidebar */}
      <div className={`absolute top-4 right-4 bottom-20 z-30 transition-all duration-300 ${
        rightCollapsed ? 'w-12' : 'w-80'
      }`}>
        <Card className="h-full bg-black/95 border-cyan-500/30 backdrop-blur-sm overflow-hidden">
          {rightCollapsed ? (
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRightCollapsed(false)}
                className="w-full text-cyan-400 hover:bg-cyan-500/10"
                data-testid="button-expand-right"
              >
                <PanelRightOpen className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 border-b border-cyan-500/30">
                <h3 className="text-cyan-400 font-mono text-sm font-semibold">MISSION CONTROL</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRightCollapsed(true)}
                  className="text-cyan-400 hover:bg-cyan-500/10 p-1"
                  data-testid="button-collapse-right"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
              </div>
              
              <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="h-full flex flex-col">
                <TabsList className="grid grid-cols-3 bg-gray-900/50 m-2">
                  <TabsTrigger value="0" className="data-[state=active]:bg-cyan-600 text-xs">GEO</TabsTrigger>
                  <TabsTrigger value="1" className="data-[state=active]:bg-cyan-600 text-xs">TIME</TabsTrigger>
                  <TabsTrigger value="2" className="data-[state=active]:bg-cyan-600 text-xs">TOOLS</TabsTrigger>
                </TabsList>
                
                <div className="flex-1 overflow-y-auto p-2">
                  {rightPanels.map((panel, index) => (
                    <TabsContent key={index} value={index.toString()} className="mt-0">
                      {panel}
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}