'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

const OUT = 0.4;

const ICON_PATHS: Record<'heart' | 'star' | 'thumb', string[]> = {
  heart: [
    'M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z',
  ],
  star: [
    'M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z',
  ],
  thumb: [
    'M7 11V20H4C3.44772 20 3 19.5523 3 19V12C3 11.4477 3.44772 11 4 11H7ZM7 11L11.2929 3.70711C11.6834 3.31658 12.3166 3.31658 12.7071 3.70711C12.8946 3.89464 13 4.149 13 4.41421V8H18.4384C19.658 8 20.5839 9.10329 20.3694 10.3042L19.0123 17.9042C18.842 18.8576 18.0128 19.5523 17.0442 19.5523H7V11Z',
  ],
};

export interface PulseHeartProps {
  liked?: boolean;
  defaultLiked?: boolean;
  count?: number;
  onChange?: (liked: boolean, count: number) => void;
  showCount?: boolean;
  icon?: 'heart' | 'star' | 'thumb' | ReactNode;
  idleOutline?: boolean;
  size?: number;
  corner?: number;
  likedColor?: string;
  idleColor?: string;
  pillColor?: string;
  textColor?: string;
  duration?: number;
  dotSize?: number;
  overshoot?: number;
  beat?: number;
  rollDuration?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const back = (k: number, c: number) => {
  const u = k - 1;
  return 1 + (c + 1) * u ** 3 + c * u ** 2;
};

const swellOf = (t: number, c: number) =>
  t <= 0 ? 0 : t < OUT ? 1 - (1 - t / OUT) ** 3 : 1 - back((t - OUT) / (1 - OUT), c);

const format = (n: number) => new Intl.NumberFormat().format(n);

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function PulseHeart({
  liked: likedProp,
  defaultLiked = false,
  count = 0,
  onChange,
  showCount = true,
  icon = 'heart',
  idleOutline = true,
  size = 40,
  corner = 32,
  likedColor = '#ff4d6d',
  idleColor = '#8b8b93',
  pillColor = '#232326',
  textColor = '#f5f5f5',
  duration = 560,
  dotSize = 0.3,
  overshoot = 1.7,
  beat = 3,
  rollDuration = 350,
  disabled = false,
  label = 'Like',
  className = '',
}: PulseHeartProps) {
  const controlled = likedProp !== undefined;
  const [inner, setInner] = useState(defaultLiked);
  const [delta, setDelta] = useState(0);
  const liked = controlled ? likedProp : inner;
  const total = count + delta;

  const [shown, setShown] = useState({ liked, count: total });
  const [roll, setRoll] = useState<{
    a: string;
    b: string;
    at: number;
    up: boolean;
  } | null>(null);

  const rootRef = useRef<HTMLButtonElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const heartRef = useRef<HTMLSpanElement | null>(null);
  const glyphRef = useRef<SVGGElement | null>(null);
  const rollRef = useRef<HTMLSpanElement | null>(null);
  const raf = useRef<number>(0);
  const rollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const viaPointer = useRef(false);
  const shownRef = useRef(shown);
  const logical = useRef({ liked, count: total });
  const cfg = useRef({ duration, dotSize, overshoot, beat, rollDuration });

  useLayoutEffect(() => {
    logical.current = { liked, count: total };
    cfg.current = { duration, dotSize, overshoot, beat, rollDuration };
  });

  useEffect(() => {
    if (raf.current) return;
    if (shownRef.current.liked === liked && shownRef.current.count === total) return;
    const id = requestAnimationFrame(() => {
      shownRef.current = { liked, count: total };
      setShown(shownRef.current);
    });
    return () => cancelAnimationFrame(id);
  }, [liked, total]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || root.dataset.instant === undefined) return;
    root.getBoundingClientRect();
    delete root.dataset.instant;
  }, [shown]);

  useLayoutEffect(() => {
    const el = rollRef.current;
    if (!el || !roll) return;
    el.style.transition = 'none';
    el.style.transform = `translateY(${roll.up ? '0' : '-1em'})`;
    el.getBoundingClientRect();
    el.style.transition = '';
    el.style.transform = `translateY(${roll.up ? '-1em' : '0'})`;
  }, [roll]);

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      if (rollTimer.current) clearTimeout(rollTimer.current);
    },
    []
  );

  const startRoll = (from: number, to: number) => {
    if (from === to) return;
    const a = format(from);
    const b = format(to);
    const changed =
      a.length === b.length
        ? [...b].flatMap((ch, i) => (ch !== a[i] ? [i] : []))
        : [];
    setRoll({ a, b, at: changed.length === 1 ? changed[0] : -1, up: to > from });
    if (rollTimer.current) clearTimeout(rollTimer.current);
    rollTimer.current = setTimeout(() => setRoll(null), cfg.current.rollDuration);
  };

  const run = (nextLiked: boolean, nextCount: number) => {
    const root = rootRef.current;
    const heart = heartRef.current;
    const pill = pillRef.current;
    if (!root || !heart || !pill) return;
    const glyph = glyphRef.current;
    root.dataset.running = '';
    let swapped = false;
    let prev = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const { duration: D, dotSize: dot, overshoot: c, beat: B } = cfg.current;
      const t = Math.min(1, (now - t0) / D);
      const step = prev ? now - prev : 1000 / 60;
      prev = now;
      const s = swellOf(t, c);
      const k = 1 - (1 - dot) * s;
      if (glyph) {
        glyph.setAttribute(
          'transform',
          `translate(12 12) scale(${k}) translate(-12 -12)`
        );
      } else {
        heart.style.transform = `scale(${k})`;
      }
      pill.style.transform = `scale(${1 - (B / 100) * s})`;
      if (!swapped && t + step / 2 / D >= OUT) {
        swapped = true;
        root.dataset.liked = String(nextLiked);
        startRoll(shownRef.current.count, nextCount);
        shownRef.current = { liked: nextLiked, count: nextCount };
        setShown(shownRef.current);
      }
      if (t < 1) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      raf.current = 0;
      if (glyph) glyph.removeAttribute('transform');
      heart.style.transform = '';
      pill.style.transform = '';
      delete root.dataset.running;
      const l = logical.current;
      if (
        l.liked !== shownRef.current.liked ||
        l.count !== shownRef.current.count
      ) {
        shownRef.current = { liked: l.liked, count: l.count };
        setShown(shownRef.current);
      }
    };
    raf.current = requestAnimationFrame(tick);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 || disabled) return;
    viaPointer.current = true;
    if (!reducedMotion() && rootRef.current) rootRef.current.dataset.pressed = '';
  };

  const handlePointerUp = () => {
    if (rootRef.current) delete rootRef.current.dataset.pressed;
  };

  const handlePointerCancel = () => {
    viaPointer.current = false;
    handlePointerUp();
  };

  const handleKeyDown = () => {
    viaPointer.current = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || raf.current) return;
    const pointer = viaPointer.current && e.detail !== 0;
    viaPointer.current = false;
    const nextLiked = !liked;
    const nextDelta = delta + (nextLiked ? 1 : -1);
    const nextCount = count + nextDelta;
    if (!controlled) setInner(nextLiked);
    setDelta(nextDelta);
    onChange?.(nextLiked, nextCount);
    if (pointer && !reducedMotion()) run(nextLiked, nextCount);
    else if (rootRef.current) rootRef.current.dataset.instant = '';
  };

  const paths =
    typeof icon === 'string' && icon in ICON_PATHS
      ? ICON_PATHS[icon as keyof typeof ICON_PATHS]
      : null;
  const text = format(shown.count);
  const cells = roll
    ? roll.at === -1
      ? [{ top: roll.up ? roll.a : roll.b, bottom: roll.up ? roll.b : roll.a }]
      : [...roll.b].map((ch, i) =>
          i === roll.at
            ? { top: roll.up ? roll.a[i] : ch, bottom: roll.up ? ch : roll.a[i] }
            : { ch }
        )
    : [...text].map((ch) => ({ ch }));

  return (
    <button
      ref={rootRef}
      type="button"
      aria-pressed={liked}
      disabled={disabled}
      data-liked={String(shown.liked)}
      data-solid={idleOutline ? undefined : ''}
      data-no-count={showCount ? undefined : ''}
      className={`group relative m-0 inline-flex cursor-pointer touch-manipulation select-none items-center justify-center border-0 bg-transparent p-0 outline-none [font-family:inherit] [color:var(--ph-text)] rounded-[var(--ph-corner)] [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] [transition:transform_160ms_var(--ph-ease-out)] data-[pressed]:[transform:scale(0.97)] focus-visible:outline-offset-[3px] focus-visible:[outline:2px_solid_color-mix(in_srgb,var(--ph-liked)_60%,transparent)] disabled:cursor-default disabled:opacity-[0.55] motion-reduce:transition-none${className ? ` ${className}` : ''}`}
      style={
        {
          '--ph-size': `${size}px`,
          '--ph-corner': `${corner}px`,
          '--ph-pill': pillColor,
          '--ph-idle': idleColor,
          '--ph-liked': likedColor,
          '--ph-text': textColor,
          '--ph-roll': `${rollDuration}ms`,
          '--ph-stroke': `${(1.5 * size) / 24}px`,
          '--ph-ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
        } as CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      <span
        ref={pillRef}
        className="inline-flex origin-center items-center [gap:calc(var(--ph-size)*0.25)] [padding:calc(var(--ph-size)*0.3)] [padding-inline-end:calc(var(--ph-size)*0.4)] group-data-[no-count]:[padding-inline-end:calc(var(--ph-size)*0.3)] rounded-[var(--ph-corner)] [background:var(--ph-pill)] [@media(prefers-contrast:more)]:[box-shadow:inset_0_0_0_1px_color-mix(in_srgb,var(--ph-text)_25%,transparent)]"
      >
        <span
          ref={heartRef}
          className="block h-[var(--ph-size)] w-[var(--ph-size)] origin-center [color:var(--ph-idle)] [transition:color_160ms_ease] group-data-[liked=true]:[color:var(--ph-liked)] group-data-[running]:transition-none group-data-[instant]:transition-none motion-reduce:[transition:color_200ms_ease] [&_svg]:block [&_svg]:h-full [&_svg]:w-full [&_svg]:overflow-visible [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:[stroke-width:var(--ph-stroke)] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round] group-data-[liked=true]:[&_svg]:fill-current group-data-[solid]:[&_svg]:fill-current [@media(hover:hover)_and_(pointer:fine)]:group-enabled:group-hover:group-data-[liked=false]:[color:color-mix(in_srgb,var(--ph-idle)_45%,var(--ph-liked))]"
          aria-hidden="true"
        >
          {paths ? (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <g ref={glyphRef}>
                {paths.map((d, idx) => (
                  <path key={idx} d={d} vectorEffect="non-scaling-stroke" />
                ))}
              </g>
            </svg>
          ) : (
            icon
          )}
        </span>
        {showCount ? (
          <span
            className="inline-flex font-semibold leading-none tracking-[-0.1px] tabular-nums [font-size:calc(var(--ph-size)*0.5)] [color:var(--ph-text)] [&>span]:block [&>span]:h-[1em]"
            aria-hidden="true"
          >
            {cells.map((cell, i) =>
              'ch' in cell ? (
                <span key={`c${i}`}>{cell.ch}</span>
              ) : (
                <span key={`r${i}`} className="relative overflow-hidden">
                  <span
                    ref={rollRef}
                    className="flex flex-col [transition:transform_var(--ph-roll)_var(--ph-ease-out)] motion-reduce:transition-none [&>span]:block [&>span]:h-[1em] [&>span]:leading-none"
                  >
                    <span>{cell.top}</span>
                    <span>{cell.bottom}</span>
                  </span>
                </span>
              )
            )}
          </span>
        ) : null}
        <span className="sr-only">
          {showCount ? `${label}, ${format(total)}` : label}
        </span>
      </span>
    </button>
  );
}
