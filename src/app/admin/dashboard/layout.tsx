'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { href: '/admin/dashboard', label: 'Home' },
  { href: '/admin/dashboard/pending', label: 'Pending Requests' },
  { href: '/admin/dashboard/calendar', label: 'Calendar' },
  { href: '/admin/dashboard/availability', label: 'Availability' },
  { href: '/admin/dashboard/portfolio', label: 'Portfolio' },
  { href: '/admin/dashboard/policies', label: 'Policies' },
  { href: '/admin/dashboard/pricing', label: 'Pricing' },
  { href: '/admin/dashboard/settings', label: 'Site Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-[#f7f2ea]">
      <header className="sticky top-0 z-20 border-b-4 border-diary-black bg-diary-black">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <span className="font-display text-sm text-white sm:text-base">Viv&apos;s Nail Diary — Admin</span>
          <button onClick={logout} className="font-hand text-xl text-diary-hotpink hover:text-white">
            Log out
          </button>
        </div>
        <nav className="scrollbar-thin flex gap-1 overflow-x-auto bg-diary-purple/90 px-2 py-2">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                  active ? 'bg-white text-diary-purple' : 'text-white/85 hover:bg-white/15'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
