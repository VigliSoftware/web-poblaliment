import { localizedPath, type Locale, type PageKey } from '../lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface Props {
  locale: Locale;
  activePage?: PageKey;
  label?: string;
  variant?: 'navigation' | 'catalog';
}

export default function BrandsDropdown({
  locale,
  activePage,
  label = locale === 'ca' ? 'Marques' : 'Marcas',
  variant = 'navigation',
}: Props) {
  const active = activePage === 'food' || activePage === 'cellar';
  const items = [
    { page: 'food' as const, label: locale === 'ca' ? 'Alimentació' : 'Alimentación' },
    { page: 'cellar' as const, label: locale === 'ca' ? 'Celler' : 'Bodega' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`brands-trigger brands-trigger--${variant} ${active ? 'is-active' : ''}`}
      >
        {label}
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" collisionPadding={16} aria-label={label}>
        {items.map((item) => (
          <DropdownMenuItem key={item.page} asChild>
            <a
              href={localizedPath(locale, item.page)}
              aria-current={activePage === item.page ? 'page' : undefined}
            >
              {item.label}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
