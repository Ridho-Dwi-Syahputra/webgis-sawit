'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, GraduationCap, MapPin } from 'lucide-react';

/* ─── Team data (Ridho di index 0 = default active) ─── */
const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Ridho Dwi Syahputra',
    role: 'Frontend Developer',
    nim: '—',
    avatar: '/team/ridho.jpg',
    initials: 'RD',
    gradient: 'from-emerald-500 to-teal-500',
    pesan:
      'Membangun WebGIS ini mengajarkan bagaimana teknologi spasial dapat memberikan informasi yang berharga bagi pengelolaan perkebunan kelapa sawit secara presisi.',
  },
  {
    id: 2,
    name: 'Muhammad Abrar Rayva',
    role: 'Backend Developer',
    nim: '—',
    avatar: '/team/abrar.jpeg',
    initials: 'MA',
    gradient: 'from-blue-500 to-cyan-500',
    pesan:
      'Pengalaman mengembangkan REST API untuk data spasial sangat memperdalam pemahaman tentang arsitektur sistem dan database geospasial.',
  },
  {
    id: 3,
    name: 'Fachri Akbar',
    role: 'Data & GIS Analyst',
    nim: '—',
    avatar: '/team/fachri.jpg',
    initials: 'FA',
    gradient: 'from-violet-500 to-purple-500',
    pesan:
      'Proses digitasi dan klasifikasi pohon sawit dari citra satelit memberi pengalaman langsung tentang analisis spasial dan penginderaan jauh.',
  },
];

const AUTO_PLAY_MS = 5000;
const ANIMATION_GUARD_MS = 550;

/* ─── Avatar with fallback ─── */
function Avatar({ src, initials, gradient, size = 'lg' }) {
  const [err, setErr] = useState(false);
  const sizeClass = size === 'lg' ? 'h-24 w-24' : 'h-14 w-14';
  const textSize = size === 'lg' ? 'text-3xl' : 'text-lg';
  const borderClass =
    size === 'lg'
      ? 'ring-[3px] ring-emerald-400/60'
      : 'ring-2 ring-white/20';

  if (!err && src) {
    return (
      <img
        src={src}
        alt=""
        onError={() => setErr(true)}
        className={`${sizeClass} rounded-full object-cover ${borderClass}`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-gradient-to-br ${gradient} ${textSize} font-bold text-white ${borderClass}`}
    >
      {initials}
    </div>
  );
}

/* ─── Main Component ─── */
export default function TimPage() {
  const [active, setActive] = useState(0);
  const isAnimating = useRef(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);
  const total = TEAM_MEMBERS.length;

  /* Auto-play */
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    if (total <= 1) return;
    timerRef.current = setInterval(() => {
      setActive((a) => (a + 1) % total);
    }, AUTO_PLAY_MS);
  }, [clearTimer, total]);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  /* Animation guard */
  const guard = () => {
    if (isAnimating.current) return false;
    isAnimating.current = true;
    setTimeout(() => {
      isAnimating.current = false;
    }, ANIMATION_GUARD_MS);
    return true;
  };

  const next = () => {
    if (!guard()) return;
    setActive((a) => (a + 1) % total);
    startTimer();
  };
  const prev = () => {
    if (!guard()) return;
    setActive((a) => (a - 1 + total) % total);
    startTimer();
  };
  const goTo = (idx) => {
    if (idx === active || !guard()) return;
    setActive(idx);
    startTimer();
  };

  /* Signed offset for wrap-around */
  const getOffset = (idx) => {
    const half = Math.floor(total / 2);
    let offset = idx - active;
    if (offset > half) offset -= total;
    if (offset < -half) offset += total;
    return offset;
  };

  /* Touch swipe */
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  /* Position styles */
  const getCardStyle = (offset) => {
    const base = {
      position: 'absolute',
      top: 0,
      left: '50%',
      width: '320px',
      transition:
        'transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.45s ease, box-shadow 0.4s ease',
      willChange: 'transform, opacity',
    };
    switch (offset) {
      case 0:
        return {
          ...base,
          transform: 'translateX(-50%) scale(1)',
          opacity: 1,
          zIndex: 10,
          pointerEvents: 'auto',
        };
      case -1:
        return {
          ...base,
          transform: 'translateX(-125%) scale(0.85)',
          opacity: 0.4,
          zIndex: 5,
          pointerEvents: 'none',
        };
      case 1:
        return {
          ...base,
          transform: 'translateX(25%) scale(0.85)',
          opacity: 0.4,
          zIndex: 5,
          pointerEvents: 'none',
        };
      default:
        return {
          ...base,
          transform: `translateX(${offset < 0 ? '-220%' : '120%'}) scale(0.7)`,
          opacity: 0,
          zIndex: 1,
          pointerEvents: 'none',
        };
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-4xl px-6 py-12 md:px-8 lg:py-16">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <GraduationCap size={14} />
            Kelompok 8
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Tim <span className="text-emerald-600">Kami</span>
          </h1>
          <p
            className="mx-auto max-w-xl text-base text-gray-600"
            style={{ textAlign: 'justify' }}
          >
            Proyek WebGIS Kelapa Sawit ini dikembangkan oleh mahasiswa dalam
            rangka menyelesaikan Tugas Besar mata kuliah Analisis Spasial. Geser
            untuk melihat profil dan kesan setiap anggota.
          </p>
        </header>

        {/* ─── Three-Card Carousel ─── */}
        <section
          className="relative mb-12 overflow-hidden py-5"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Viewport */}
          <div className="relative mx-auto" style={{ maxWidth: 900, height: 520 }}>
            {TEAM_MEMBERS.map((m, idx) => {
              const offset = getOffset(idx);
              if (Math.abs(offset) > 2) return null;
              const isCenter = offset === 0;

              return (
                <article
                  key={m.id}
                  style={getCardStyle(offset)}
                  className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  {/* Photo area */}
                  <div
                    className="relative flex items-center justify-center"
                    style={{
                      height: isCenter ? 200 : 140,
                      background: isCenter
                        ? 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #14b8a6 100%)'
                        : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                      transition: 'height 0.55s cubic-bezier(0.4,0,0.2,1)',
                    }}
                  >
                    {/* Counter badge */}
                    {isCenter && (
                      <span className="absolute top-3 right-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                        {active + 1}/{total}
                      </span>
                    )}
                    <Avatar
                      src={m.avatar}
                      initials={m.initials}
                      gradient={m.gradient}
                      size={isCenter ? 'lg' : 'sm'}
                    />
                  </div>

                  {/* Info */}
                  <div
                    className="flex flex-1 flex-col items-center text-center"
                    style={{
                      padding: isCenter ? '20px 24px 24px' : '12px 16px 16px',
                    }}
                  >
                    <h3
                      className="mb-1 font-bold text-gray-900"
                      style={{ fontSize: isCenter ? '1.1rem' : '0.82rem' }}
                    >
                      {m.name}
                    </h3>
                    <span className="mb-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      {m.role}
                    </span>

                    {/* Info row */}
                    <div className="flex w-full items-center justify-center gap-3 border-y border-gray-100 py-2.5 text-[11px]">
                      <span className="flex flex-col gap-0.5">
                        <span className="uppercase tracking-wide text-gray-400">
                          Mata Kuliah
                        </span>
                        <span className="font-semibold text-gray-700">
                          Analisis Spasial
                        </span>
                      </span>
                      <span className="h-5 w-px bg-gray-200" />
                      <span className="flex flex-col gap-0.5">
                        <span className="uppercase tracking-wide text-gray-400">
                          Semester
                        </span>
                        <span className="font-semibold text-gray-700">6</span>
                      </span>
                    </div>

                    {/* Pesan — only visible on center */}
                    <div
                      className="mt-3 w-full rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-left"
                      style={{
                        opacity: isCenter ? 1 : 0,
                        transform: isCenter
                          ? 'translateY(0)'
                          : 'translateY(8px)',
                        transition:
                          'opacity 0.45s ease 0.1s, transform 0.45s ease 0.1s',
                        pointerEvents: isCenter ? 'auto' : 'none',
                      }}
                    >
                      <span className="absolute text-2xl leading-none text-emerald-300 select-none">
                        &ldquo;
                      </span>
                      <p
                        className="pl-5 text-[12px] leading-relaxed text-gray-600 italic"
                        style={{ textAlign: 'justify' }}
                      >
                        {m.pesan}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* Arrows */}
            <button
              type="button"
              onClick={prev}
              className="absolute top-[38%] left-2 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-600 shadow-lg backdrop-blur-sm transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
              aria-label="Sebelumnya"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute top-[38%] right-2 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-600 shadow-lg backdrop-blur-sm transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
              aria-label="Berikutnya"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Dots */}
          <div className="mt-5 flex items-center justify-center gap-1.5">
            {TEAM_MEMBERS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goTo(idx)}
                className={`h-2 rounded-full transition-all duration-400 ${
                  idx === active
                    ? 'w-7 bg-emerald-600'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Lihat ${TEAM_MEMBERS[idx].name}`}
              />
            ))}
          </div>
        </section>

        {/* Info Section */}
        <section className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Informasi Proyek
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <GraduationCap size={18} />
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">
                  Mata Kuliah
                </dt>
                <dd className="text-sm font-semibold text-gray-900">
                  Analisis Spasial
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <MapPin size={18} />
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">
                  Lokasi Studi
                </dt>
                <dd className="text-sm font-semibold text-gray-900">
                  Palangka Raya, Kalimantan Tengah
                </dd>
              </div>
            </div>
          </dl>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          Tugas Besar Analisis Spasial · Semester 6 · Kelompok 8
        </footer>
      </div>
    </div>
  );
}
