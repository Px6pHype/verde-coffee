import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

function seededRandom(seed = 42) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function makeLatteArtTexture(renderer) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1024;
  const context = canvas.getContext("2d");
  const random = seededRandom(23);

  // Мягкая кремовая база
  const base = context.createRadialGradient(512, 512, 40, 512, 512, 500);
  base.addColorStop(0, "#faf5e8");
  base.addColorStop(0.55, "#f2e6cf");
  base.addColorStop(1, "#d8c2a1");
  context.fillStyle = base;
  context.fillRect(0, 0, 1024, 1024);

  // Тонкие кофейные кольца
  context.strokeStyle = "rgba(91,58,34,.14)";
  context.lineWidth = 3;
  for (let index = 0; index < 34; index += 1) {
    context.beginPath();
    const radius = 78 + index * 13;
    context.arc(512, 512, radius, random() * 6.28, random() * 6.28 + 2.9);
    context.stroke();
  }

  // Лист VERDE в центре
  context.save();
  context.translate(512, 512);
  context.rotate(-0.22);
  const leaf = context.createLinearGradient(-170, -170, 170, 170);
  leaf.addColorStop(0, "#ffffff");
  leaf.addColorStop(0.45, "#f7f6e9");
  leaf.addColorStop(1, "#dff0df");
  context.fillStyle = leaf;
  context.beginPath();
  context.moveTo(0, 148);
  context.bezierCurveTo(-148, 68, -98, -128, 116, -172);
  context.bezierCurveTo(142, -28, 90, 104, 0, 148);
  context.closePath();
  context.fill();
  context.strokeStyle = "rgba(39,90,62,.32)";
  context.lineWidth = 10;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(-12, 146);
  context.bezierCurveTo(-8, 54, 12, -38, 92, -124);
  context.stroke();
  context.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 16);
  return texture;
}

function makeDrinkSideTexture(renderer) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const context = canvas.getContext("2d");
  const random = seededRandom(71);

  const gradient = context.createLinearGradient(0, 1024, 0, 0);
  gradient.addColorStop(0, "#5b341b");
  gradient.addColorStop(0.34, "#8d5a31");
  gradient.addColorStop(0.58, "#c49464");
  gradient.addColorStop(0.78, "#e1c39b");
  gradient.addColorStop(1, "#f4e2c6");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 1024);

  // Пузырьки и мягкие разводы молока
  for (let index = 0; index < 1800; index += 1) {
    const y = random() * 1024;
    const light = random() > 0.42;
    context.fillStyle = light
      ? `rgba(255,246,226,${0.018 + random() * 0.025})`
      : `rgba(54,29,12,${0.014 + random() * 0.02})`;
    context.beginPath();
    context.arc(random() * 512, y, random() * 5 + 0.5, 0, Math.PI * 2);
    context.fill();
  }

  context.strokeStyle = "rgba(255,244,219,.1)";
  context.lineWidth = 4;
  for (let index = 0; index < 17; index += 1) {
    context.beginPath();
    const offset = index * 62;
    for (let x = 0; x <= 512; x += 16) {
      const y = offset + Math.sin(x / 68 + index) * 18;
      if (x === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  return texture;
}

function makeBrandBandTexture(renderer, textureScale = 2) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048 * textureScale;
  canvas.height = 512 * textureScale;
  const context = canvas.getContext("2d", { alpha: false });
  context.scale(textureScale, textureScale);
  const random = seededRandom(117);

  const gradient = context.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, "#205f45");
  gradient.addColorStop(0.45, "#174d3a");
  gradient.addColorStop(1, "#1b543f");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 2048, 512);

  // Тонкие волокна, как у крафт-полосы
  for (let index = 0; index < 15000; index += 1) {
    const light = random() > 0.48;
    context.fillStyle = light ? "rgba(238,247,232,.026)" : "rgba(0,20,12,.028)";
    context.fillRect(random() * 2048, random() * 512, random() * 1.5 + 0.25, random() * 4 + 0.5);
  }

  // Верхняя и нижняя тонкие линии
  context.fillStyle = "rgba(243,246,236,.54)";
  context.fillRect(0, 0, 2048, 3);
  context.fillRect(0, 509, 2048, 3);

  // Логотип повторяется на двух сторонах
  for (const center of [512, 1536]) {
    context.save();
    context.translate(center, 188);
    context.rotate(-0.12);
    context.strokeStyle = "#f6f7ef";
    context.lineWidth = 5;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(0, 46);
    context.bezierCurveTo(-56, 24, -37, -48, 78, -76);
    context.bezierCurveTo(91, -19, 54, 52, 0, 84);
    context.moveTo(-12, 61);
    context.bezierCurveTo(-4, 22, 16, -18, 60, -68);
    context.stroke();
    context.restore();

    context.textAlign = "center";
    context.fillStyle = "#fbfcf5";
    context.font = "700 124px 'Inter Variable', Arial, sans-serif";
    context.fillText("VERDE", center, 342);
    context.font = "600 24px 'Inter Variable', Arial, sans-serif";
    context.fillStyle = "rgba(250,252,245,.94)";
    context.fillText("C O F F E E   &   C A L M", center, 396);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 16);
  renderer.initTexture(texture);
  return texture;
}

function makeGlassGeometry(segments) {
  const profile = [
    [0, -1.70], [0.68, -1.70], [0.73, -1.68], [0.75, -1.61],
    [0.77, -1.48], [0.79, -1.32], [0.83, -1.14], [0.90, -0.94],
    [0.97, -0.72], [1.02, -0.48], [1.07, -0.22], [1.10, 0.04],
    [1.12, 0.30], [1.13, 0.56], [1.14, 0.82], [1.15, 1.08],
    [1.16, 1.28], [1.17, 1.38], [1.18, 1.43], [1.19, 1.46],
    [1.20, 1.48], [1.20, 1.50], [1.19, 1.51], [1.18, 1.52],
    [1.17, 1.53], [1.16, 1.53], [1.15, 1.53], [0, 1.53],
  ].map(([radius, height]) => new THREE.Vector2(radius, height));
  return new THREE.LatheGeometry(profile, segments);
}

function makeDrinkGeometry(segments) {
  const profile = [
    [0, -1.57], [0.62, -1.57], [0.66, -1.55], [0.68, -1.49],
    [0.70, -1.37], [0.72, -1.23], [0.76, -1.08], [0.82, -0.92],
    [0.88, -0.74], [0.94, -0.56], [0.99, -0.38], [1.03, -0.20],
    [1.07, -0.02], [1.10, 0.16], [1.12, 0.34], [1.14, 0.52],
    [1.16, 0.70], [1.17, 0.88], [1.18, 1.04], [1.19, 1.14],
    [1.20, 1.20], [1.21, 1.22], [1.22, 1.22], [1.23, 1.22],
    [1.24, 1.22], [1.24, 1.23], [1.23, 1.23], [0, 1.23],
  ].map(([radius, height]) => new THREE.Vector2(radius, height));
  return new THREE.LatheGeometry(profile, segments);
}

function makeShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(256, 256, 8, 256, 256, 250);
  gradient.addColorStop(0, "rgba(18,52,36,.34)");
  gradient.addColorStop(0.32, "rgba(18,52,36,.17)");
  gradient.addColorStop(0.67, "rgba(18,52,36,.06)");
  gradient.addColorStop(1, "rgba(18,52,36,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 512);
  return new THREE.CanvasTexture(canvas);
}

function makeIceCube(size, material) {
  const geometry = new THREE.BoxGeometry(size, size * 0.82, size, 3, 3, 3);
  const positions = geometry.attributes.position;
  const random = seededRandom(211);
  for (let index = 0; index < positions.count; index += 1) {
    positions.setXYZ(
      index,
      positions.getX(index) + (random() - 0.5) * 0.016,
      positions.getY(index) + (random() - 0.5) * 0.012,
      positions.getZ(index) + (random() - 0.5) * 0.016,
    );
  }
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

export function createCupScene(container, { reducedMotion = false } = {}) {
  const isMobileViewport = window.matchMedia("(max-width: 760px)").matches;
  const segments = isMobileViewport ? 112 : 192;
  const textureScale = isMobileViewport ? 1.5 : 2;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
  camera.position.set(0, 1.78, 8.8);
  camera.lookAt(0, 0.06, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: isMobileViewport ? "default" : "high-performance",
  });
  renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 1.5), isMobileViewport ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.setAttribute("aria-label", "Интерактивная 3D-чашка VERDE с айс-латте. Перетаскивайте мышью или пальцем, либо используйте стрелки на клавиатуре.");
  container.append(renderer.domElement);

  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentMap = pmrem.fromScene(environment, 0.03).texture;
  scene.environment = environmentMap;
  scene.environmentIntensity = 0.68;
  environment.dispose();
  pmrem.dispose();

  const latteArtTexture = makeLatteArtTexture(renderer);
  const drinkSideTexture = makeDrinkSideTexture(renderer);
  const brandBandTexture = makeBrandBandTexture(renderer, textureScale);
  const shadowTexture = makeShadowTexture();
  const cup = new THREE.Group();

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf5faf4,
    roughness: 0.07,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    transparent: true,
    opacity: 0.54,
    envMapIntensity: 1.35,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const drinkMaterial = new THREE.MeshPhysicalMaterial({
    map: drinkSideTexture,
    roughness: 0.28,
    metalness: 0,
    clearcoat: 0.42,
    clearcoatRoughness: 0.24,
    envMapIntensity: 0.62,
  });

  const latteMaterial = new THREE.MeshPhysicalMaterial({
    map: latteArtTexture,
    roughness: 0.24,
    metalness: 0,
    clearcoat: 0.48,
    clearcoatRoughness: 0.18,
    envMapIntensity: 0.72,
  });

  const brandBandMaterial = new THREE.MeshPhysicalMaterial({
    map: brandBandTexture,
    roughness: 0.64,
    metalness: 0,
    clearcoat: 0.24,
    clearcoatRoughness: 0.42,
    envMapIntensity: 0.48,
  });

  const strawMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x2c6a4c,
    roughness: 0.33,
    metalness: 0,
    clearcoat: 0.72,
    clearcoatRoughness: 0.18,
    envMapIntensity: 0.86,
  });

  const iceMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xe9f6ec,
    roughness: 0.2,
    metalness: 0,
    transparent: true,
    opacity: 0.55,
    clearcoat: 0.8,
    clearcoatRoughness: 0.14,
    envMapIntensity: 1.05,
  });

  const glass = new THREE.Mesh(makeGlassGeometry(segments), glassMaterial);
  glass.renderOrder = 3;
  cup.add(glass);

  const drink = new THREE.Mesh(makeDrinkGeometry(segments), drinkMaterial);
  drink.renderOrder = 1;
  cup.add(drink);

  const latteTop = new THREE.Mesh(new THREE.CircleGeometry(1.22, circleSegments(segments)), latteMaterial);
  latteTop.rotation.x = -Math.PI / 2;
  latteTop.position.y = 1.23;
  latteTop.renderOrder = 2;
  cup.add(latteTop);

  const brandBand = new THREE.Mesh(
    new THREE.CylinderGeometry(1.10, 1.00, 0.78, segments, 1, true),
    brandBandMaterial,
  );
  brandBand.position.y = -0.42;
  brandBand.renderOrder = 2;
  cup.add(brandBand);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.20, 0.024, 12, segments),
    new THREE.MeshPhysicalMaterial({
      color: 0xdff0e2,
      roughness: 0.16,
      metalness: 0,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.15,
    }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 1.52;
  cup.add(rim);

  const strawCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.18, 1.14, 0.16),
    new THREE.Vector3(0.20, 1.42, 0.18),
    new THREE.Vector3(0.31, 1.73, 0.22),
    new THREE.Vector3(0.44, 2.03, 0.25),
  ]);
  const straw = new THREE.Mesh(new THREE.TubeGeometry(strawCurve, 48, 0.062, 14, false), strawMaterial);
  straw.renderOrder = 3;
  cup.add(straw);
  const strawCap = new THREE.Mesh(new THREE.SphereGeometry(0.062, 18, 12), strawMaterial);
  strawCap.position.set(0.44, 2.03, 0.25);
  cup.add(strawCap);

  const icePositions = [
    [0.52, 1.33, 0.16, 0.26],
    [-0.38, 1.36, 0.34, 0.24],
    [0.14, 1.40, -0.44, 0.28],
    [-0.18, 1.44, -0.12, 0.22],
    [0.68, 1.45, -0.30, 0.21],
    [-0.62, 1.47, -0.20, 0.23],
    [0.10, 1.49, 0.51, 0.2],
  ];
  icePositions.forEach(([x, y, z, size], index) => {
    const ice = makeIceCube(size, iceMaterial);
    ice.position.set(x, y, z);
    ice.rotation.set(index * 0.42, index * 0.58, index * 0.31);
    ice.renderOrder = 4;
    cup.add(ice);
  });

  cup.rotation.set(0.06, 0.12, -0.05);
  scene.add(cup);

  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
    opacity: 0.72,
    toneMapped: false,
  });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.1), shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0.08, -1.85, 0);
  scene.add(shadow);

  scene.add(new THREE.HemisphereLight(0xfafff5, 0x82917d, 0.85));
  const keyLight = new THREE.DirectionalLight(0xfffdf5, 1.85);
  keyLight.position.set(-4, 6, 5);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xd9ead9, 0.6);
  fillLight.position.set(4, 1.7, 3);
  scene.add(fillLight);
  const backLight = new THREE.DirectionalLight(0xffffff, 0.95);
  backLight.position.set(1, 4, -4);
  scene.add(backLight);
  const rimLight = new THREE.DirectionalLight(0xdff1dc, 0.48);
  rimLight.position.set(-1, 2, -5);
  scene.add(rimLight);

  let animationFrame = 0;
  let previousTime = performance.now();
  let dragging = false;
  let visible = true;
  let previousPointer = { x: 0, y: 0 };
  let lastInteraction = performance.now();
  const targetRotation = { x: cup.rotation.x, y: cup.rotation.y };

  const resize = () => {
    const bounds = container.getBoundingClientRect();
    const width = Math.round(bounds.width);
    const height = Math.round(bounds.height);
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    cup.scale.setScalar(width < 480 ? 0.94 : 1);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    dragging = true;
    previousPointer = { x: event.clientX, y: event.clientY };
    lastInteraction = performance.now();
    renderer.domElement.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!dragging) return;
    const deltaX = event.clientX - previousPointer.x;
    const deltaY = event.clientY - previousPointer.y;
    targetRotation.y += deltaX * 0.012;
    targetRotation.x = THREE.MathUtils.clamp(targetRotation.x + deltaY * 0.006, -0.42, 0.46);
    previousPointer = { x: event.clientX, y: event.clientY };
    lastInteraction = performance.now();
  };

  const onPointerUp = (event) => {
    dragging = false;
    if (renderer.domElement.hasPointerCapture(event.pointerId)) {
      renderer.domElement.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (event) => {
    const directions = {
      ArrowLeft: [0, -0.18],
      ArrowRight: [0, 0.18],
      ArrowUp: [-0.12, 0],
      ArrowDown: [0.12, 0],
    };
    if (!directions[event.key]) return;
    event.preventDefault();
    const [x, y] = directions[event.key];
    targetRotation.x = THREE.MathUtils.clamp(targetRotation.x + x, -0.42, 0.46);
    targetRotation.y += y;
    lastInteraction = performance.now();
  };

  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointercancel", onPointerUp);
  renderer.domElement.addEventListener("keydown", onKeyDown);

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }, { threshold: 0.02 });
  visibilityObserver.observe(container);

  const render = (time) => {
    animationFrame = requestAnimationFrame(render);
    const delta = Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    if (!visible || document.hidden) return;

    if (!reducedMotion && !dragging && time - lastInteraction > 4200) {
      targetRotation.y += delta * 0.1;
    }

    const easing = reducedMotion ? 1 : 1 - Math.pow(0.0005, delta);
    cup.rotation.x += (targetRotation.x - cup.rotation.x) * easing;
    cup.rotation.y += (targetRotation.y - cup.rotation.y) * easing;
    if (!reducedMotion) {
      cup.position.y = Math.sin(time * 0.0011) * 0.038;
      latteTop.position.y = 1.23 + Math.sin(time * 0.0014) * 0.006;
    }
    renderer.render(scene, camera);
  };

  renderer.render(scene, camera);
  animationFrame = requestAnimationFrame(render);
  container.classList.add("webgl-ready");

  const dispose = () => {
    cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
    latteArtTexture.dispose();
    drinkSideTexture.dispose();
    brandBandTexture.dispose();
    shadowTexture.dispose();
    environmentMap.dispose();
    renderer.dispose();
  };

  window.addEventListener("pagehide", dispose, { once: true });
  return { dispose, renderer };
}

function circleSegments(segments) {
  return segments < 150 ? 72 : 96;
}
