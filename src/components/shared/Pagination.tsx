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

function controlClass(compact = false) {
  return `icon-button ${compact ? 'min-h-11 min-w-11' : 'min-h-8 min-w-8 md:min-h-10 md:min-w-10'} disabled:cursor-not-allowed disabled:opacity-40`;
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
      className={`flex items-center gap-2 ${compact ? 'justify-center' : 'justify-end'}`}
    >
      <button
        type="button"
        aria-label="Primeira página"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={controlClass(compact)}
      >
        <ChevronsLeftIcon className="h-4 w-4" />
      </button>

      <button
        type="button"
        aria-label="Página anterior"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={controlClass(compact)}
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      <span className="min-w-[88px] text-center text-sm font-medium text-text-muted">
        {currentPage}/{totalPages}
      </span>

      <button
        type="button"
        aria-label="Próxima página"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={controlClass(compact)}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>

      <button
        type="button"
        aria-label="Última página"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={controlClass(compact)}
      >
        <ChevronsRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}
