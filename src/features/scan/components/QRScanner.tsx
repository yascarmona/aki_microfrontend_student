import QRCode from "react-qr-code";

interface QRScannerProps {
  qrValue: string;
}

export function QRScanner({ qrValue }: QRScannerProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <QRCode value={`http://localhost:8080/scan?token=${qrValue}`} size={200} />
      <p className="text-sm text-muted-foreground text-center">
        Scaneie o QRCOde e registre sua presença
      </p>
    </div>
  );
}


//      //<QRCode value={`https://aki-aluno.vercel.app/scan?token=${qrToken}`} size={200} />