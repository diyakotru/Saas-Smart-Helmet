// helmet-model-3d.jsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function HelmetModel3D({ hoveredSensor }) {
  const containerRef = useRef(null);
  const sensorObjectsRef = useRef({});

  // --- MATERIALS (move outside useEffect so hover effect can access them)
  const helmetMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.3, metalness: 0.2 });
  const darkPlasticMaterial = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.5, metalness: 0.1 });
  const metallicMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.8 });
  const orangeCableMaterial = new THREE.MeshStandardMaterial({ color: 0xff8c00, roughness: 0.6, metalness: 0 });
  const glowingCyanMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
  const redLedMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const greenLedMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdadada);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.0, 2.8);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 5, 5).normalize();
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.7);
    fillLight.position.set(-5, 0, -5).normalize();
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(0, 5, -5).normalize();
    scene.add(backLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.4, 0);

    // --- HELMET CREATION (simplified) ---
    function createHelmet() {
      const helmet = new THREE.Group();
      const mainGeo = new THREE.SphereGeometry(0.6, 32, 32);
      const mainBody = new THREE.Mesh(mainGeo, helmetMaterial.clone());
      mainBody.position.y = 0;
      helmet.add(mainBody);
      return helmet;
    }

    // --- SENSOR EXAMPLES ---
    function createGasSensor() {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 32), darkPlasticMaterial.clone());
      body.rotation.z = Math.PI / 2;
      g.add(body);

      const led = new THREE.Mesh(new THREE.SphereGeometry(0.005), redLedMaterial);
      led.position.set(0.03, 0.06, 0.05);
      g.add(led);

      g.userData = { components: { body, led } };
      return g;
    }

    const helmet = createHelmet();
    scene.add(helmet);

    const gasSensor = createGasSensor();
    gasSensor.position.set(-0.55, 0.1, 0.1);
    helmet.add(gasSensor);
    sensorObjectsRef.current["gas-detector"] = gasSensor;

    // --- ANIMATION LOOP ---
    function animate() {
      controls.update();
      helmet.rotation.y += 0.0002;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
    };
  }, []);

  // --- HOVER HIGHLIGHT ---
  useEffect(() => {
    Object.values(sensorObjectsRef.current).forEach((obj) => {
      if (!obj) return;

      // Reset all LEDs to red
      if (obj.userData.components.led) {
        obj.userData.components.led.material = redLedMaterial;
      }
    });

    if (hoveredSensor) {
      const sensorObj = sensorObjectsRef.current[hoveredSensor];
      if (sensorObj && sensorObj.userData.components.led) {
        sensorObj.userData.components.led.material = greenLedMaterial;
      }
    }
  }, [hoveredSensor]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "12px",
        background: "radial-gradient(circle, rgba(250,250,250,1) 0%, rgba(200,200,200,1) 100%)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
      }}
    />
  );
}
