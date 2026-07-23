import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * ArcJarvisLoader — A JARVIS / Iron Man Arc-Reactor–inspired 3D loading animation.
 *
 * Visual composition:
 *   1. Outer wireframe sphere (EdgesGeometry) — rotates clockwise
 *   2. Inner white wireframe sphere — rotates counter-clockwise, vertex colors pulse
 *   3. Orange wireframe half-torus ring — sits above the spheres, rotates on Z-axis
 *   4. Random lightning bolts — shoot from the ring down to the inner sphere
 *   5. Impact glow — struck vertices flash yellow then decay back to a pulsing cyan glow
 *
 * The entire scene is responsive: objects scale down on mobile/tablet,
 * and the camera repositions to keep the composition centered.
 */
const ArcJarvisLoader: React.FC = () => {
    // Ref to the DOM container <div> where the Three.js canvas will be mounted
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Guard: bail out if the container DOM node isn't available yet
        if (!mountRef.current) return;

        // ──────────────────────────────────────────────────────────────
        //  1. SCENE SETUP — Create the Three.js scene (empty 3D world)
        // ──────────────────────────────────────────────────────────────
        const scene = new THREE.Scene();

        // ──────────────────────────────────────────────────────────────
        //  2. RESPONSIVE SIZE DETECTION
        //     Returns viewport dimensions and device-type flags.
        //     Used both on initial load and on every window resize.
        // ──────────────────────────────────────────────────────────────
        const getContainerSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const isMobile = width < 768;                      // phones
            const isTablet = width >= 768 && width < 1024;     // tablets

            return { width, height, isMobile, isTablet };
        };

        // Destructure the initial viewport dimensions and device flags
        let { width, height, isMobile, isTablet } = getContainerSize();

        // ──────────────────────────────────────────────────────────────
        //  3. CAMERA SETUP
        //     PerspectiveCamera(fov=75°, aspect ratio, near=0.1, far=1000)
        //     Gives a natural perspective look to the 3D scene.
        // ──────────────────────────────────────────────────────────────
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

        // ──────────────────────────────────────────────────────────────
        //  4. RENDERER SETUP
        //     WebGLRenderer with:
        //       - alpha: true    → transparent background (so the black
        //                          overlay behind this component shows through)
        //       - antialias: true → smooth edges on geometry
        //     Pixel ratio is capped at 2 to prevent performance issues
        //     on high-DPI devices (e.g. Retina displays).
        // ──────────────────────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Append the <canvas> element to our container <div>
        mountRef.current.appendChild(renderer.domElement);

        // ──────────────────────────────────────────────────────────────
        //  5. RESPONSIVE SCALE FACTOR
        //     All 3D object sizes are multiplied by this factor so
        //     the scene looks proportional on any screen size.
        //       - Mobile:  0.6× (60% of desktop size)
        //       - Tablet:  0.8× (80% of desktop size)
        //       - Desktop: 1.0× (full size)
        // ──────────────────────────────────────────────────────────────
        const getScaleFactor = () => {
            if (isMobile) return 0.55;
            if (isTablet) return 0.75;
            return 1.0;
        };

        let scaleFactor = getScaleFactor();

        // ══════════════════════════════════════════════════════════════
        //  6. 3D OBJECTS — Creating the three main visual elements
        // ══════════════════════════════════════════════════════════════

        // ── 6a. OUTER WIREFRAME SPHERE (the "cage") ──────────────────
        //   SphereGeometry(radius=1×scale) → extract edges → LineSegments
        //   This creates a geometric wireframe shell around everything.
        //   EdgesGeometry(geometry, thresholdAngle=11°) only keeps edges
        //   where the angle between adjacent faces exceeds 11°, giving
        //   a cleaner, more geometric look than a full wireframe.
        const sphereGeometry = new THREE.SphereGeometry(1 * scaleFactor);
        const LineMat = new THREE.LineBasicMaterial({ color: 0xffff }); // near-black with a hint of blue
        const edge = new THREE.EdgesGeometry(sphereGeometry, 11);
        const line = new THREE.LineSegments(edge, LineMat);

        // ── 6b. INNER WIREFRAME SPHERE (the "core") ─────────────────
        //   A smaller sphere (radius=0.5×scale) rendered as a full
        //   wireframe mesh. Uses vertexColors=true so individual
        //   vertices can be colored independently (for lightning
        //   impact flashes and the pulsing glow effect).
        const geometry = new THREE.SphereGeometry(0.5 * scaleFactor);
        const sphere_material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, vertexColors: true });
        const sphere = new THREE.Mesh(geometry, sphere_material);

        // ── 6b-i. INITIALIZE VERTEX COLORS ──────────────────────────
        //   Create a Float32Array with 3 values (R, G, B) per vertex.
        //   All vertices start as white (1, 1, 1). This buffer will be
        //   dynamically updated by the lightning and glow systems.
        const sphereColors = new Float32Array(geometry.attributes.position.count * 3);
        const initialColor = new THREE.Color(0xffffff);
        for (let i = 0; i < geometry.attributes.position.count; i++) {
            sphereColors[i * 3] = initialColor.r;       // Red channel
            sphereColors[i * 3 + 1] = initialColor.g;   // Green channel
            sphereColors[i * 3 + 2] = initialColor.b;   // Blue channel
        }
        // Attach the color buffer as a 'color' attribute on the geometry
        geometry.setAttribute('color', new THREE.BufferAttribute(sphereColors, 3));

        // ── 6c. HALF-TORUS RING (the "arc reactor ring") ────────────
        //   TorusGeometry creates a donut shape. By setting arc=Math.PI
        //   (180°), we get only half of the donut — a semicircular ring.
        //   This sits above the spheres like the arc reactor's charging ring.
        //     - radius:          how far the ring center is from the origin
        //     - tube:            thickness of the ring tube
        //     - radialSegments:  cross-section detail (6 = hexagonal tube)
        //     - tubularSegments: how many segments along the arc (10)
        //     - arc:             Math.PI = half circle (180°)
        const radius = 0.99 * scaleFactor;
        const tube = 0.1 * scaleFactor;
        const radialSegments = 6;
        const tubularSegments = 10;
        const arc = Math.PI;  // Half circle (180 degrees)

        const halfRingGeometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments, arc);
        const halfRingMaterial = new THREE.MeshBasicMaterial({
            color: 0xffa500,    // Orange color — Iron Man / arc reactor aesthetic
            wireframe: true,    // Render as wireframe for holographic look
        });

        const halfRing = new THREE.Mesh(halfRingGeometry, halfRingMaterial);
        // Rotate the ring to lay horizontally (default torus is vertical)
        halfRing.rotation.x = Math.PI / 2;
        // Position it above the center — floating above the spheres
        halfRing.position.y = 0.9 * scaleFactor;

        // ── 6d. ADD ALL OBJECTS TO THE SCENE ────────────────────────
        scene.add(halfRing);   // Orange half-ring (top)
        scene.add(sphere);     // Inner wireframe sphere (core)
        scene.add(line);       // Outer edge-based wireframe sphere (cage)

        // ──────────────────────────────────────────────────────────────
        //  7. CAMERA POSITIONING (Responsive)
        //     The camera looks down at the scene from above.
        //     On mobile, it's closer and lower to keep objects large.
        //     On desktop, it's higher up with a more dramatic angle.
        // ──────────────────────────────────────────────────────────────
        const setCameraPosition = () => {
            if (isMobile) {
                camera.fov = 85;            // Wider FOV on mobile to see the full reactor
                camera.position.y = 1.8;    // Lower vertical position
                camera.position.z = 1.2;    // Pull back to keep everything in frame
            } else if (isTablet) {
                camera.fov = 80;
                camera.position.y = 2.2;
                camera.position.z = 0.8;
            } else {
                camera.fov = 75;
                camera.position.y = 3;      // Highest — most dramatic top-down view
                camera.position.z = 0;      // Directly above (no forward offset)
            }
            camera.updateProjectionMatrix();  // Must call after changing FOV
            camera.up.set(0, 1, 0);         // Ensure "up" is the Y-axis
            camera.lookAt(0, 0, 0);         // Always look at the scene center
        };

        setCameraPosition();

        // ══════════════════════════════════════════════════════════════
        //  8. LIGHTNING STRIKE SYSTEM
        //     Creates random electrical bolts from the half-ring down
        //     to random vertices on the inner sphere. Each strike:
        //       - Picks a random point on the half-ring (start)
        //       - Picks a random vertex on the inner sphere (end)
        //       - Generates a jagged line between them with random offsets
        //       - Flashes the target vertex yellow on impact
        //       - Self-destructs after 10 frames
        // ══════════════════════════════════════════════════════════════

        // Cache the outer sphere's vertex positions (used for decay tracking)
        const spherePositions = sphereGeometry.attributes.position;
        // Decay tracker: 1.0 = just struck (bright yellow), decays to 0 = base glow color
        const sphereColorDecay = new Float32Array(spherePositions.count).fill(0);

        // TypeScript interface for tracking active lightning bolts
        interface LightningStrike {
            line: THREE.Line;       // The Three.js line object in the scene
            life: number;           // Remaining frames before removal (starts at 10)
            targetVertex: number;   // Index of the sphere vertex that was struck
        }
        // Array holding all currently active lightning bolts
        const lightningStrikes: LightningStrike[] = [];

        /**
         * createLightningStrike()
         * Spawns a single lightning bolt from the half-ring to the inner sphere.
         *
         * Steps:
         *   1. Pick a random vertex on the half-ring as the START point
         *   2. Convert that local position to world coordinates
         *   3. Pick a random vertex on the inner sphere as the END point
         *   4. Convert that to world coordinates too
         *   5. Generate intermediate points along the path with random
         *      lateral offsets to create the "jagged lightning" look
         *   6. Create a yellow Line from these points and add to scene
         *   7. Flash the target vertex yellow and set its decay to 1.0
         *   8. Register the strike in the lightningStrikes array
         */
        function createLightningStrike() {
            // ── Step 1–2: Random START position from the half-ring ───
            const ringPosAttr = halfRing.geometry.attributes.position;
            const randomIndex = Math.floor(Math.random() * ringPosAttr.count);
            const startPos = new THREE.Vector3(
                ringPosAttr.getX(randomIndex),
                ringPosAttr.getY(randomIndex),
                ringPosAttr.getZ(randomIndex)
            );
            // Convert from the ring's local space to world space
            // (accounts for the ring's rotation and position)
            halfRing.localToWorld(startPos);

            // ── Step 3–4: Random END position on the inner sphere ───
            const spherePosAttr = sphere.geometry.attributes.position;
            const targetIndex = Math.floor(Math.random() * spherePosAttr.count);
            const endPos = new THREE.Vector3(
                spherePosAttr.getX(targetIndex),
                spherePosAttr.getY(targetIndex),
                spherePosAttr.getZ(targetIndex)
            );
            // Convert from the sphere's local space to world space
            sphere.localToWorld(endPos);

            // ── Step 5: Build jagged lightning path ──────────────────
            const points: THREE.Vector3[] = [startPos];
            const segments = 8; // Number of segments in the bolt

            for (let i = 1; i < segments; i++) {
                const t = i / segments; // Interpolation factor (0→1)
                // Start with a straight-line interpolated point
                const midPoint = new THREE.Vector3().lerpVectors(startPos, endPos, t);

                // Add random offset for the "jagged" effect
                // Offset decreases as we approach the target (1-t)
                // so the bolt converges smoothly onto the sphere
                const offset = 0.1 * (1 - t) * scaleFactor;
                midPoint.x += (Math.random() - 0.5) * offset;
                midPoint.y += (Math.random() - 0.5) * offset;
                midPoint.z += (Math.random() - 0.5) * offset;

                points.push(midPoint);
            }
            points.push(endPos); // Final point = exact target vertex

            // ── Step 6: Create the lightning Line and add to scene ───
            const lightningGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lightningMaterial = new THREE.LineBasicMaterial({
                color: 0xffff00,    // Bright yellow
                linewidth: 2        // Note: linewidth > 1 only works in some renderers
            });
            const lightningLine = new THREE.Line(lightningGeometry, lightningMaterial);
            scene.add(lightningLine);

            // ── Step 7: Flash the struck vertex yellow ───────────────
            const colorAttr = sphere.geometry.attributes.color;
            const impactColor = new THREE.Color(0xffff00); // Yellow flash
            colorAttr.setXYZ(targetIndex, impactColor.r, impactColor.g, impactColor.b);
            colorAttr.needsUpdate = true; // Tell Three.js to re-upload colors to GPU
            // Set decay to 1.0 — this vertex will gradually fade from
            // yellow back to the base glow color over subsequent frames
            sphereColorDecay[targetIndex] = 1.0;

            // ── Step 8: Track this strike for lifecycle management ───
            lightningStrikes.push({
                line: lightningLine,
                life: 10,               // Will be removed after 10 frames
                targetVertex: targetIndex
            });
        }

        /**
         * updateLightningStrikes()
         * Called every frame. Handles two jobs:
         *   1. Age existing strikes — decrement life, remove dead ones
         *   2. Randomly spawn new strikes (5% chance per frame)
         */
        function updateLightningStrikes() {
            // Iterate backwards so we can safely splice while iterating
            for (let i = lightningStrikes.length - 1; i >= 0; i--) {
                const strike = lightningStrikes[i];
                strike.life--; // Age the strike by 1 frame

                if (strike.life <= 0) {
                    // Strike expired — remove from scene and free GPU memory
                    scene.remove(strike.line);
                    strike.line.geometry.dispose();
                    (strike.line.material as THREE.Material).dispose();
                    // Remove from tracking array
                    lightningStrikes.splice(i, 1);
                }
            }

            // 5% chance each frame to spawn a new lightning bolt
            // This creates an irregular, organic-feeling rhythm
            if (Math.random() < 0.05) {
                createLightningStrike();
            }
        }

        // ══════════════════════════════════════════════════════════════
        //  9. SPHERE GLOW ANIMATION SYSTEM
        //     Makes the inner sphere pulse with a breathing cyan glow.
        //     Vertices that were struck by lightning are handled specially:
        //       - They start yellow (decay=1.0) and gradually lerp
        //         back to the base glow color as decay approaches 0.
        //       - Non-struck vertices just follow the pulsing glow.
        // ══════════════════════════════════════════════════════════════

        let colorPhase = 0;                    // Phase accumulator for the sine wave
        const glowColor = new THREE.Color();   // Reusable color object (avoids GC)

        /**
         * animateSphereGlow()
         * Called every frame. Updates every vertex color on the inner sphere.
         *
         * The base glow color oscillates using a sine wave:
         *   - Hue:        0.5 (cyan)
         *   - Saturation:  0.9 (highly saturated)
         *   - Lightness:   0.3–0.7 (pulsing between dim and bright)
         *
         * For each vertex:
         *   - If decay > 0 (recently struck by lightning):
         *       → Gradually lerp the vertex color from its current
         *         color (yellow-ish) toward the base glow color
         *       → Decrease decay by 0.03 each frame
         *       → When decay hits 0, snap to the base glow color
         *   - If decay == 0 (no recent strike):
         *       → Set directly to the base glow color
         */
        function animateSphereGlow() {
            // Calculate pulsing intensity: oscillates 0→1→0 over time
            const intensity = (Math.sin(colorPhase) + 1) / 2;
            // Set the base glow color: cyan hue, high saturation, pulsing lightness
            glowColor.setHSL(0.5, 0.9, 0.3 + 0.4 * intensity);

            const colorAttr = sphere.geometry.attributes.color;
            for (let i = 0; i < sphereColorDecay.length; i++) {
                if (sphereColorDecay[i] > 0) {
                    // This vertex was recently struck — it's still decaying
                    sphereColorDecay[i] -= 0.03; // Reduce decay each frame

                    if (sphereColorDecay[i] <= 0) {
                        // Decay complete — snap to base glow color
                        sphereColorDecay[i] = 0;
                        colorAttr.setXYZ(i, glowColor.r, glowColor.g, glowColor.b);
                    } else {
                        // Still decaying — smoothly blend (lerp) from current
                        // color toward the base glow. Factor=0.1 means 10% blend
                        // per frame, creating a gradual fade-out from yellow.
                        const currentColor = new THREE.Color(
                            colorAttr.getX(i),
                            colorAttr.getY(i),
                            colorAttr.getZ(i)
                        );
                        currentColor.lerp(glowColor, 0.1);
                        colorAttr.setXYZ(i, currentColor.r, currentColor.g, currentColor.b);
                    }
                } else {
                    // No recent strike — just follow the pulsing glow
                    colorAttr.setXYZ(i, glowColor.r, glowColor.g, glowColor.b);
                }
            }
            // Flag the color buffer as dirty so the GPU re-uploads it
            colorAttr.needsUpdate = true;

            // Advance the phase for the next frame (controls pulse speed)
            colorPhase += 0.03;
        }

        // ══════════════════════════════════════════════════════════════
        //  10. MAIN ANIMATION LOOP (render loop)
        //      Runs ~60 times per second via requestAnimationFrame.
        //      Each frame:
        //        a) Update lightning (age/remove old, maybe spawn new)
        //        b) Update sphere glow colors (pulse + decay)
        //        c) Rotate all three objects in different directions:
        //           - Inner sphere: rotates LEFT (counter-clockwise)
        //           - Outer cage:   rotates RIGHT (clockwise)
        //           - Half-ring:    spins on its Z-axis
        //        d) Render the scene from the camera's perspective
        // ══════════════════════════════════════════════════════════════
        const animate = () => {
            requestAnimationFrame(animate); // Schedule the next frame

            updateLightningStrikes();       // (a) Lightning lifecycle
            animateSphereGlow();            // (b) Vertex color pulsing

            sphere.rotation.y -= 0.01;      // (c) Inner sphere rotates counter-clockwise
            sphere.rotation.x-=.01;
            sphere.rotation.z+=0.01;
            line.rotation.y += 0.01;        //     Outer cage rotates clockwise (opposite)
            line.rotation.z+=0.01;
            halfRing.rotation.z += 0.01;    //     Half-ring spins on its own axis

            renderer.render(scene, camera); // (d) Draw the frame
        };
        animate(); // Kick off the loop

        // ══════════════════════════════════════════════════════════════
        //  11. WINDOW RESIZE HANDLER
        //      When the browser window is resized:
        //        a) Re-detect viewport size and device type
        //        b) Update camera aspect ratio and projection
        //        c) Resize the renderer canvas
        //        d) Reposition the camera for the new device category
        //        e) Recalculate scale factor and apply proportional
        //           scaling to all 3D objects so they stay the right
        //           size relative to the viewport
        // ══════════════════════════════════════════════════════════════
        const handleResize = () => {
            // (a) Re-detect viewport dimensions and device type
            const newSize = getContainerSize();
            width = newSize.width;
            height = newSize.height;
            isMobile = newSize.isMobile;
            isTablet = newSize.isTablet;

            // (b) Update camera aspect ratio so objects don't stretch
            camera.aspect = width / height;
            camera.updateProjectionMatrix(); // Must be called after changing aspect

            // (c) Resize the WebGL canvas to match the new viewport
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // (d) Reposition camera for the new device category
            setCameraPosition();

            // (e) Scale all objects proportionally
            //     Calculate the ratio between new and old scale factors,
            //     then multiply each object's scale by that ratio.
            //     This avoids rebuilding geometry — just transforms the
            //     existing objects.
            const newScaleFactor = getScaleFactor();
            const scaleRatio = newScaleFactor / scaleFactor;
            scaleFactor = newScaleFactor;

            sphere.scale.multiplyScalar(scaleRatio);   // Scale inner sphere
            line.scale.multiplyScalar(scaleRatio);      // Scale outer cage
            halfRing.scale.multiplyScalar(scaleRatio);  // Scale half-ring
            halfRing.position.y = 0.9 * scaleFactor;   // Reposition ring vertically
        };
        // Register the resize handler on the window
        window.addEventListener('resize', handleResize);

        // ══════════════════════════════════════════════════════════════
        //  12. CLEANUP FUNCTION (returned from useEffect)
        //      React calls this when the component unmounts.
        //      We must:
        //        a) Remove the resize event listener
        //        b) Clean up all active lightning strikes (remove from
        //           scene + dispose geometry & material to free GPU memory)
        //        c) Dispose the renderer (releases the WebGL context)
        //        d) Dispose all geometries (free GPU vertex buffers)
        //        e) Dispose all materials (free GPU shader programs)
        //        f) Remove the <canvas> element from the DOM
        //
        //      This prevents memory leaks and GPU resource exhaustion,
        //      especially important since Three.js doesn't automatically
        //      garbage-collect GPU resources.
        // ══════════════════════════════════════════════════════════════
        return () => {
            // (a) Remove resize listener
            window.removeEventListener('resize', handleResize);

            // (b) Clean up any remaining lightning strikes
            lightningStrikes.forEach(strike => {
                scene.remove(strike.line);
                strike.line.geometry.dispose();
                (strike.line.material as THREE.Material).dispose();
            });

            // (c) Dispose the WebGL renderer (releases GPU context)
            renderer.dispose();

            // (d) Dispose all geometries (free vertex buffer memory)
            sphere.geometry.dispose();       // Inner sphere geometry
            halfRing.geometry.dispose();     // Half-ring torus geometry
            line.geometry.dispose();         // Outer cage LineSegments geometry
            edge.dispose();                  // EdgesGeometry (used to build the cage)

            // (e) Dispose all materials (free shader program memory)
            (sphere.material as THREE.Material).dispose();
            (halfRing.material as THREE.Material).dispose();
            (line.material as THREE.Material).dispose();

            // (f) Remove the <canvas> DOM element from the container
            //     Safety check: only remove if it's still a child of our container
            if (mountRef.current && renderer.domElement.parentElement === mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []); // Empty dependency array = runs once on mount, cleanup on unmount

    // ══════════════════════════════════════════════════════════════
    //  13. RENDER — The component's JSX output
    //      A full-viewport <div> that serves as the mount point for
    //      the Three.js <canvas>. The canvas is appended to this
    //      div by the useEffect above.
    // ══════════════════════════════════════════════════════════════
    return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default ArcJarvisLoader;
