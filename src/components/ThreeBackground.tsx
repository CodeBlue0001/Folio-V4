import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Theme {
  background: string;
  primary: string;
  secondary: string;
  tertiary: string;
}

interface ThreeBackgroundProps {
  theme: Theme;
}

export function ThreeBackground({ theme }: ThreeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const objectsRef = useRef<{
    circles: THREE.Group[];
    lines: THREE.Group;
    shapes: THREE.Group;
    grid: THREE.Group;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.background);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create groups
    const circles: THREE.Group[] = [];
    const linesGroup = new THREE.Group();
    const shapesGroup = new THREE.Group();
    const gridGroup = new THREE.Group();

    // Create concentric circles
    const circleCount = 8;
    for (let i = 0; i < circleCount; i++) {
      const radius = 5 + i * 3.5;
      const segments = 64;
      const geometry = new THREE.BufferGeometry();
      const positions: number[] = [];

      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        positions.push(
          Math.cos(theta) * radius,
          Math.sin(theta) * radius,
          0
        );
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

      const material = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? theme.primary : theme.secondary,
        transparent: true,
        opacity: 0.6,
        linewidth: 1
      });

      const circle = new THREE.Line(geometry, material);
      const group = new THREE.Group();
      group.add(circle);
      circles.push(group);
      scene.add(group);
    }

    // Create radial lines
    const lineCount = 24;
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2;
      const geometry = new THREE.BufferGeometry();
      const positions = [
        0, 0, 0,
        Math.cos(angle) * 35,
        Math.sin(angle) * 35,
        0
      ];
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

      const material = new THREE.LineBasicMaterial({
        color: theme.secondary,
        transparent: true,
        opacity: 0.3,
        linewidth: 1
      });

      const line = new THREE.Line(geometry, material);
      linesGroup.add(line);
    }
    scene.add(linesGroup);

    // Create geometric shapes
    const shapeCount = 15;
    for (let i = 0; i < shapeCount; i++) {
      const size = Math.random() * 2 + 1;
      const geometry = new THREE.BoxGeometry(size, size, size);
      const material = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? theme.primary : i % 3 === 1 ? theme.secondary : theme.tertiary,
        transparent: true,
        opacity: 0.4,
        wireframe: true
      });

      const mesh = new THREE.Mesh(geometry, material);
      const angle = (i / shapeCount) * Math.PI * 2;
      const radius = 15 + Math.random() * 20;
      mesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        Math.random() * 10 - 5
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      shapesGroup.add(mesh);
    }
    scene.add(shapesGroup);

    // Create grid
    const gridSize = 100;
    const gridDivisions = 20;
    const gridGeometry = new THREE.BufferGeometry();
    const gridPositions: number[] = [];

    for (let i = -gridDivisions; i <= gridDivisions; i++) {
      const pos = (i / gridDivisions) * gridSize;
      // Horizontal lines
      gridPositions.push(-gridSize, pos, -20);
      gridPositions.push(gridSize, pos, -20);
      // Vertical lines
      gridPositions.push(pos, -gridSize, -20);
      gridPositions.push(pos, gridSize, -20);
    }

    gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
    const gridMaterial = new THREE.LineBasicMaterial({
      color: theme.primary,
      transparent: true,
      opacity: 0.15
    });
    const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
    gridGroup.add(grid);
    scene.add(gridGroup);

    // Create central sphere
    const sphereGeometry = new THREE.SphereGeometry(2, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: theme.tertiary,
      transparent: true,
      opacity: 0.8,
      wireframe: true
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    objectsRef.current = { circles, lines: linesGroup, shapes: shapesGroup, grid: gridGroup };

    // Animation
    let time = 0;
    const animate = () => {
      time += 0.015;

      // Rotate concentric circles smoothly
      circles.forEach((circle, index) => {
        circle.rotation.z = time * (index % 2 === 0 ? 0.3 : -0.3) * (1 + index * 0.15);
      });

      // Rotate radial lines group
      linesGroup.rotation.z = time * 0.2;

      // Animate 3D wireframe shapes
      shapesGroup.children.forEach((shape, index) => {
        shape.rotation.x += 0.012 * (index % 2 === 0 ? 1 : -1);
        shape.rotation.y += 0.015 * (index % 3 === 0 ? 1 : -1);
        // Pulsing scale effect
        const scale = 1 + Math.sin(time * 2.5 + index) * 0.25;
        shape.scale.set(scale, scale, scale);
      });

      // Pulse & rotate central sphere
      sphere.rotation.x = time * 0.3;
      sphere.rotation.y = time * 0.5;
      const sphereScale = 1 + Math.sin(time * 3) * 0.2;
      sphere.scale.set(sphereScale, sphereScale, sphereScale);

      // Smooth camera orbital movement
      camera.position.x = Math.sin(time * 0.4) * 6;
      camera.position.y = Math.cos(time * 0.3) * 4;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update theme colors
  useEffect(() => {
    if (!sceneRef.current || !objectsRef.current) return;

    sceneRef.current.background = new THREE.Color(theme.background);

    // Update circle colors
    objectsRef.current.circles.forEach((circleGroup, index) => {
      const circle = circleGroup.children[0] as THREE.Line;
      const material = circle.material as THREE.LineBasicMaterial;
      material.color.set(index % 2 === 0 ? theme.primary : theme.secondary);
    });

    // Update radial lines
    objectsRef.current.lines.children.forEach((line) => {
      const material = (line as THREE.Line).material as THREE.LineBasicMaterial;
      material.color.set(theme.secondary);
    });

    // Update shapes
    objectsRef.current.shapes.children.forEach((shape, index) => {
      const material = (shape as THREE.Mesh).material as THREE.MeshBasicMaterial;
      material.color.set(
        index % 3 === 0 ? theme.primary : index % 3 === 1 ? theme.secondary : theme.tertiary
      );
    });

    // Update grid
    objectsRef.current.grid.children.forEach((grid) => {
      const material = (grid as THREE.LineSegments).material as THREE.LineBasicMaterial;
      material.color.set(theme.primary);
    });
  }, [theme]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
