import React from 'react';
import QRCode from 'react-qr-code';
import { useSearchParams, Link } from 'react-router-dom';

/**
 * Página simples para exibir o QR Code recebido via query string (?token=...)
 * O teacher microfrontend abre esta rota em nova aba.
 */
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QrDisplayPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--aki-light))] p-6">
      <Card className="shadow-xl w-full max-w-md border border-[hsl(var(--border))] bg-white/90 backdrop-blur">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-extrabold text-[hsl(var(--aki-gold))] tracking-tight">
            AKI<span className="text-[hsl(var(--aki-brown))]">!</span>
          </h1>
          <CardTitle className="mt-2 text-xl font-semibold text-[hsl(var(--aki-brown))]">
            QR Code do Evento
          </CardTitle>
          <CardDescription className="text-sm text-[hsl(var(--muted-foreground))]">
            {token ? "Escaneie este QR Code no app do professor para registrar presença." : "Token não informado."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {token ? (
            // O QR Code agora contém a URL completa que leva direto ao formulário de confirmação de CPF.
            <QRCode value={`${window.location.origin}/attendance/confirm?token=${encodeURIComponent(token)}`} size={220} />
          ) : (
            <div className="text-sm text-muted-foreground">Nenhum QR Code para exibir.</div>
          )}
        </CardContent>
      </Card>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/scan">Voltar para scanner</Link>
      </Button>
      <footer className="mt-6 text-xs text-[hsl(var(--muted-foreground))]">
        © {new Date().getFullYear()} <span className="font-semibold text-[hsl(var(--aki-brown))]">AKI!</span> – Sistema de Presença Inteligente
      </footer>
    </div>
  );
}
