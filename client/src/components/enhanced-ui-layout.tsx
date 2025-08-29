import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { 
  PanelLeftOpen, 
  PanelRightOpen, 
  Minimize2, 
  Maximize2, 
  HelpCircle, 
  Bell, 
  Download,
  Map,
  Activity,
  Camera,
  Clock
} from "lucide-react";

interface EnhancedUILayoutProps {
  leftPanels: { 
    component: React.ReactNode; 
    title: string; 
    icon: React.ReactNode;
    tooltip: string;
  }[];
  rightPanels: { 
    component: React.ReactNode; 
    title: string; 
    icon: React.ReactNode;
    tooltip: string;
  }[];
  children: React.ReactNode;
  className?: string;
}

export function EnhancedUILayout({ leftPanels, rightPanels, children, className }: EnhancedUILayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState("0");
  const [activeRightTab, setActiveRightTab] = useState("0");
  const [showTooltips, setShowTooltips] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Show tooltips for first-time users
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('mars-rover-tour-seen');
    if (!hasSeenTour) {
      setShowTooltips(true);
      const timer = setTimeout(() => {
        setShowTooltips(false);
        localStorage.setItem('mars-rover-tour-seen', 'true');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Real-time rover tracking notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const roverUpdates = [
        "Curiosity: New geological samples collected",
        "Curiosity: Temperature sensor reading: -15°C",
        "Curiosity: Camera system online - new images available",
        "Curiosity: Navigation system active - moving to waypoint"
      ];
      
      const randomUpdate = roverUpdates[Math.floor(Math.random() * roverUpdates.length)];
      setNotifications(prev => [randomUpdate, ...prev].slice(0, 5));
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const sidebarVariants = {
    expanded: { width: 320, opacity: 1 },
    collapsed: { width: 48, opacity: 0.8 }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const NotificationBell = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative text-cyan-400 hover:bg-cyan-500/10"
            data-testid="button-notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-64">
            <h4 className="font-semibold mb-2">Recent Updates</h4>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400">No new notifications</p>
            ) : (
              notifications.slice(0, 3).map((notification, i) => (
                <p key={i} className="text-sm mb-1 last:mb-0">{notification}</p>
              ))
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <TooltipProvider>
      <div className={`relative w-full h-full ${className}`}>
        {/* Main content area */}
        <motion.div 
          className="absolute inset-0"
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          {children}
        </motion.div>

        {/* Floating notification panel */}
        <AnimatePresence>
          {notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50"
            >
              <Card className="bg-black/95 border-cyan-500/30 backdrop-blur-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-cyan-400 font-mono">
                      {notifications[0]}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Left Sidebar */}
        <motion.div
          className="absolute top-4 left-4 bottom-20 z-30"
          variants={sidebarVariants}
          animate={leftCollapsed ? "collapsed" : "expanded"}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Card className="h-full bg-black/95 border-cyan-500/30 backdrop-blur-sm overflow-hidden shadow-2xl">
            {leftCollapsed ? (
              <div className="p-2 space-y-2">
                <TooltipProvider>
                  <Tooltip open={showTooltips}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLeftCollapsed(false)}
                        className="w-full text-cyan-400 hover:bg-cyan-500/10"
                        data-testid="button-expand-left"
                      >
                        <PanelLeftOpen className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      Expand scientific data panels
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {leftPanels.map((panel, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setLeftCollapsed(false);
                            setActiveLeftTab(index.toString());
                          }}
                          className="w-full text-cyan-400 hover:bg-cyan-500/10"
                        >
                          {panel.icon}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {panel.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="h-full flex flex-col"
              >
                <div className="flex items-center justify-between p-3 border-b border-cyan-500/30">
                  <h3 className="text-cyan-400 font-mono text-sm font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    SCIENTIFIC DATA
                  </h3>
                  <div className="flex items-center gap-1">
                    <NotificationBell />
                    <TooltipProvider>
                      <Tooltip open={showTooltips}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLeftCollapsed(true)}
                            className="text-cyan-400 hover:bg-cyan-500/10 p-1"
                            data-testid="button-collapse-left"
                          >
                            <Minimize2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Collapse panel
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                <Tabs value={activeLeftTab} onValueChange={setActiveLeftTab} className="h-full flex flex-col">
                  <TabsList className="grid bg-gray-900/50 m-2" style={{ gridTemplateColumns: `repeat(${leftPanels.length}, 1fr)` }}>
                    {leftPanels.map((panel, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <TabsTrigger 
                              value={index.toString()} 
                              className="data-[state=active]:bg-cyan-600 text-xs flex items-center gap-1"
                              data-testid={`tab-left-${index}`}
                            >
                              {panel.icon}
                              <span className="hidden md:inline">{panel.title}</span>
                            </TabsTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            {panel.tooltip}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </TabsList>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    <AnimatePresence>
                      {leftPanels.map((panel, index) => (
                        <TabsContent key={index} value={index.toString()} className="mt-0">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                          >
                            {panel.component}
                          </motion.div>
                        </TabsContent>
                      ))}
                    </AnimatePresence>
                  </div>
                </Tabs>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div
          className="absolute top-4 right-4 bottom-20 z-30"
          variants={sidebarVariants}
          animate={rightCollapsed ? "collapsed" : "expanded"}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Card className="h-full bg-black/95 border-cyan-500/30 backdrop-blur-sm overflow-hidden shadow-2xl">
            {rightCollapsed ? (
              <div className="p-2 space-y-2">
                <TooltipProvider>
                  <Tooltip open={showTooltips}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRightCollapsed(false)}
                        className="w-full text-cyan-400 hover:bg-cyan-500/10"
                        data-testid="button-expand-right"
                      >
                        <PanelRightOpen className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      Expand mission control panels
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {rightPanels.map((panel, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRightCollapsed(false);
                            setActiveRightTab(index.toString());
                          }}
                          className="w-full text-cyan-400 hover:bg-cyan-500/10"
                        >
                          {panel.icon}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        {panel.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="h-full flex flex-col"
              >
                <div className="flex items-center justify-between p-3 border-b border-cyan-500/30">
                  <h3 className="text-cyan-400 font-mono text-sm font-semibold flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    MISSION CONTROL
                  </h3>
                  <TooltipProvider>
                    <Tooltip open={showTooltips}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRightCollapsed(true)}
                          className="text-cyan-400 hover:bg-cyan-500/10 p-1"
                          data-testid="button-collapse-right"
                        >
                          <Minimize2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Collapse panel
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="h-full flex flex-col">
                  <TabsList className="grid bg-gray-900/50 m-2" style={{ gridTemplateColumns: `repeat(${rightPanels.length}, 1fr)` }}>
                    {rightPanels.map((panel, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <TabsTrigger 
                              value={index.toString()} 
                              className="data-[state=active]:bg-cyan-600 text-xs flex items-center gap-1"
                              data-testid={`tab-right-${index}`}
                            >
                              {panel.icon}
                              <span className="hidden md:inline">{panel.title}</span>
                            </TabsTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            {panel.tooltip}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </TabsList>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    <AnimatePresence>
                      {rightPanels.map((panel, index) => (
                        <TabsContent key={index} value={index.toString()} className="mt-0">
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                          >
                            {panel.component}
                          </motion.div>
                        </TabsContent>
                      ))}
                    </AnimatePresence>
                  </div>
                </Tabs>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Help button for first-time users */}
        <TooltipProvider>
          <Tooltip open={showTooltips}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTooltips(!showTooltips)}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 text-cyan-400 hover:bg-cyan-500/10"
                data-testid="button-help"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Toggle interface hints
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </TooltipProvider>
  );
}