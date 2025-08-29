import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface ThreeTerrainViewerProps {
  location?: { lat: number; lon: number };
  className?: string;
}

export function ThreeTerrainViewer({ location = { lat: -5.4, lon: 137.8 }, className }: ThreeTerrainViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const terrainMeshRef = useRef<THREE.Mesh>();
  const animationRef = useRef<number>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 100);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(300, 200);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffaa44, 0.8);
    sunLight.position.set(10, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Create Mars terrain
    const createMarsTerrain = () => {
      const geometry = new THREE.PlaneGeometry(50, 50, 128, 128);
      const vertices = geometry.attributes.position.array as Float32Array;

      // Generate Mars-like terrain heights
      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        
        // Multiple layers of noise for realistic terrain
        let height = 0;
        height += Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2;
        height += Math.sin(x * 0.05) * Math.cos(z * 0.05) * 4;
        height += Math.random() * 0.5 - 0.25;
        
        // Add crater-like depressions
        const craterDistance = Math.sqrt(x * x + z * z);
        if (craterDistance < 10) {
          height -= (10 - craterDistance) * 0.3;
        }
        
        vertices[i + 1] = height;
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();

      // Mars surface material
      const material = new THREE.MeshLambertMaterial({
        color: 0xcd5c5c,
        wireframe: false,
      });

      const terrain = new THREE.Mesh(geometry, material);
      terrain.rotation.x = -Math.PI / 2;
      terrain.receiveShadow = true;
      terrainMeshRef.current = terrain;
      
      return terrain;
    };

    scene.add(createMarsTerrain());

    // Add rover marker at location
    const roverGeometry = new THREE.BoxGeometry(0.8, 0.3, 1.2);
    const roverMaterial = new THREE.MeshPhongMaterial({ color: 0x22d3ee });
    const rover = new THREE.Mesh(roverGeometry, roverMaterial);
    rover.position.set(
      (location.lon + 180) * 50 / 360 - 25,
      2,
      (location.lat + 90) * 50 / 180 - 25
    );
    rover.castShadow = true;
    scene.add(rover);

    // Add stars
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const starVertices = [];
    
    for (let i = 0; i < 3000; i++) {
      starVertices.push(
        (Math.random() - 0.5) * 200,
        Math.random() * 100 + 50,
        (Math.random() - 0.5) * 200
      );
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      // Rotate terrain slowly
      if (terrainMeshRef.current) {
        terrainMeshRef.current.rotation.z += 0.001;
      }
      
      // Rotate camera around terrain
      const time = Date.now() * 0.0005;
      camera.position.x = Math.cos(time) * 30;
      camera.position.z = Math.sin(time) * 30;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };

    animate();
    setIsLoading(false);

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      resizeObserver.disconnect();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [location]);

  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 15, 25);
    }
  };

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.8);
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.2);
    }
  };

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 border-cyan-500/30 bg-black/95 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-cyan-400 font-mono">3D TERRAIN VIEW</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              className="p-1 text-cyan-400 hover:bg-cyan-500/10"
              data-testid="button-zoom-out"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              className="p-1 text-cyan-400 hover:bg-cyan-500/10"
              data-testid="button-zoom-in"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetView}
              className="p-1 text-cyan-400 hover:bg-cyan-500/10"
              data-testid="button-reset-view"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-cyan-400 hover:bg-cyan-500/10"
              data-testid="button-expand-3d"
            >
              {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={containerRef}
          className={`transition-all duration-300 bg-black/50 rounded-b-lg overflow-hidden ${
            isExpanded ? 'h-96' : 'h-48'
          }`}
          data-testid="three-terrain-container"
        >
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-cyan-400 text-sm font-mono">Rendering Mars Terrain...</div>
            </div>
          )}
        </div>
        <div className="p-2 bg-gray-900/50 text-xs text-gray-400 font-mono">
          Location: {location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E
        </div>
      </CardContent>
    </Card>
  );
}