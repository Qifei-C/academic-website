"use client";

import * as d3 from "d3-geo";
import * as topojson from "topojson-client";
import { useEffect, useRef } from "react";

type Visitor = { city: string; country: string; lat: number; lng: number; count: number };
type DotPoint = {
  lon: number;
  lat: number;
  x: number;
  y: number;
  value: number;
  color: string;
};

const WORLD_DATA_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const VISITORS_URL = "/assets/data/visitors.json";

const LIGHT_BASE = "#d5d9e0"; // 更浅的灰，用作亮色基底
const DARK_BASE = "#e5e7eb";  // 暗色主题基底（白系）
const VISIT_END_LIGHT = "#111111"; // 亮色主题高值：深黑
const VISIT_END_DARK = "#ff4d4d";  // 暗色主题高值：红

const TARGET_DOTS_PER_ROW = 140;
const REF_WIDTH = 1200;
const RADIUS_BASE = 2;
const LAT_MIN = -85;
const LAT_MAX = 85;
const LON_MIN = -180;
const LON_MAX = 180;
const RADIUS_DEG = 5;
const SIGMA = 2.5;

const fallbackVisitors: Visitor[] = [
  { city: "Philadelphia", country: "US", lat: 39.9526, lng: -75.1652, count: 20 },
  { city: "Beijing", country: "CN", lat: 39.9042, lng: 116.4074, count: 35 },
  { city: "London", country: "UK", lat: 51.5072, lng: -0.1276, count: 18 },
  { city: "Sydney", country: "AU", lat: -33.8688, lng: 151.2093, count: 12 },
  { city: "Tokyo", country: "JP", lat: 35.6762, lng: 139.6503, count: 25 },
];

function lerpColor(start: string, end: string, t: number) {
  const clamp = Math.min(1, Math.max(0, t));
  const s = start.replace("#", "");
  const e = end.replace("#", "");
  const sr = parseInt(s.slice(0, 2), 16);
  const sg = parseInt(s.slice(2, 4), 16);
  const sb = parseInt(s.slice(4, 6), 16);
  const er = parseInt(e.slice(0, 2), 16);
  const eg = parseInt(e.slice(2, 4), 16);
  const eb = parseInt(e.slice(4, 6), 16);
  const r = Math.round(sr + (er - sr) * clamp);
  const g = Math.round(sg + (eg - sg) * clamp);
  const b = Math.round(sb + (eb - sb) * clamp);
  return `rgb(${r}, ${g}, ${b})`;
}

function project(lon: number, lat: number, width: number, height: number) {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * width;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * height;
  return { x, y };
}

function isDarkTheme() {
  if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
    return true;
  }
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function MapPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landRef = useRef<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>(null);
  const visitorsRef = useRef<Visitor[]>(fallbackVisitors);
  const dotsRef = useRef<DotPoint[]>([]);
  const radiusRef = useRef<number>(RADIUS_BASE);

  const generateDots = (width: number, height: number) => {
    const land = landRef.current;
    if (!land) return { dots: [], radius: RADIUS_BASE };
    const spacingDeg = (360 / TARGET_DOTS_PER_ROW) * (REF_WIDTH / width);
    const radius = Math.max(RADIUS_BASE, width / 1200);
    const res: DotPoint[] = [];
    for (let lat = LAT_MAX; lat >= LAT_MIN; lat -= spacingDeg) {
      for (let lon = LON_MIN; lon <= LON_MAX; lon += spacingDeg) {
        if (!d3.geoContains(land, [lon, lat])) continue;
        const { x, y } = project(lon, lat, width, height);
        res.push({ lon, lat, x, y, value: 0, color: isDarkTheme() ? DARK_BASE : LIGHT_BASE });
      }
    }
    return { dots: res, radius };
  };

  const applyVisitors = (dotList: DotPoint[]) => {
    const visitors = visitorsRef.current;
    if (!dotList.length) return;
    dotList.forEach((d) => (d.value = 0));
    visitors.forEach((v) => {
      const { lat, lng, count } = v;
      dotList.forEach((d) => {
        const dLat = d.lat - lat;
        const dLon = d.lon - lng;
        const dist = Math.sqrt(dLat * dLat + dLon * dLon);
        if (dist < RADIUS_DEG) {
          const weight = count * Math.exp(-(dist * dist) / (2 * SIGMA * SIGMA));
          d.value += weight;
        }
      });
    });
    const maxVal = Math.max(...dotList.map((d) => d.value), 0);
    const base = isDarkTheme() ? DARK_BASE : LIGHT_BASE;
    const end = isDarkTheme() ? VISIT_END_DARK : VISIT_END_LIGHT;
    dotList.forEach((d) => {
      if (d.value <= 0 || maxVal === 0) {
        d.color = base;
      } else {
        const t = d.value / maxVal;
        d.color = lerpColor(base, end, t);
      }
    });
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    dotsRef.current.forEach((d) => {
      ctx.beginPath();
      ctx.fillStyle = d.color;
      ctx.arc(d.x, d.y, radiusRef.current, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  };

  useEffect(() => {
    let mounted = true;

    const resizeAndRedraw = () => {
      const canvas = canvasRef.current;
      const land = landRef.current;
      if (!canvas || !land) return;
      const wrapper = canvas.parentElement;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const { dots: newDots, radius } = generateDots(canvas.width, canvas.height);
      applyVisitors(newDots);
      dotsRef.current = newDots;
      radiusRef.current = radius;
      render();
    };

    const repaintColors = () => {
      if (!dotsRef.current.length) return;
      applyVisitors(dotsRef.current);
      render();
    };

    const loadAll = async () => {
      try {
        const worldRes = await fetch(WORLD_DATA_URL);
        const worldJson = await worldRes.json();
        const landObject =
          (worldJson.objects && (worldJson.objects.land || worldJson.objects.countries)) || worldJson.objects.countries;
        const landFeature = topojson.feature(worldJson, landObject);
        landRef.current = landFeature as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
      } catch (err) {
        console.error("Failed to load world data", err);
      }

      try {
        const visRes = await fetch(VISITORS_URL);
        if (visRes.ok && (visRes.headers.get("content-type") || "").includes("application/json")) {
          visitorsRef.current = await visRes.json();
        } else {
          console.warn("Visitors data fallback to built-in");
          visitorsRef.current = fallbackVisitors;
        }
      } catch (err) {
        console.warn("Visitors data load failed, fallback to built-in", err);
        visitorsRef.current = fallbackVisitors;
      }

      if (mounted) {
        resizeAndRedraw();
      }
    };

    loadAll();
    const onResize = () => resizeAndRedraw();
    window.addEventListener("resize", onResize);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMq = () => repaintColors();
    mq.addEventListener("change", onMq);
    const observer = new MutationObserver(repaintColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      mounted = false;
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", onMq);
      observer.disconnect();
    };
  }, []);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Map</p>
        <h1 className="text-3xl font-semibold tracking-tight">Visitor Star Map</h1>
        <p className="text-sm text-muted-foreground">
          点状世界底图（所有陆地点初始为深/浅色），访客数据仅通过上色已有点，无额外叠加。
        </p>
      </div>

      <div className="visitor-map-wrapper">
        <canvas id="visitor-dot-map" ref={canvasRef} />
      </div>

      <style jsx>{`
        .visitor-map-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: transparent;
        }
        #visitor-dot-map {
          width: 100%;
          height: 100%;
          display: block;
        }
      `}</style>
    </main>
  );
}
