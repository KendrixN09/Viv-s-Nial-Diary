'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { NotebookShell } from '@/components/notebook/NotebookShell';
import { PortfolioPage } from '@/components/pages/PortfolioPage';
import { PoliciesPage } from '@/components/pages/PoliciesPage';
import { BookingPage } from '@/components/pages/BookingPage';
import { BookingTipsPage } from '@/components/pages/BookingTipsPage';
import { SuccessPage } from '@/components/pages/SuccessPage';
import { useIsMobile } from '@/lib/useIsMobile';

const FLAT_PAGES = ['portfolio', 'policies', 'booking', 'booking-tips', 'success'] as const;
type PageName = (typeof FLAT_PAGES)[number];

export default function Home() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  // Bumped every time OPEN is clicked so the page components below remount
  // and refetch fresh data - they stay mounted permanently in the background
  // (that's what makes close/reopen instant and animated instead of a
  // reload), so without this they'd only ever fetch once on first page load
  // and never see admin changes made after that.
  const [bookSessionId, setBookSessionId] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [kennesawText, setKennesawText] = useState('Kennesaw Based');
  const [igHandle, setIgHandle] = useState('@vivisnail.diary');
  const [igUrl, setIgUrl] = useState('https://www.instagram.com/vivisnail.diary/');

  useEffect(() => {
    fetch('/api/content', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.content?.kennesaw_text) setKennesawText(data.content.kennesaw_text);
        if (data.content?.instagram_handle) setIgHandle(data.content.instagram_handle);
        if (data.content?.instagram_url) setIgUrl(data.content.instagram_url);
      })
      .catch(() => {});
    // bookSessionId dependency: refetch whenever OPEN is clicked, not just on
    // first page load, so Site Settings changes show up on reopen too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookSessionId]);

  const step = isMobile ? 1 : 2;
  const maxNormalIndex = 3; // 'success' (index 4) is only reachable via submission, never via Next
  const canNext = pageIndex < maxNormalIndex && pageIndex !== 4;
  const canBack = pageIndex > 0 && pageIndex !== 4;

  function goNext() {
    setDirection(1);
    setPageIndex((i) => Math.min(i + step, maxNormalIndex));
  }
  function goBack() {
    if (pageIndex === 0) {
      closeToCover();
      return;
    }
    setDirection(-1);
    setPageIndex((i) => Math.max(i - step, 0));
  }
  function closeToCover() {
    setIsOpen(false);
    setTimeout(() => {
      setPageIndex(0);
      setDirection(1);
    }, 900);
  }
  function onBookingSubmitted() {
    setDirection(1);
    setPageIndex(4);
  }

  function renderPage(name: PageName | undefined) {
    switch (name) {
      case 'portfolio':
        return <PortfolioPage instagramHandle={igHandle} instagramUrl={igUrl} />;
      case 'policies':
        return <PoliciesPage />;
      case 'booking':
        return <BookingPage onSubmitted={onBookingSubmitted} />;
      case 'booking-tips':
        return <BookingTipsPage />;
      case 'success':
        return <SuccessPage onRestart={closeToCover} />;
      default:
        return <div className="h-full" />;
    }
  }

  const spreadStart = isMobile ? pageIndex : pageIndex - (pageIndex % 2);
  const leftName = FLAT_PAGES[spreadStart];
  const rightName = isMobile ? undefined : FLAT_PAGES[spreadStart + 1];
  const pageKey = `${isMobile ? FLAT_PAGES[pageIndex] : `${leftName}-${rightName ?? 'blank'}`}-${bookSessionId}`;

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-diary-black bg-[radial-gradient(ellipse_at_center,rgba(139,47,201,0.35),transparent_60%)] p-2 sm:p-4">
      <NotebookShell
        isOpen={isOpen}
        onOpen={() => {
          setIsOpen(true);
          setBookSessionId((id) => id + 1);
        }}
        kennesawText={kennesawText}
        pageKey={pageKey}
        direction={direction}
        leftPage={renderPage(leftName)}
        rightPage={isMobile ? null : renderPage(rightName)}
        onNext={goNext}
        onBack={goBack}
        onClose={closeToCover}
        canNext={canNext}
        canBack={canBack}
        isMobile={isMobile}
      />

      <Link
        href="/admin"
        className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2 text-[0.65rem] uppercase tracking-[0.3em] text-white/25 transition hover:text-white/60"
      >
        admin
      </Link>
    </main>
  );
}
