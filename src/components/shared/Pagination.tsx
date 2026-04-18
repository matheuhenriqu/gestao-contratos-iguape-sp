import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from './icons';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  compact?: boolean;
};

function controlClass(active = false) {
  return `focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border text-[13px] font-medium transition ${
    active
      ? 'border-brand-600 bg-brand-600 text-white'
      : 'border-border bg-surface text-muted hover:border-brand-600 hover:text-brand-700'
  } disabled:cursor-not-allowed disabled:opacity-45`;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  compact = false,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Paginação dos contratos"
      className={`flex items-center gap-2 ${compact ? 'justify-between' : 'justify-end'}`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Primeira página"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={controlClass()}
        >
          <ChevronsLeftIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Página anterior"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={controlClass()}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
      </div>

      <p className="min-w-0 px-2 text-[13px] font-medium text-muted">
        Página {currentPage} de {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Próxima página"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={controlClass()}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Última página"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={controlClass()}
        >
          <ChevronsRightIcon className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
