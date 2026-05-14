// ================================================================
//  JAMAL RAZA — Premium Portfolio Engine
//  Three.js · GSAP · Lenis · Custom Cursor · Magnetic Buttons
// ================================================================

import * as THREE from 'three';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ================================================================
// 1. LOADING SCREEN
// ================================================================
const loader = document.getElementById('loader');
window.addEventListener('load', () => {
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';

    // Reveal hero elements with CSS transitions
    document.querySelectorAll('.hero .reveal-up').forEach((el) => {
      el.classList.add('visible');
    });

    // Init observer for sections below the fold
    initReveal();

    // Start hero parallax AFTER reveal so GSAP reads opacity:1 as start
    setTimeout(() => {
      gsap.to('.hero-text', {
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
        opacity: 0,
        y: -60,
      });



      gsap.to('.hero-scroll', {
        scrollTrigger: {
          trigger: '.hero',
          start: '20% top',
          end: '40% top',
          scrub: true,
        },
        opacity: 0,
      });
    }, 800);
  }, 2200);
});

// ================================================================
// 2. LENIS SMOOTH SCROLL
// ================================================================
const lenis = new Lenis({
  duration: 1.3,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  smoothTouch: false,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ================================================================
// 3. CUSTOM CURSOR
// ================================================================
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let cursorX = 0, cursorY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;
});

function animateCursor() {
  followerX += (cursorX - followerX) * 0.12;
  followerY += (cursorY - followerY) * 0.12;

  cursor.style.left = `${cursorX}px`;
  cursor.style.top = `${cursorY}px`;
  follower.style.left = `${followerX}px`;
  follower.style.top = `${followerY}px`;

  requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor hover states
document.querySelectorAll('a, button, .project-card, .gallery-cell, .skill-pill').forEach((el) => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('active');
    follower.classList.add('active');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('active');
    follower.classList.remove('active');
  });
});

// ================================================================
// 4. MAGNETIC BUTTONS
// ================================================================
document.querySelectorAll('.magnetic').forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, {
      x: x * 0.25,
      y: y * 0.25,
      duration: 0.4,
      ease: 'power2.out',
    });
  });

  el.addEventListener('mouseleave', () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)',
    });
  });
});

// ================================================================
// 5. NAVIGATION
// ================================================================
const nav = document.getElementById('nav');
const hamburger = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('mobile-menu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

mobileMenu.querySelectorAll('.mobile-link').forEach((link) => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ================================================================
// 6. THREE.JS — Minimal Particle Field
// ================================================================
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 6;

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// — Particle System (Stars & Lights) —
const PARTICLE_COUNT = 700;
const positions = new Float32Array(PARTICLE_COUNT * 3);
const sizes = new Float32Array(PARTICLE_COUNT);
const randoms = new Float32Array(PARTICLE_COUNT);

for (let i = 0; i < PARTICLE_COUNT; i++) {
  // Distribute across a large sphere
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = 4 + Math.random() * 20;

  positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = r * Math.cos(phi);
  
  // Mix of mostly tiny stars, very few medium ones
  sizes[i] = Math.random() > 0.98 ? Math.random() * 1.5 + 0.5 : Math.random() * 0.4 + 0.1;
  randoms[i] = Math.random();
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
particleGeo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

const particleMat = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color(0xffffff) }, // White stars
    uColor2: { value: new THREE.Color(0x4d7acc) }, // Softer blue
    uScroll: { value: 0 },
  },
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  vertexShader: `
    attribute float aSize;
    attribute float aRandom;
    uniform float uTime;
    uniform float uScroll;
    varying float vAlpha;
    varying float vMix;
    varying float vRandom;

    void main() {
      vRandom = aRandom;
      vec3 pos = position;

      // Extremely gentle drift
      pos.x += sin(uTime * 0.05 + pos.y * 0.2) * 0.05;
      pos.y += cos(uTime * 0.04 + pos.z * 0.1) * 0.05;

      // Scroll parallax
      pos.z += uScroll * 1.5;
      pos.y += uScroll * 1.0;

      vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = aSize * (100.0 / -mvPos.z);
      gl_Position = projectionMatrix * mvPos;

      float dist = length(pos) / 20.0;
      vAlpha = smoothstep(1.0, 0.2, dist);
      vMix = smoothstep(6.0, 15.0, length(pos));
    }
  `,
  fragmentShader: `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uTime;
    varying float vAlpha;
    varying float vMix;
    varying float vRandom;

    void main() {
      // Create soft circle
      float d = length(gl_PointCoord - 0.5) * 2.0;
      float circle = 1.0 - smoothstep(0.0, 1.0, d);
      circle = pow(circle, 3.0); // Make it a sharper point, less glow

      // Very subtle twinkle effect
      float twinkle = sin(uTime * 1.5 + vRandom * 10.0) * 0.5 + 0.5;
      
      // Extremely low opacity for a highly minimal look
      float finalAlpha = circle * vAlpha * (0.1 + 0.3 * twinkle);

      vec3 color = mix(uColor1, uColor2, vMix * vRandom);
      gl_FragColor = vec4(color, finalAlpha);
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// — Single subtle orbital ring —
const ringGeo = new THREE.TorusGeometry(4.0, 0.003, 8, 256);
const ringMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.03,
});
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = Math.PI * 0.5;
scene.add(ring);

// Second ring — barely visible
const ring2 = new THREE.Mesh(
  new THREE.TorusGeometry(5.5, 0.002, 8, 200),
  new THREE.MeshBasicMaterial({ color: 0x4d9eff, transparent: true, opacity: 0.015 })
);
ring2.rotation.x = Math.PI * 0.35;
ring2.rotation.z = Math.PI * 0.15;
scene.add(ring2);

// — Mouse tracking —
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
document.addEventListener('mousemove', (e) => {
  mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
});

// — Scroll progress —
let scrollProgress = 0;
window.addEventListener('scroll', () => {
  scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
});

// — Timer (using performance.now instead of deprecated THREE.Clock) —
const startTime = performance.now();

function tick() {
  requestAnimationFrame(tick);

  const elapsed = (performance.now() - startTime) * 0.001;

  // Smooth mouse
  mouse.x += (mouse.tx - mouse.x) * 0.03;
  mouse.y += (mouse.ty - mouse.y) * 0.03;

  // Update uniforms
  particleMat.uniforms.uTime.value = elapsed;
  particleMat.uniforms.uScroll.value = scrollProgress;

  // Rotate particles slowly
  particles.rotation.y = elapsed * 0.015 + mouse.x * 0.06;
  particles.rotation.x = elapsed * 0.008 + mouse.y * 0.04;

  // Rings
  ring.rotation.z = elapsed * 0.04;
  ring2.rotation.z = -elapsed * 0.025;
  ring2.rotation.x = Math.PI * 0.35 + Math.sin(elapsed * 0.1) * 0.05;

  // Fade rings with scroll
  const fade = Math.max(0, 1 - scrollProgress * 5);
  ringMat.opacity = 0.03 * fade;
  ring2.material.opacity = 0.015 * fade;

  // Camera subtle sway
  camera.position.x = mouse.x * 0.2;
  camera.position.y = mouse.y * 0.15;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

tick();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ================================================================
// 7. GSAP SCROLL ANIMATIONS
// ================================================================

// Hero parallax — now handled inside loader callback to avoid opacity conflicts
// Project cards
document.querySelectorAll('.project-card').forEach((card) => {
  gsap.from(card.querySelector('.project-image'), {
    scrollTrigger: {
      trigger: card,
      start: 'top bottom-=100',
      toggleActions: 'play none none reverse',
    },
    scale: 0.92,
    opacity: 0,
    duration: 1.2,
    ease: 'power4.out',
  });

  gsap.from(card.querySelector('.project-meta'), {
    scrollTrigger: {
      trigger: card,
      start: 'top bottom-=80',
      toggleActions: 'play none none reverse',
    },
    y: 40,
    opacity: 0,
    duration: 1,
    delay: 0.15,
    ease: 'power4.out',
  });
});

// Timeline items
document.querySelectorAll('.timeline-item').forEach((item, i) => {
  gsap.from(item, {
    scrollTrigger: {
      trigger: item,
      start: 'top bottom-=50',
    },
    x: -50,
    opacity: 0,
    duration: 0.9,
    delay: i * 0.08,
    ease: 'power4.out',
  });
});

// Gallery cells
document.querySelectorAll('.gallery-cell').forEach((cell, i) => {
  gsap.from(cell, {
    scrollTrigger: {
      trigger: cell,
      start: 'top bottom-=60',
    },
    scale: 0.9,
    opacity: 0,
    duration: 0.8,
    delay: i * 0.06,
    ease: 'power3.out',
  });
});

// ================================================================
// 8. INTERSECTION OBSERVER REVEALS
// ================================================================
function initReveal() {
  const els = document.querySelectorAll('.reveal-up');
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => obs.observe(el));
}

// ================================================================
// 9. SMOOTH SCROLL ANCHOR LINKS
// ================================================================
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      lenis.scrollTo(target, { offset: -80, duration: 1.4 });
    }
  });
});

console.log('✦ Jamal Raza — Premium Portfolio Loaded');
 
