"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { VideoItem } from "@/app/projects/ProjectsClient";
import styles from "./ProjectsGrid.module.css";

const BASE_WIDTH = 400;
const SMALL_HEIGHT = 330;
const LARGE_HEIGHT = 500;
const ITEM_GAP = 65;
const CELL_WIDTH = BASE_WIDTH + ITEM_GAP;
const CELL_HEIGHT = Math.max(SMALL_HEIGHT, LARGE_HEIGHT) + ITEM_GAP;
const DRAG_EASE = 0.075;
const MOMENTUM_FACTOR = 200;
const BUFFER = 3;
const DRAG_THRESHOLD = 5;
const UPDATE_DIST_THRESHOLD = 100;
const UPDATE_TIME_THRESHOLD_MS = 120;

function getColumnsForWidth(width: number): number {
  if (width < 640) return 2;
  if (width < 1024) return 3;
  return 4;
}

function getPoster(item: VideoItem): string {
  return item.poster ?? item.thumbnail ?? item.picture ?? item.thumb ?? "";
}

type ProjectsGridProps = {
  items: VideoItem[];
  onOpenVideo: (item: VideoItem) => void;
};

export default function ProjectsGrid({
  items,
  onOpenVideo,
}: ProjectsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const yearParam = searchParams.get("year") ?? "all";
  const gridWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [columns, setColumns] = useState(4);
  const [isDragging, setIsDragging] = useState(false);
  const [yearsOpen, setYearsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const currentList = useMemo(() => {
    if (yearParam === "all" || !yearParam) return items;
    const y = parseInt(yearParam, 10);
    if (Number.isNaN(y)) return items;
    return items.filter((v) => v.year === y);
  }, [items, yearParam]);

  const years = useMemo(() => {
    const set = new Set<number>();
    items.forEach((v) => {
      if (v.year != null) set.add(v.year);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [items]);

  const setYear = useCallback(
    (year: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (year === "all") next.delete("year");
      else next.set("year", year);
      router.replace(`/projects?${next.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const visibleItemsRef = useRef<Set<string>>(new Set());
  const currentXRef = useRef(0);
  const currentYRef = useRef(0);
  const targetXRef = useRef(0);
  const targetYRef = useRef(0);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const lastUpdateRef = useRef(0);
  const isDraggingRef = useRef(false);
  const mouseHasMovedRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const lastDragRef = useRef(0);
  const velXRef = useRef(0);
  const velYRef = useRef(0);
  const mountedRef = useRef(true);
  const rafIdRef = useRef<number>(0);
  const hasNudgedRef = useRef(false);
  const nudgeStartTimeoutRef = useRef<number | null>(null);
  const nudgeBackTimeoutRef = useRef<number | null>(null);

  const getItemSize = useCallback(
    (row: number, col: number) => {
      const idx = (row * columns + col) % 2;
      return idx === 0
        ? { width: BASE_WIDTH, height: SMALL_HEIGHT }
        : { width: BASE_WIDTH, height: LARGE_HEIGHT };
    },
    [columns],
  );

  const getItemId = useCallback((col: number, row: number) => {
    return `${col},${row}`;
  }, []);

  const updateVisibleItems = useCallback(() => {
    const canvas = canvasRef.current;
    const container = gridWrapRef.current;
    if (!canvas || !container || currentList.length === 0) return;

    const itemCount = currentList.length;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const vw = cw * (1 + BUFFER);
    const vh = ch * (1 + BUFFER);
    const currentX = currentXRef.current;
    const currentY = currentYRef.current;

    const startCol = Math.floor((-currentX - vw / 2) / CELL_WIDTH);
    const endCol = Math.ceil((-currentX + vw * 1.5) / CELL_WIDTH);
    const startRow = Math.floor((-currentY - vh / 2) / CELL_HEIGHT);
    const endRow = Math.ceil((-currentY + vh * 1.5) / CELL_HEIGHT);

    const currentSet = new Set<string>();

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const id = getItemId(col, row);
        currentSet.add(id);
        if (visibleItemsRef.current.has(id)) continue;

        const size = getItemSize(row, col);
        const x = col * CELL_WIDTH;
        const y = row * CELL_HEIGHT;
        const idx = Math.abs((row * columns + col) % itemCount);
        const proj = currentList[idx];
        const poster = getPoster(proj);
        if (!poster) continue;

        const itemEl = document.createElement("div");
        itemEl.className = styles.item;
        itemEl.setAttribute("data-id", id);
        itemEl.style.width = `${size.width}px`;
        itemEl.style.height = `${size.height}px`;
        itemEl.style.left = `${x}px`;
        itemEl.style.top = `${y}px`;

        const imageContainer = document.createElement("div");
        imageContainer.className = styles.itemImageContainer;
        const img = document.createElement("img");
        img.src = poster;
        img.alt = proj.title ?? "";
        imageContainer.appendChild(img);
        itemEl.appendChild(imageContainer);

        const caption = document.createElement("div");
        caption.className = styles.itemCaption;
        const name = document.createElement("div");
        name.className = styles.itemName;
        name.textContent = proj.title ?? proj.name ?? "Untitled";
        const number = document.createElement("div");
        number.className = styles.itemNumber;
        number.textContent = proj.year != null ? String(proj.year) : "";
        caption.appendChild(name);
        caption.appendChild(number);
        itemEl.appendChild(caption);

        const payload: VideoItem = { ...proj };
        itemEl.addEventListener("click", () => {
          if (mouseHasMovedRef.current || isDraggingRef.current) return;
          onOpenVideo(payload);
        });

        canvas.appendChild(itemEl);
        visibleItemsRef.current.add(id);
      }
    }

    visibleItemsRef.current.forEach((id) => {
      if (!currentSet.has(id)) {
        const el = canvas.querySelector(`[data-id="${id}"]`);
        if (el && el.parentNode === canvas) canvas.removeChild(el);
        visibleItemsRef.current.delete(id);
      }
    });
  }, [currentList, columns, getItemId, getItemSize, onOpenVideo]);

  const resetAndRebuild = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    visibleItemsRef.current.forEach((id) => {
      const el = canvas.querySelector(`[data-id="${id}"]`);
      if (el && el.parentNode === canvas) canvas.removeChild(el);
    });
    visibleItemsRef.current.clear();
    currentXRef.current = 0;
    currentYRef.current = 0;
    targetXRef.current = 0;
    targetYRef.current = 0;
    lastXRef.current = 0;
    lastYRef.current = 0;
    if (canvas) canvas.style.transform = "translate(0,0)";
    updateVisibleItems();
  }, [updateVisibleItems]);

  useEffect(() => {
    mountedRef.current = true;
    setHasMounted(true);
    return () => {
      mountedRef.current = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  useEffect(() => {
    if (!hasMounted || items.length === 0) return;

    if (typeof window !== "undefined") {
      try {
        if (window.sessionStorage.getItem("__PROJECTS_GRID_NUDGED") === "1") {
          hasNudgedRef.current = true;
          return;
        }
      } catch {
        // ignore
      }
    }

    const startId = window.setTimeout(() => {
      if (
        !mountedRef.current ||
        hasNudgedRef.current ||
        isDraggingRef.current
      ) {
        return;
      }

      const initial = targetXRef.current;
      targetXRef.current = initial - 30;

      const backId = window.setTimeout(() => {
        if (!mountedRef.current) return;
        if (!isDraggingRef.current) {
          targetXRef.current = initial;
        }
        hasNudgedRef.current = true;
        try {
          window.sessionStorage.setItem("__PROJECTS_GRID_NUDGED", "1");
        } catch {
          // ignore
        }
      }, 800);

      nudgeBackTimeoutRef.current = backId;
    }, 700);

    nudgeStartTimeoutRef.current = startId;

    return () => {
      if (nudgeStartTimeoutRef.current != null) {
        clearTimeout(nudgeStartTimeoutRef.current);
        nudgeStartTimeoutRef.current = null;
      }
      if (nudgeBackTimeoutRef.current != null) {
        clearTimeout(nudgeBackTimeoutRef.current);
        nudgeBackTimeoutRef.current = null;
      }
    };
  }, [hasMounted, items.length]);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const next = getColumnsForWidth(w);
      setColumns((prev) => (prev !== next ? next : prev));
    };

    // Initialise les colonnes au premier rendu
    onResize();

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    resetAndRebuild();
  }, [yearParam, resetAndRebuild]);

  useEffect(() => {
    if (currentList.length === 0) return;
    updateVisibleItems();
  }, [currentList.length, columns, updateVisibleItems]);

  const animate = useCallback(() => {
    if (!mountedRef.current) return;
    const e = DRAG_EASE;
    currentXRef.current += (targetXRef.current - currentXRef.current) * e;
    currentYRef.current += (targetYRef.current - currentYRef.current) * e;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.transform = `translate(${currentXRef.current}px,${currentYRef.current}px)`;
    }

    const now = Date.now();
    const dist = Math.hypot(
      currentXRef.current - lastXRef.current,
      currentYRef.current - lastYRef.current,
    );
    if (
      dist > UPDATE_DIST_THRESHOLD ||
      now - lastUpdateRef.current > UPDATE_TIME_THRESHOLD_MS
    ) {
      updateVisibleItems();
      lastXRef.current = currentXRef.current;
      lastYRef.current = currentYRef.current;
      lastUpdateRef.current = now;
    }
    rafIdRef.current = requestAnimationFrame(animate);
  }, [updateVisibleItems]);

  useEffect(() => {
    rafIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [animate]);

  const onPointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      isDraggingRef.current = true;
      mouseHasMovedRef.current = false;
      startXRef.current = clientX;
      startYRef.current = clientY;
      lastDragRef.current = Date.now();
      setIsDragging(true);
    },
    [],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - startXRef.current;
      const dy = e.clientY - startYRef.current;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        mouseHasMovedRef.current = true;
      }
      const now = Date.now();
      const dt = Math.max(10, now - lastDragRef.current);
      lastDragRef.current = now;
      velXRef.current = dx / dt;
      velYRef.current = dy / dt;
      targetXRef.current += dx;
      targetYRef.current += dy;
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
    };
    const onMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      if (Math.abs(velXRef.current) > 0.1 || Math.abs(velYRef.current) > 0.1) {
        targetXRef.current += velXRef.current * MOMENTUM_FACTOR;
        targetYRef.current += velYRef.current * MOMENTUM_FACTOR;
      }
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.touches[0].clientX - startXRef.current;
      const dy = e.touches[0].clientY - startYRef.current;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        mouseHasMovedRef.current = true;
      }
      targetXRef.current += dx;
      targetYRef.current += dy;
      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
    };
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const yearMenuContent = (
    <div
      className={`${styles.yearMenu} ${yearsOpen ? styles.open : ""}`}
      role="region"
      aria-label="Filtre par année"
    >
      <button
        type="button"
        className={styles.yearToggle}
        onClick={() => setYearsOpen((o) => !o)}
        aria-expanded={yearsOpen}
        aria-controls="years-panel"
        id="years-toggle"
      >
        <span>+ YEARS</span>
        <span className={styles.yearChev} aria-hidden />
      </button>
      <div
        id="years-panel"
        className={styles.yearsPanel}
        role="panel"
        aria-labelledby="years-toggle"
      >
        <div className={styles.years}>
          <button
            type="button"
            className={styles.yearBtn}
            onClick={() => {
              setYear("all");
              setYearsOpen(false);
            }}
            aria-pressed={yearParam === "all" || !yearParam}
          >
            All
          </button>
          {years.map((y) => (
            <button
              key={y}
              type="button"
              className={styles.yearBtn}
              onClick={() => {
                setYear(String(y));
                setYearsOpen(false);
              }}
              aria-pressed={yearParam === String(y)}
            >
              {y}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.yearsClose}
          onClick={() => setYearsOpen(false)}
        >
          Close
        </button>
      </div>
    </div>
  );

  if (items.length === 0) {
    return (
      <div className={`${styles.root} ${hasMounted ? styles.rootVisible : ""}`}>
        <div className={styles.grain} aria-hidden />
        <div className={styles.vignetteContainer} aria-hidden>
          <div className={styles.vignette} />
          <div className={styles.vignetteStrong} />
          <div className={styles.vignetteExtreme} />
        </div>
        {yearMenuContent}
        <div
          className={styles.gridWrap}
          style={{
            cursor: "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ fontSize: 14, fontFamily: "monospace", color: "#888" }}>
            Aucun projet pour le moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.root} ${hasMounted ? styles.rootVisible : ""}`}>
      <div className={styles.grain} aria-hidden />
      <div className={styles.vignetteContainer} aria-hidden>
        <div className={styles.vignette} />
        <div className={styles.vignetteStrong} />
        <div className={styles.vignetteExtreme} />
      </div>
      {yearMenuContent}
      <div
        ref={gridWrapRef}
        className={`${styles.gridWrap} ${isDragging ? styles.grabbing : ""}`}
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
        role="presentation"
      >
        <div ref={canvasRef} className={styles.canvas} />
      </div>
    </div>
  );
}
