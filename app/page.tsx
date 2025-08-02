"use client";

import { NavBar } from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { FooterLoading, MobileFooterLoading } from "@/components/loading";

// Dynamic imports for footer components only
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

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <section className="flex flex-col items-center justify-center text-center space-y-8 min-h-[60vh]">
          <div className="space-y-4">
            <Image
              src="/images/webp/banner.webp"
              alt="XXVI Edizione Sagra Antichi Sapori - Pro Loco Gioiese"
              width={800}
              height={800}
              className="mx-auto max-w-full h-auto"
              priority // Load this image with high priority since it's above the fold
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
              Benvenuti alla Sagra Antichi Sapori
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Scopri i nostri piatti tradizionali della XXVI Edizione e ordina
              direttamente online per il ritiro al nostro stand.
            </p>
          </div>

          <Link href="/menu">
            <Button size="lg" className="text-lg px-8 py-4 font-semibold">
              Vai al Menu
            </Button>
          </Link>
        </section>
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
    </main>
  );
}
