import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--aki-light))] p-6">
      <Card className="w-full max-w-md shadow-xl border bg-white/90 backdrop-blur">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-extrabold text-[hsl(var(--aki-gold))] tracking-tight">
            AKI<span className="text-[hsl(var(--aki-brown))]">!</span>
          </h1>
          <CardTitle className="mt-2 text-xl font-semibold text-[hsl(var(--aki-brown))]">
            Nenhum Evento Encontrado
          </CardTitle>
          <CardDescription className="text-sm text-[hsl(var(--muted-foreground))]">
            Acesse o link do QR Code compartilhado pelo professor para registrar sua presença.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-[hsl(var(--aki-brown))]">
          Se você chegou aqui sem escanear um QR Code, volte e escaneie novamente.
        </CardContent>
      </Card>
    </div>
  );
}
