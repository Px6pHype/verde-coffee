import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

function seededRandom(seed = 42) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function makePaperTextures(renderer) {
  const size = 512;
  const colorCanvas = document.createElement("canvas");
  const bumpCanvas = document.createElement("canvas");
  colorCanvas.width = colorCanvas.height = size;
  bumpCanvas.width = bumpCanvas.height = size;
  const colorContext = colorCanvas.getContext("2d");
  const bumpContext = bumpCanvas.getContext("2d");
  const colorImage = colorContext.createImageData(size, size);
  const bumpImage = bumpContext.createImageData(size, size);
  const random = seededRandom(17);

  for (let index = 0; index < colorImage.data.length; index += 4) {
    const grain = Math.floor(random() * 6);
    const height = 126 + Math.floor(random() * 7);
    colorImage.data[index] = 239 + grain;
    colorImage.data[index + 1] = 240 + grain;
    colorImage.data[index + 2] = 233 + grain;
    colorImage.data[index + 3] = 255;
    bumpImage.data[index] = height;
    bumpImage.data[index + 1] = height;
    bumpImage.data[index + 2] = height;
    bumpImage.data[index + 3] = 255;
  }

  colorContext.putImageData(colorImage, 0, 0);
  bumpContext.putImageData(bumpImage, 0, 0);
  const color = new THREE.CanvasTexture(colorCanvas);
  const bump = new THREE.CanvasTexture(bumpCanvas);

  for (const texture of [color, bump]) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 5);
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 16);
  }
  color.colorSpace = THREE.SRGBColorSpace;
  return { color, bump };
}

function drawLeaf(context, x, y, scale) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.strokeStyle = "#f7f8f0";
  context.lineWidth = 2.6;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(0, 38);
  context.bezierCurveTo(-38, 18, -26, -30, 24, -44);
  context.bezierCurveTo(29, -9, 20, 27, 0, 38);
  context.moveTo(-9, 51);
  context.bezierCurveTo(-3, 16, 8, -9, 24, -34);
  context.stroke();
  context.restore();
}

function makeSleeveTexture(renderer, textureScale = 2) {
  // Текстура 3–4K: координаты ниже заданы в логическом размере 2048 × 1024.
  const canvas = document.createElement("canvas");
  canvas.width = 2048 * textureScale;
  canvas.height = 1024 * textureScale;
  const context = canvas.getContext("2d", { alpha: false });
  context.scale(textureScale, textureScale);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  const random = seededRandom(71);

  const base = context.createLinearGradient(0, 0, 0, 1024);
  base.addColorStop(0, "#1c533e");
  base.addColorStop(0.5, "#174d3a");
  base.addColorStop(1, "#194b38");
  context.fillStyle = base;
  context.fillRect(0, 0, 2048, 1024);

  // Едва заметные бумажные волокна не влияют на рельеф и не искажают печать.
  for (let index = 0; index < 21000; index += 1) {
    const light = random() > 0.48;
    context.fillStyle = light ? "rgba(239,246,233,.022)" : "rgba(0,22,13,.026)";
    context.fillRect(random() * 2048, random() * 1024, random() * 1.4 + 0.25, random() * 4 + 0.5);
  }

  // Векторная по форме печать повторяется на двух сторонах стакана.
  for (const center of [512, 1536]) {
    context.textAlign = "center";
    context.textBaseline = "alphabetic";
    drawLeaf(context, center, 311, 1.22);
    context.fillStyle = "#fafbf4";
    context.font = "700 112px 'Inter Variable', Arial, sans-serif";
    context.fillText("VERDE", center, 530);
    context.fillStyle = "rgba(250,251,244,.94)";
    context.font = "600 20px 'Inter Variable', Arial, sans-serif";
    context.fillText("C O F F E E   &   C A L M", center, 583);
    context.fillStyle = "rgba(239,244,234,.72)";
    context.font = "italic 21px 'Playfair Display Variable', Georgia, serif";
    context.fillText("your green moment", center, 635);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.offset.x = 0.25;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 16);
  renderer.initTexture(texture);
  return texture;
}

function makeMicroBumpTexture(renderer) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d");
  const image = context.createImageData(256, 256);
  const random = seededRandom(113);
  for (let index = 0; index < image.data.length; index += 4) {
    const value = 126 + Math.floor(random() * 5);
    image.data[index] = value;
    image.data[index + 1] = value;
    image.data[index + 2] = value;
    image.data[index + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 2);
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  return texture;
}

function makeShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(256, 256, 7, 256, 256, 250);
  gradient.addColorStop(0, "rgba(15,45,30,.38)");
  gradient.addColorStop(0.28, "rgba(15,45,30,.22)");
  gradient.addColorStop(0.63, "rgba(15,45,30,.075)");
  gradient.addColorStop(1, "rgba(15,45,30,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 512);
  return new THREE.CanvasTexture(canvas);
}

function makeBodyGeometry(segments) {
  const profile = [
    [0, -1.75], [0.71, -1.75], [0.78, -1.74], [0.82, -1.70],
    [0.832, -1.62], [0.845, -1.49], [0.895, -0.98], [0.963, -0.35],
    [1.03, 0.29], [1.096, 0.96], [1.137, 1.39], [1.15, 1.48],
    [1.15, 1.505], [1.125, 1.505], [1.115, 1.45], [0, 1.44],
  ].map(([radius, height]) => new THREE.Vector2(radius, height));
  return new THREE.LatheGeometry(profile, segments);
}

function makeLidGeometry(segments) {
  const profile = [
    [0, -0.09], [1.16, -0.09], [1.215, -0.105], [1.265, -0.08],
    [1.281, -0.045], [1.281, 0.015], [1.266, 0.047], [1.224, 0.058],
    [1.214, 0.112], [1.195, 0.143], [1.161, 0.165], [1.145, 0.203],
    [1.09, 0.219], [0.96, 0.219], [0.94, 0.20], [0.94, 0.174], [0, 0.174],
  ].map(([radius, height]) => new THREE.Vector2(radius, height));
  return new THREE.LatheGeometry(profile, segments);
}

export function createCupScene(container, { reducedMotion = false } = {}) {
  // Мобильный профиль: меньше полигонов и текстур, но тот же дизайн и качество печати.
  const isMobileViewport = window.matchMedia("(max-width: 760px)").matches;
  const segments = isMobileViewport ? 112 : 192;
  const circleSegments = isMobileViewport ? 40 : 64;
  const textureScale = isMobileViewport ? 1.5 : 2;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
  camera.position.set(0, 1.65, 8.9);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: isMobileViewport ? "default" : "high-performance",
  });
  // На телефоне ограничиваем разрешение рендера ради плавных 60 FPS.
  const pixelRatioFloor = isMobileViewport ? 1.25 : 1.5;
  const pixelRatioCeiling = isMobileViewport ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, pixelRatioFloor), pixelRatioCeiling));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.setAttribute("aria-label", "Интерактивный 3D-стакан VERDE. Перетаскивайте мышью или пальцем, либо используйте стрелки на клавиатуре.");
  container.append(renderer.domElement);

  // Студийное image-based lighting создаёт естественные блики без внешних HDR-файлов.
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentMap = pmrem.fromScene(environment, 0.035).texture;
  scene.environment = environmentMap;
  scene.environmentIntensity = 0.62;
  environment.dispose();
  pmrem.dispose();

  const paperTextures = makePaperTextures(renderer);
  const sleeveTexture = makeSleeveTexture(renderer, textureScale);
  const microBumpTexture = makeMicroBumpTexture(renderer);
  const shadowTexture = makeShadowTexture();
  const cup = new THREE.Group();

  const paperMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfaf9f3,
    map: paperTextures.color,
    bumpMap: paperTextures.bump,
    bumpScale: 0.007,
    roughness: 0.88,
    metalness: 0,
    clearcoat: 0.035,
    clearcoatRoughness: 0.8,
    envMapIntensity: 0.65,
  });
  const lidMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf3f3ec,
    roughness: 0.32,
    metalness: 0,
    clearcoat: 0.22,
    clearcoatRoughness: 0.3,
    specularIntensity: 0.55,
    envMapIntensity: 0.9,
  });
  const rimMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdcded5,
    roughness: 0.39,
    clearcoat: 0.12,
    clearcoatRoughness: 0.4,
  });
  const sleeveMaterial = new THREE.MeshPhysicalMaterial({
    map: sleeveTexture,
    // Отдельная бесцветная микрофактура: логотип больше не используется как bump-map.
    bumpMap: microBumpTexture,
    bumpScale: 0.003,
    roughness: 0.84,
    metalness: 0,
    sheen: 0.09,
    sheenRoughness: 0.9,
    sheenColor: new THREE.Color(0x456c54),
    envMapIntensity: 0.48,
  });

  const body = new THREE.Mesh(makeBodyGeometry(segments), paperMaterial);
  cup.add(body);

  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(1.079, 0.937, 1.18, segments, 4, true), sleeveMaterial);
  sleeve.position.y = -0.18;
  cup.add(sleeve);

  // Тонкие края гильзы добавляют толщину бумаги, не создавая лишних полос.
  const sleeveTopEdge = new THREE.Mesh(new THREE.TorusGeometry(1.077, 0.008, 8, segments), sleeveMaterial);
  sleeveTopEdge.rotation.x = Math.PI / 2;
  sleeveTopEdge.position.y = 0.41;
  cup.add(sleeveTopEdge);
  const sleeveBottomEdge = new THREE.Mesh(new THREE.TorusGeometry(0.937, 0.008, 8, segments), sleeveMaterial);
  sleeveBottomEdge.rotation.x = Math.PI / 2;
  sleeveBottomEdge.position.y = -0.77;
  cup.add(sleeveBottomEdge);

  const lid = new THREE.Mesh(makeLidGeometry(segments), lidMaterial);
  lid.position.y = 1.535;
  cup.add(lid);

  const lowerLidRim = new THREE.Mesh(new THREE.TorusGeometry(1.174, 0.034, 16, segments), rimMaterial);
  lowerLidRim.rotation.x = Math.PI / 2;
  lowerLidRim.position.y = 1.432;
  cup.add(lowerLidRim);

  const lidGroove = new THREE.Mesh(new THREE.TorusGeometry(1.112, 0.014, 12, segments), rimMaterial);
  lidGroove.rotation.x = Math.PI / 2;
  lidGroove.position.y = 1.695;
  cup.add(lidGroove);

  const innerGroove = new THREE.Mesh(new THREE.TorusGeometry(0.913, 0.012, 12, segments), rimMaterial);
  innerGroove.rotation.x = Math.PI / 2;
  innerGroove.position.y = 1.717;
  cup.add(innerGroove);

  const sippingHoleMaterial = new THREE.MeshStandardMaterial({ color: 0x4c574e, roughness: 0.7 });
  const sippingHole = new THREE.Mesh(new THREE.CircleGeometry(0.16, circleSegments), sippingHoleMaterial);
  sippingHole.rotation.x = -Math.PI / 2;
  sippingHole.scale.set(1.52, 0.72, 1);
  sippingHole.position.set(0, 1.729, 0.65);
  cup.add(sippingHole);

  const sippingRim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.021, 12, 64), lidMaterial);
  sippingRim.rotation.x = Math.PI / 2;
  sippingRim.scale.set(1.52, 0.72, 1);
  sippingRim.position.set(0, 1.744, 0.65);
  cup.add(sippingRim);

  const bottom = new THREE.Mesh(new THREE.TorusGeometry(0.783, 0.025, 16, segments), rimMaterial);
  bottom.rotation.x = Math.PI / 2;
  bottom.position.y = -1.73;
  cup.add(bottom);

  cup.rotation.set(0.055, 0.1, -0.065);
  scene.add(cup);

  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
    opacity: 0.82,
    toneMapped: false,
  });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 3.3), shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0.1, -1.89, 0);
  scene.add(shadow);
  const contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 1.45), shadowMaterial.clone());
  contactShadow.material.opacity = 0.52;
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.set(0, -1.882, 0.02);
  scene.add(contactShadow);

  scene.add(new THREE.HemisphereLight(0xf9fff5, 0x82917d, 0.9));
  const keyLight = new THREE.DirectionalLight(0xfffdf5, 2.0);
  keyLight.position.set(-4, 6, 5);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xd6ead8, 0.65);
  fillLight.position.set(4, 1.5, 3);
  scene.add(fillLight);
  const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
  backLight.position.set(1, 4, -4);
  scene.add(backLight);

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
    cup.scale.setScalar(width < 480 ? 0.92 : 1);
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
    targetRotation.x = THREE.MathUtils.clamp(targetRotation.x + deltaY * 0.006, -0.45, 0.48);
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
    const directions = { ArrowLeft: [0, -0.18], ArrowRight: [0, 0.18], ArrowUp: [-0.12, 0], ArrowDown: [0.12, 0] };
    if (!directions[event.key]) return;
    event.preventDefault();
    const [x, y] = directions[event.key];
    targetRotation.x = THREE.MathUtils.clamp(targetRotation.x + x, -0.45, 0.48);
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

    if (!reducedMotion && !dragging && time - lastInteraction > 3800) {
      targetRotation.y += delta * 0.12;
    }

    const easing = reducedMotion ? 1 : 1 - Math.pow(0.0005, delta);
    cup.rotation.x += (targetRotation.x - cup.rotation.x) * easing;
    cup.rotation.y += (targetRotation.y - cup.rotation.y) * easing;
    if (!reducedMotion) cup.position.y = Math.sin(time * 0.0011) * 0.045;
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
    paperTextures.color.dispose();
    paperTextures.bump.dispose();
    sleeveTexture.dispose();
    microBumpTexture.dispose();
    shadowTexture.dispose();
    environmentMap.dispose();
    renderer.dispose();
  };

  window.addEventListener("pagehide", dispose, { once: true });
  return { dispose, renderer };
}
