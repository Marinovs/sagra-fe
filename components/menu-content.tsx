"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import {
  MenuLoading,
  FooterLoading,
  MobileFooterLoading,
} from "@/components/loading";
import { ErrorBoundary } from "@/components/error-boundary";

// Dynamic imports for performance optimization
const MenuSection = dynamic(
  () =>
    import("@/components/menu-section").then((mod) => ({
      default: mod.MenuSection,
    })),
  {
    loading: () => <MenuLoading />,
    ssr: false, // Disable SSR for components with client-side data fetching
  }
);

const MenuSectionMobile = dynamic(
  () =>
    import("@/components/menu-section-mobile").then((mod) => ({
      default: mod.MenuSectionMobile,
    })),
  {
    loading: () => <MenuLoading />,
    ssr: false, // Disable SSR for components with client-side data fetching
  }
);

const Footer = dynamic(
  () => import("@/components/footer").then((mod) => ({ default: mod.Footer })),
  {
    loading: () => <FooterLoading />,
  }
);

const MobileFooter = dynamic(
  () =>
    import("@/components/mobile-footer").then((mod) => ({
      default: mod.MobileFooter,
    })),
  {
    loading: () => <MobileFooterLoading />,
  }
);

export function MenuContent() {
  return (
    <>
      {/* Show mobile or desktop menu section based on screen size */}
      <div className="block 2xl:hidden">
        <ErrorBoundary>
          <Suspense fallback={<MenuLoading />}>
            <MenuSectionMobile />
          </Suspense>
        </ErrorBoundary>
      </div>
      <div className="hidden 2xl:block">
        <ErrorBoundary>
          <Suspense fallback={<MenuLoading />}>
            <MenuSection />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Footer */}
      <div className="block sm:hidden">
        <Suspense fallback={<MobileFooterLoading />}>
          <MobileFooter />
        </Suspense>
      </div>
      <div className="hidden sm:block">
        <Suspense fallback={<FooterLoading />}>
          <Footer />
        </Suspense>
      </div>
    </>
  );
}
