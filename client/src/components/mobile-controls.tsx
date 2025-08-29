import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, Camera, Activity, Map, Clock, Settings } from "lucide-react";

interface MobileControlsProps {
  children: {
    cameras?: React.ReactNode;
    weather?: React.ReactNode;
    geology?: React.ReactNode;
    timeline?: React.ReactNode;
    terrain3d?: React.ReactNode;
    export?: React.ReactNode;
  };
  className?: string;
}

export function MobileControls({ children, className }: MobileControlsProps) {
  const [activeTab, setActiveTab] = useState("cameras");

  return (
    <div className={`md:hidden ${className}`}>
      {/* Mobile menu button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed top-4 right-4 z-50 bg-black/90 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            data-testid="button-mobile-menu"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="right" 
          className="w-full bg-black/95 border-cyan-500/30 backdrop-blur-sm p-0 overflow-hidden"
        >
          <SheetHeader className="p-4 border-b border-cyan-500/30">
            <SheetTitle className="text-cyan-400 font-mono">MISSION CONTROL</SheetTitle>
          </SheetHeader>
          
          <div className="h-full overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-5 bg-gray-900/50 mx-4 mt-4">
                <TabsTrigger 
                  value="cameras" 
                  className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
                  data-testid="tab-cameras"
                >
                  <Camera className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger 
                  value="weather" 
                  className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
                  data-testid="tab-weather"
                >
                  <Activity className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger 
                  value="geology" 
                  className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
                  data-testid="tab-geology"
                >
                  <Map className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger 
                  value="timeline" 
                  className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
                  data-testid="tab-timeline"
                >
                  <Clock className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger 
                  value="tools" 
                  className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
                  data-testid="tab-tools"
                >
                  <Settings className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <TabsContent value="cameras" className="mt-0 space-y-4">
                  {children.cameras}
                </TabsContent>
                
                <TabsContent value="weather" className="mt-0 space-y-4">
                  {children.weather}
                </TabsContent>
                
                <TabsContent value="geology" className="mt-0 space-y-4">
                  {children.geology}
                </TabsContent>
                
                <TabsContent value="timeline" className="mt-0 space-y-4">
                  {children.timeline}
                </TabsContent>
                
                <TabsContent value="tools" className="mt-0 space-y-4">
                  {children.terrain3d}
                  {children.export}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Mobile bottom navigation */}
      <Card className="fixed bottom-4 left-4 right-4 bg-black/90 border-cyan-500/30 backdrop-blur-sm z-40">
        <CardContent className="p-2">
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono text-xs"
              data-testid="button-mobile-cameras"
            >
              <Camera className="w-3 h-3 mr-1" />
              CAM
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono text-xs"
              data-testid="button-mobile-data"
            >
              <Activity className="w-3 h-3 mr-1" />
              DATA
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono text-xs"
              data-testid="button-mobile-map"
            >
              <Map className="w-3 h-3 mr-1" />
              MAP
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono text-xs"
              data-testid="button-mobile-3d"
            >
              <Settings className="w-3 h-3 mr-1" />
              3D
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}