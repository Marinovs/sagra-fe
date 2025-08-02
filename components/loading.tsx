export function MenuLoading() {
  return (
    <div className="text-center py-8">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      <p className="mt-4 text-gray-600">Caricamento menu...</p>
    </div>
  );
}

export function FooterLoading() {
  return <div className="h-20 bg-gray-100 animate-pulse rounded" />;
}

export function MobileFooterLoading() {
  return <div className="h-16 bg-gray-100 animate-pulse rounded" />;
}
