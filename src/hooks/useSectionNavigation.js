import { useEffect, useRef, useState } from 'react';

export function useSectionNavigation(anchors, page) {
  const [active, setActive] = useState(page || anchors[0] || '');
  const destination = useRef(null);
  const anchorKey = anchors.join(',');

  function navigate(anchor, behavior = 'smooth') {
    const element = document.getElementById(anchor);
    if (!element) return false;
    const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 92;
    const top = Math.max(0, Math.min(
      window.scrollY + element.getBoundingClientRect().top - padding,
      document.documentElement.scrollHeight - window.innerHeight
    ));
    destination.current = { anchor, top, arrived: Math.abs(window.scrollY - top) < 2 };
    setActive(anchor);
    window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : behavior });
    return true;
  }

  useEffect(() => {
    if (page) { setActive(page); return; }
    const ids = anchorKey.split(',').filter(Boolean);
    let frame = 0;
    function update() {
      frame = 0;
      const target = destination.current;
      if (target) {
        const reached = Math.abs(window.scrollY - target.top) < 2;
        if (!target.arrived || reached) {
          target.arrived ||= reached;
          setActive(target.anchor);
          return;
        }
        destination.current = null;
      }
      const entries = ids.map(id => {
        const element = document.getElementById(id);
        return element && { id, top: element.getBoundingClientRect().top };
      }).filter(Boolean).sort((a, b) => a.top - b.top);
      if (!entries.length) return;
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        setActive(entries.at(-1).id);
        return;
      }
      const edge = (document.querySelector('.header')?.getBoundingClientRect().bottom || 78) + 24;
      let current = entries[0];
      for (const entry of entries) {
        // Side-by-side cards share a top edge; keep the first menu item for that row.
        if (entry.top <= edge && entry.top > current.top + 1) current = entry;
      }
      setActive(current.id);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    function release() { destination.current = null; schedule(); }
    function keydown(event) {
      if (!event.target.closest('input,textarea,select,[contenteditable]') && ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) release();
    }
    function hashchange() {
      const anchor = location.hash.slice(1);
      if (!ids.includes(anchor) || !navigate(anchor, 'instant')) release();
    }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', release);
    window.addEventListener('wheel', release, { passive: true });
    window.addEventListener('touchmove', release, { passive: true });
    window.addEventListener('keydown', keydown);
    window.addEventListener('hashchange', hashchange);
    const observer = new ResizeObserver(schedule);
    const main = document.querySelector('main');
    if (main) observer.observe(main);
    hashchange();
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', release);
      window.removeEventListener('wheel', release);
      window.removeEventListener('touchmove', release);
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('hashchange', hashchange);
    };
  }, [anchorKey, page]);

  return { active, navigate };
}
