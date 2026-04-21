import { useEffect, useState } from 'react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      className={`group fixed bottom-5 right-5 z-40 inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-pill border border-primary-200 bg-surface px-3 text-primary-700 shadow-raised transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-50 hover:shadow-elevated md:bottom-6 md:right-6 ${
        visible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0'
      }`}
      style={{ bottom: 'calc(20px + var(--safe-bottom))' }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
      <span className="hidden max-w-0 overflow-hidden text-sm font-medium transition-all duration-200 md:inline-block md:group-hover:max-w-[80px] md:group-hover:pr-1">
        Topo
      </span>
    </button>
  );
}
