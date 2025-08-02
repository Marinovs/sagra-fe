"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Make api call to authenticate
    // API POST call to auth
    axios
      .post(`${process.env.NEXT_PUBLIC_BE_URI}/auth/login`, {
        username: "admin",
        password,
      })
      .then((response) => {
        if (response.status === 201) {
          // Set authentication in localStorage
          localStorage.setItem("token", response.data.access_token);

          toast({
            title: "Login effettuato",
            description: "Benvenuto nell'area amministrativa",
          });

          // Redirect to admin dashboard
          router.push("/admin");
        }
      })
      .catch((error) => {
        toast({
          title: "Errore di autenticazione",
          description: "Password errata. Riprova.",
          variant: "destructive",
        });
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Link
        href="/"
        className="absolute top-4 left-4 text-muted-foreground hover:text-primary transition-colors"
      >
        ← Torna al sito
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <ChefHat className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Accedi all&apos;area amministrativa della Sagra Antichi Sapori
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Usa la password &quot;admin123&quot; per accedere
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Autenticazione..." : "Accedi"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
