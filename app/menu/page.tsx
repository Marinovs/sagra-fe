import { NavBar } from "@/components/nav-bar";
import { MenuContent } from "@/components/menu-content";

export default function MenuPage() {
  return (
    <main className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <section className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">
            Il Nostro Menu
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Scopri i nostri piatti tradizionali della 26ª Edizione della Sagra
            Antichi Sapori. Ordina direttamente online e ritira lo scontrino in
            cassa.
          </p>
        </section>

        <MenuContent />
      </div>
    </main>
  );
}
