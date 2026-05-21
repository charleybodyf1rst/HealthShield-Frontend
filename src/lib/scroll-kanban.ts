'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Shared horizontal-scroll affordances for kanban boards:
 *  - Click-and-drag on empty background scrolls the row left/right
 *  - Mouse wheel translates vertical scroll to horizontal scroll
 *  - canScrollLeft / canScrollRight flags so the caller can show arrow buttons
 *  - scrollByAmount(delta) for those arrow buttons
 *
 * Drag-to-scroll bails if the mousedown target is inside a card, button, link,
 * menu, or role-attributed element — keeps dnd-kit's per-card sortable drag
 * unaffected.
 *
 * Ported from /dashboard/pipeline/page.tsx (the main Sales Pipeline) so
 * PipelineBoard and NamedPipelineKanban can reuse the same UX.
 */
export function useHorizontalKanbanScroll<T extends HTMLElement>() {
  const scrollRef = useRef<T | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isInteractiveTarget = (el: HTMLElement | null): boolean => {
    if (!el) return false;
    return !!(
      el.closest('[data-card]') ||
      el.closest('button') ||
      el.closest('a') ||
      el.closest('input') ||
      el.closest('textarea') ||
      el.closest('select') ||
      el.closest('[role="menu"]') ||
      el.closest('[role="button"]') ||
      el.closest('[role="dialog"]')
    );
  };

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (isInteractiveTarget(e.target as HTMLElement)) return;
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    startX.current = e.pageX - el.offsetLeft;
    startScrollLeft.current = el.scrollLeft;
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    el.scrollLeft = startScrollLeft.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    const el = scrollRef.current;
    if (el) {
      el.style.cursor = 'grab';
      el.style.userSelect = '';
    }
  }, []);

  const scrollByAmount = useCallback((delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  }, []);

  // Mouse wheel → horizontal scroll, only when no horizontal delta and
  // the container actually overflows.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaX !== 0) return;
      if (e.deltaY === 0) return;
      if (el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Track scroll position to toggle arrow visibility.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    // Re-check after the next frame in case content arrives async.
    const t = setTimeout(update, 100);
    // Also observe size changes (when leads load in lazily and columns grow).
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (ro) ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      clearTimeout(t);
      ro?.disconnect();
    };
  }, []);

  return {
    scrollRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    canScrollLeft,
    canScrollRight,
    scrollByAmount,
  };
}
