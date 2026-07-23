import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
// importng viewers data
import viewers from '../../server/viewers.json';
// ════════════════════════════════════════════════════
//  Utility: lat/lon → 3D   (matches ThreeGeoJSON)
// ════════════════════════════════════════════════════

function coordToSphere(lon: number, lat: number, radius: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

// Interpolate between two coordinate pairs so lines hug the sphere
function interpolateCoords(
  coordA: [number, number],
  coordB: [number, number],
  maxDeg = 2,
): [number, number][] {
  const dist = Math.max(
    Math.abs(coordA[0] - coordB[0]),
    Math.abs(coordA[1] - coordB[1]),
  );
  const steps = Math.max(2, Math.ceil(dist / maxDeg));
  const result: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    result.push([
      coordA[0] + (coordB[0] - coordA[0]) * t,
      coordA[1] + (coordB[1] - coordA[1]) * t,
    ]);
  }
  return result;
}

// ════════════════════════════════════════════════════
//  GeoJSON → THREE.Line objects
// ════════════════════════════════════════════════════

type GeoJSONFeature = {
  type: string;
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][] | number[][][][];
  };
};

type GeoJSONCollection = {
  type: string;
  features?: GeoJSONFeature[];
  geometries?: { type: string; coordinates: number[] | number[][] | number[][][] | number[][][][] }[];
};

function drawGeoJSON(
  json: GeoJSONCollection,
  radius: number,
  material: THREE.LineBasicMaterial,
): THREE.Group {
  const group = new THREE.Group();
  // Fix orientation so North is up (matching ThreeGeoJSON hack)
  group.rotation.x = 0;

  const geometries: { type: string; coordinates: unknown }[] = [];

  if (json.features) {
    for (const f of json.features) {
      geometries.push(f.geometry);
    }
  } else if (json.geometries) {
    geometries.push(...json.geometries);
  }

  for (const geom of geometries) {
    if (geom.type === 'Polygon') {
      const rings = geom.coordinates as number[][][];
      for (const ring of rings) {
        addLineFromCoords(ring as [number, number][], radius, material, group);
      }
    } else if (geom.type === 'MultiPolygon') {
      const polys = geom.coordinates as number[][][][];
      for (const poly of polys) {
        for (const ring of poly) {
          addLineFromCoords(ring as [number, number][], radius, material, group);
        }
      }
    } else if (geom.type === 'LineString') {
      addLineFromCoords(geom.coordinates as [number, number][], radius, material, group);
    } else if (geom.type === 'MultiLineString') {
      const lines = geom.coordinates as number[][][];
      for (const line of lines) {
        addLineFromCoords(line as [number, number][], radius, material, group);
      }
    }
  }

  return group;
}

function addLineFromCoords(
  coords: [number, number][],
  radius: number,
  material: THREE.LineBasicMaterial,
  parent: THREE.Group,
) {
  if (coords.length < 2) return;

  const points: THREE.Vector3[] = [];
  for (let i = 0; i < coords.length - 1; i++) {
    const interp = interpolateCoords(coords[i], coords[i + 1], 2);
    for (const c of interp) {
      points.push(coordToSphere(c[0], c[1], radius));
    }
  }
  // Close loop (last coord)
  points.push(coordToSphere(coords[coords.length - 1][0], coords[coords.length - 1][1], radius));

  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geo, material);
  parent.add(line);
}

// ════════════════════════════════════════════════════
//  Scene sub-components
// ════════════════════════════════════════════════════

/** Starfield — random particles on a large sphere (matches getStarfield.js) */
function Starfield({ numStars = 600 }: { numStars?: number }) {
  const geo = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    for (let i = 0; i < numStars; i++) {
      const r = Math.random() * 25 + 25;
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      positions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      );
      // Soft blue-white hue
      const hue = 0.6;
      const c = new THREE.Color().setHSL(hue, 0.2, 0.8 + Math.random() * 0.2);
      colors.push(c.r, c.g, c.b);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return g;
  }, [numStars]);

  useEffect(() => () => geo.dispose(), [geo]);

  return (
    <points geometry={geo}>
      <pointsMaterial
        size={0.2}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/** Wireframe sphere (EdgesGeometry like the video) */
function GlobeWireframe({ radius }: { radius: number }) {
  const lineSegments = useMemo(() => {
    const sphereGeo = new THREE.IcosahedronGeometry(radius, 3);
    const edges = new THREE.EdgesGeometry(sphereGeo, 1);
    const mat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
    });
    const ls = new THREE.LineSegments(edges, mat);
    sphereGeo.dispose();
    return ls;
  }, [radius]);

  useEffect(
    () => () => {
      lineSegments.geometry.dispose();
      (lineSegments.material as THREE.Material).dispose();
    },
    [lineSegments],
  );

  return <primitive object={lineSegments} />;
}

/** GeoJSON country outlines rendered as Line on sphere surface */
function CountryOutlines({
  radius,
  geoData,
}: {
  radius: number;
  geoData: GeoJSONCollection | null;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const group = useMemo(() => {
    if (!geoData) return null;
    const mat = new THREE.LineBasicMaterial({
      color: 0x6ee7b7, // emerald-ish green (like the video)
      transparent: true,
      opacity: 0.7,
    });
    return drawGeoJSON(geoData, radius + 0.005, mat);
  }, [geoData, radius]);

  useEffect(
    () => () => {
      if (group) {
        group.traverse((obj) => {
          if ((obj as THREE.Line).geometry) (obj as THREE.Line).geometry.dispose();
        });
      }
    },
    [group],
  );

  if (!group) return null;
  return (
    <group ref={groupRef}>
      <primitive object={group} />
    </group>
  );
}

/** Location marker with pulsing rings */
function LocationMarker({
  lat,
  lon,
  radius,
  color = '#00ff88',
  isUser = false,
}: {
  lat: number;
  lon: number;
  radius: number;
  color?: string;
  isUser?: boolean;
}) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => coordToSphere(lon, lat, radius + 0.02), [lat, lon, radius]);
  const size = isUser ? 0.04 : 0.025;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * (isUser ? 4 : 2.5);
    if (pulseRef.current) {
      pulseRef.current.scale.setScalar(1 + Math.abs(Math.sin(t)) * 0.6);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.15 + Math.abs(Math.sin(t)) * 0.35;
    }
  });

  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={pulseRef}>
        <ringGeometry args={[size * 1.8, size * 2.8, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/** Geodesic arc on the sphere surface connecting two points */
function SurfaceArc({
  lat1,
  lon1,
  lat2,
  lon2,
  radius,
  color = '#38bdf8',
  opacity = 0.45,
}: {
  lat1: number;
  lon1: number;
  lat2: number;
  lon2: number;
  radius: number;
  color?: string;
  opacity?: number;
}) {
  const lineObj = useMemo(() => {
    const SEGS = 64;
    const s = coordToSphere(lon1, lat1, 1);
    const e = coordToSphere(lon2, lat2, 1);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= SEGS; i++) {
      const t = i / SEGS;
      const p = new THREE.Vector3().lerpVectors(s, e, t);
      p.normalize().multiplyScalar(radius + 0.01 + Math.sin(t * Math.PI) * 0.12);
      pts.push(p);
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
    });
    return new THREE.Line(geo, mat);
  }, [lat1, lon1, lat2, lon2, radius, color, opacity]);

  useEffect(
    () => () => {
      lineObj.geometry.dispose();
      (lineObj.material as THREE.Material).dispose();
    },
    [lineObj],
  );

  return <primitive object={lineObj} />;
}

// ════════════════════════════════════════════════════
//  Scene setup: fog + camera
// ════════════════════════════════════════════════════

function SceneSetup() {
  const { scene } = useThree();
  useEffect(() => {
    scene.fog = new THREE.FogExp2(0x000000, 0.12);
    return () => {
      scene.fog = null;
    };
  }, [scene]);
  return null;
}

// ════════════════════════════════════════════════════
//  Rotating globe group
// ════════════════════════════════════════════════════

interface Viewer {
  lat: number;
  lon: number;
  id: string;
}

function RotatingGlobe({
  geoData,
  userLocation,
  viewers,
}: {
  geoData: GeoJSONCollection | null;
  userLocation: { lat: number; lon: number } | null;
  viewers: Viewer[];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const RADIUS = 2;

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.08;
  });

  // Build arcs between nearest neighbours
  const allLocs = useMemo(
    () => [
      ...viewers,
      ...(userLocation
        ? [{ ...userLocation, id: 'user' }]
        : []),
    ],
    [viewers, userLocation],
  );

  const arcs = useMemo(() => {
    const result: { a: Viewer; b: Viewer; isUser: boolean }[] = [];
    for (let i = 0; i < allLocs.length; i++) {
      const sorted = allLocs
        .map((b, j) => ({
          b,
          j,
          d: Math.hypot(allLocs[i].lat - b.lat, allLocs[i].lon - b.lon),
        }))
        .filter(({ j }) => j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 2);
      for (const { b, j } of sorted) {
        if (j > i) {
          result.push({
            a: allLocs[i],
            b,
            isUser: allLocs[i].id === 'user' || b.id === 'user',
          });
        }
      }
    }
    return result;
  }, [allLocs]);

  return (
    <group ref={groupRef}>
      {/* Solid dark core sphere */}
      <mesh>
        <sphereGeometry args={[RADIUS * 0.99, 48, 48]} />
        <meshBasicMaterial color="#000a12" transparent opacity={0.85} />
      </mesh>

      {/* Wireframe edges (from the video) */}
      <GlobeWireframe radius={RADIUS} />

      {/* GeoJSON country outlines */}
      <CountryOutlines radius={RADIUS} geoData={geoData} />

      {/* Location markers */}
      {viewers.map((v) => (
        <LocationMarker
          key={v.id}
          lat={v.lat}
          lon={v.lon}
          radius={RADIUS}
          color="#38bdf8"
        />
      ))}
      {userLocation && (
        <LocationMarker
          lat={userLocation.lat}
          lon={userLocation.lon}
          radius={RADIUS}
          color="#00ff88"
          isUser
        />
      )}

      {/* Connection arcs */}
      {arcs.map((arc, i) => (
        <SurfaceArc
          key={`arc-${i}`}
          lat1={arc.a.lat}
          lon1={arc.a.lon}
          lat2={arc.b.lat}
          lon2={arc.b.lon}
          radius={RADIUS}
          color={arc.isUser ? '#00ff88' : '#38bdf8'}
          opacity={arc.isUser ? 0.65 : 0.35}
        />
      ))}

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[RADIUS * 1.06, 48, 48]} />
        <meshBasicMaterial
          color="#0ea5e9"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[RADIUS * 1.12, 48, 48]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// ════════════════════════════════════════════════════
//  Main Component
// ════════════════════════════════════════════════════

interface HoloEarthProps {
  isDark?: boolean;
  userLocation?: { lat: number; lon: number } | null;
  viewers?: Viewer[];
  locationError?: string | null;
}

// Natural Earth GeoJSON URL (110m resolution — small download)
const GEO_JSON_URL =
  'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/cultural/ne_110m_admin_0_countries.json';

export const HoloEarth = ({
  isDark: _isDark = true,
  userLocation = null,
  // viewers = [],
  locationError = null,
}: HoloEarthProps) => {
  const [geoData, setGeoData] = useState<GeoJSONCollection | null>(null);

  // Fetch GeoJSON data (the only thing HoloEarth fetches itself)
  const fetchGeoData = useCallback(async () => {
    try {
      const res = await fetch(GEO_JSON_URL);
      const json = await res.json();
      setGeoData(json);
    } catch (err) {
      console.warn('Failed to fetch GeoJSON, falling back to no outlines', err);
    }
  }, []);

  useEffect(() => {
    fetchGeoData();
  }, [fetchGeoData]);

  return (
    <div
      className="relative w-full select-none"
      style={{ height: '520px', minHeight: '360px' }}
    >
      {/* Soft background glow */}
      <div
        className="absolute inset-0 pointer-events-none rounded-full"
        style={{
          background:
            'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(14,165,233,0.12) 0%, rgba(59,130,246,0.06) 40%, transparent 68%)',
          zIndex: 0,
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 55 }}
        style={{ background: 'transparent', zIndex: 1 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneSetup />
        <Starfield numStars={800} />
        <RotatingGlobe
          geoData={geoData}
          userLocation={userLocation}
          viewers={viewers}
        />
      </Canvas>

      {/* HUD overlay */}
      <div
        className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-6 pointer-events-none"
        style={{ zIndex: 2 }}
      >
        <div className="flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-green-400 text-xs font-mono tracking-widest">
            YOU
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-400 text-xs font-mono tracking-widest">
            {viewers.length} VIEWERS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-1 h-1 rounded-full"
            style={{ background: 'rgba(14,165,233,0.5)' }}
          />
          <span
            className="text-xs font-mono tracking-widest"
            style={{ color: 'rgba(14,165,233,0.55)' }}
          >
            GLOBAL NETWORK
          </span>
        </div>
      </div>

      {/* Location status */}
      {locationError && (
        <div
          className="absolute top-2 left-0 right-0 flex justify-center pointer-events-none"
          style={{ zIndex: 2 }}
        >
          <span className="text-yellow-400/50 text-xs font-mono">
            {locationError}
          </span>
        </div>
      )}
    </div>
  );
};

export default HoloEarth;
