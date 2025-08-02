import { Suspense } from "react";

interface SuspenseWrapperProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

export function SuspenseWrapper({ fallback, children }: SuspenseWrapperProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
