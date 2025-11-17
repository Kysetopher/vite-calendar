// AppLayout.tsx
import { useAppVh } from "@/utils/useAppVh";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import { useEffect } from "react";
export default function AppLayout({ children }: { children: React.ReactNode }) {
  useAppVh();
useEffect(() => {
  const log = (e?: Event) => {
    const t = (e?.target as HTMLElement) ?? null;
    console.log(
      '[dbg]',
      'windowY', window.scrollY,
      'target', t?.tagName, t?.dataset?.pageScroller ? '(page scroller)' : '',
      'targetScrollY', t && 'scrollTop' in t ? (t as any).scrollTop : 'n/a',
      'vv', window.visualViewport?.height
    );
  };
  // any window scroll
  window.addEventListener('scroll', log, { passive: true });
  // capture scroll on any element
  document.addEventListener('scroll', log, { passive: true, capture: true });
  // viewport changes
  window.visualViewport?.addEventListener('resize', log, { passive: true });
  return () => {
    window.removeEventListener('scroll', log);
    document.removeEventListener('scroll', log, { capture: true } as any);
    window.visualViewport?.removeEventListener('resize', log as any);
  };
}, []);
 return (
    <div
      className="fixed inset-0 h-full bg-gray-50"                // <- fixed shell
      style={{
        height: "var(--app-vh, 100svh)",                  // tracks vv height
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        overflow: "hidden",                               // main won't scroll
      }}
    >
      <Header />
      <main className="min-h-0 overflow-hidden">
        {children}
      </main>
      <div className="lg:hidden">
        <MobileNav />  {/* in-flow, intrinsic height */}
      </div>
    </div>
  );
}
