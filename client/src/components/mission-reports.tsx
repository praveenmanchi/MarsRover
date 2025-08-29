import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, Image, Calendar, MapPin } from 'lucide-react';
import type { Rover, RoverPhoto } from '@/types/rover';

interface MissionReportsProps {
  rover: Rover;
  photos: RoverPhoto[];
  className?: string;
}

export function MissionReports({ rover, photos, className }: MissionReportsProps) {
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'images'>('summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateReport = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate report generation progress
      const steps = [
        { step: 'Collecting rover data...', progress: 20 },
        { step: 'Processing images...', progress: 40 },
        { step: 'Generating analysis...', progress: 60 },
        { step: 'Compiling report...', progress: 80 },
        { step: 'Finalizing download...', progress: 100 }
      ];

      for (const { step, progress: stepProgress } of steps) {
        setProgress(stepProgress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Generate and download report based on type
      if (reportType === 'summary') {
        downloadSummaryReport();
      } else if (reportType === 'detailed') {
        downloadDetailedReport();
      } else if (reportType === 'images') {
        downloadImageCollection();
      }

    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const downloadSummaryReport = () => {
    const reportData = {
      rover: rover.name,
      status: rover.status,
      landingDate: rover.landingDate,
      launchDate: rover.launchDate,
      totalPhotos: rover.totalPhotos,
      maxSol: rover.maxSol,
      maxDate: rover.maxDate,
      generatedAt: new Date().toISOString(),
      summary: {
        missionDuration: calculateMissionDuration(rover.landingDate),
        keyAchievements: [
          `Captured ${rover.totalPhotos.toLocaleString()} images of Mars surface`,
          `Operated for ${rover.maxSol} Martian days (sols)`,
          `Advanced our understanding of Mars geology and climate`,
          `Contributed to future human mission planning`
        ],
        currentObjectives: [
          'Analyze rock and soil samples',
          'Search for signs of past microbial life',
          'Characterize climate and geology',
          'Prepare for human exploration'
        ]
      }
    };

    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rover.name}-mission-summary-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadDetailedReport = () => {
    const htmlReport = generateHTMLReport();
    const blob = new Blob([htmlReport], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rover.name}-detailed-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadImageCollection = () => {
    const imageData = {
      rover: rover.name,
      totalImages: photos.length,
      collectionDate: new Date().toISOString(),
      images: photos.slice(0, 50).map((photo) => ({
        id: photo.id,
        sol: photo.sol,
        earthDate: photo.earthDate,
        camera: photo.cameraFullName,
        imageUrl: photo.imgSrc || photo.img_src
      }))
    };

    const jsonString = JSON.stringify(imageData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rover.name}-image-collection-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const calculateMissionDuration = (landingDate: string): string => {
    const landing = new Date(landingDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - landing.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;
    
    return `${years} years, ${months} months, ${days} days`;
  };

  const generateHTMLReport = (): string => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${rover.name} Mission Report - Detailed Analysis</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #1a1a1a, #2d1b00);
            color: #f0f0f0;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: rgba(0, 0, 0, 0.8);
            padding: 30px;
            border-radius: 10px;
            border: 1px solid #cd5c5c;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #cd5c5c;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #22d3ee;
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .stat-card {
            background: rgba(34, 211, 238, 0.1);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid rgba(34, 211, 238, 0.3);
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #22d3ee;
            display: block;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            border-left: 4px solid #cd5c5c;
        }
        .section h2 {
            color: #cd5c5c;
            border-bottom: 1px solid rgba(205, 92, 92, 0.3);
            padding-bottom: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: #888;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${rover.name} Mars Rover</h1>
            <p>Comprehensive Mission Analysis Report</p>
            <p><em>Generated on ${new Date().toLocaleDateString()}</em></p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-value">${rover.totalPhotos.toLocaleString()}</span>
                <div>Total Photos</div>
            </div>
            <div class="stat-card">
                <span class="stat-value">${rover.maxSol}</span>
                <div>Maximum Sol</div>
            </div>
            <div class="stat-card">
                <span class="stat-value">${calculateMissionDuration(rover.landingDate)}</span>
                <div>Mission Duration</div>
            </div>
            <div class="stat-card">
                <span class="stat-value">${rover.status}</span>
                <div>Current Status</div>
            </div>
        </div>

        <div class="section">
            <h2>Mission Overview</h2>
            <p><strong>Launch Date:</strong> ${rover.launchDate}</p>
            <p><strong>Landing Date:</strong> ${rover.landingDate}</p>
            <p><strong>Last Communication:</strong> ${rover.maxDate}</p>
            <p>
                The ${rover.name} rover represents one of humanity's greatest achievements in planetary exploration. 
                This mission has revolutionized our understanding of Mars, providing unprecedented insights into 
                the planet's geology, climate history, and potential for past or present life.
            </p>
        </div>

        <div class="section">
            <h2>Key Achievements</h2>
            <ul>
                <li>Captured over ${rover.totalPhotos.toLocaleString()} high-resolution images of the Martian surface</li>
                <li>Operated successfully for ${rover.maxSol} Martian days, far exceeding initial mission parameters</li>
                <li>Conducted detailed geological surveys and sample analysis</li>
                <li>Contributed to mapping potential sites for future human missions</li>
                <li>Advanced our understanding of Mars' atmospheric conditions and weather patterns</li>
                <li>Provided crucial data for planetary protection protocols</li>
            </ul>
        </div>

        <div class="section">
            <h2>Scientific Discoveries</h2>
            <ul>
                <li><strong>Geological Analysis:</strong> Identified diverse rock formations indicating past water activity</li>
                <li><strong>Atmospheric Studies:</strong> Measured seasonal variations in atmospheric composition</li>
                <li><strong>Surface Composition:</strong> Analyzed mineral content revealing Mars' complex geological history</li>
                <li><strong>Climate Reconstruction:</strong> Provided evidence of ancient climate patterns and habitability potential</li>
            </ul>
        </div>

        <div class="section">
            <h2>Technical Specifications</h2>
            <ul>
                <li><strong>Mission Type:</strong> Robotic Mars Exploration</li>
                <li><strong>Agency:</strong> NASA Jet Propulsion Laboratory</li>
                <li><strong>Communication:</strong> Direct-to-Earth and Mars Relay Network</li>
                <li><strong>Power Source:</strong> Radioisotope Thermoelectric Generator (RTG)</li>
                <li><strong>Mobility:</strong> Six-wheel rocker-bogie suspension system</li>
            </ul>
        </div>

        <div class="footer">
            <p>This report was generated by the Mars Rover Mission Control System</p>
            <p>Data courtesy of NASA Jet Propulsion Laboratory</p>
        </div>
    </div>
</body>
</html>`;
  };

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 border-cyan-500/30 bg-black/95 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-3">
        <h3 className="text-sm font-semibold text-cyan-400 font-mono flex items-center gap-2">
          <Download className="w-4 h-4" />
          MISSION REPORTS
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-mono">Report Type</label>
          <Select value={reportType} onValueChange={(value) => setReportType(value as any)}>
            <SelectTrigger className="bg-gray-900 border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Mission Summary (JSON)
                </div>
              </SelectItem>
              <SelectItem value="detailed">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Detailed Report (HTML)
                </div>
              </SelectItem>
              <SelectItem value="images">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Image Collection (JSON)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <div className="text-xs text-cyan-400 font-mono">Generating report...</div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <Button
          onClick={generateReport}
          disabled={isGenerating}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          data-testid="button-generate-report"
        >
          {isGenerating ? (
            <>Generating...</>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            <span>Location: {rover.name} Landing Site</span>
          </div>
          <div>Last Updated: {new Date().toLocaleDateString()}</div>
          <div>Photos Available: {photos.length}</div>
        </div>
      </CardContent>
    </Card>
  );
}