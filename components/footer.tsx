export function Footer() {
  return (
    <footer className="bg-muted py-8 md:py-0 border-t w-full fixed bottom-0 left-0">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-center items-center w-full">
            © {new Date().getFullYear()} prolocogioiese.com
          </div>
        </div>
      </div>
    </footer>
  );
}
