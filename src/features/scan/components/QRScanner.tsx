import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  isScanning: boolean;
}

export function QRScanner({ onScan, isScanning }: QRScannerProps) {
  const [error] = useState<string | null>(null);

  if (error) {
    return (
      <Card className="w-full aspect-square flex flex-col items-center justify-center p-8 bg-muted/50 border-2 border-dashed">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <p className="text-center text-muted-foreground">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden border-4 border-primary shadow-lg relative">
      <div className="aspect-square relative">
        <div className="w-full h-full flex items-center justify-center bg-white">
          <img
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAABJJJREFUeF7tnVGS2zAMQ9v7X7o7k2SmsSNRBEjQyfy2+wBBgBRp2d7++/fv34f/KQn8UQCUHL9szwIQc0ABEPNBDV8BUHNCAVBzQgFQ80ENXwFQc0IBUHNCDf//AbjdbtI4n8/nI/77/V7G8XVvX+OLOJj7ww/8HiACUAC+OaAAKAD/I6AAZGWIhqoqhQJE+8GVlfEFQK0AKgGy+kIBovpCJUBWQSgAav5TCSgAWYmgElAAFAAVgUzHqwSoBKgEqARkKkAlIFMBKgEqASoBmQqo76VXF4FUxXIplPPzdxnvBZxcEdShU2gKwM5ZBYACQFVboXsF4BWtqh6RkkvXZPbvAhQAlYBXDmS2ERSAfQUoAApAeR5AAVAACoBKQHkiSF3B+v37k6gDRJ+Q0edS+Z0S0wJQuPwcR6YB7I6hACgA5VmAAqAAKAAqAuV5gNUVrHl4pjw+n0zJI8rjaLjr6wAKwK4MFAAFoDwRpAAoAApA4wqgVHVJUflKzdG4c3FE7yMYV2oQTEVPAVAA5CeDFAAFQAFQEVieB1hdwZpVAHJ8KXXbB1LR4VMJ6PwgqADsypwCoAAoACoCGVsKQFICrg5QJUCK3gc+qSjdJ2DRXsEFQAHI6AIUgKwIXF0EFoBrK4ACcG0+ZNErAArAtwgoAAqAikD2g6ACoAAoACoCmQqgbgapxzVk0GX8VM/+6HsY6k2gArB/MkgBUAAUAJWA8jyASkCmAqgEqASoBGQqQCUgUwEqASoBKgGZClAJyFSASoBKgEpApgJUAjIVoBKgEqASkKmA+l56tQ6QGdLvRlV+J6AA7HKpACgA5XkABUABUABUBMrzAKsrWLMKcDSvK4Uzf5czvw4wTyRS3/qNz/QKgAKQ0QUoAFkRuLoILADXVgAF4Np8yKJXABSAbwFQABQAFYHsB0EFQAFQAFQEMhWgbgapxzVk0GX81M/+6HsY6k2gArB/MkgBUAAUAJWA8jyASkCmAqgEqASoBGQqQCUgUwEqASoBKgGZClAJyFSASoBKgEpApgJUAjIVoBKgEqASkKmA+l56tQ6QGdLvRlV+J6AA7HKpACgA5XkABUABUABUBMrzAKsrWLMKcDSvK4Uzf5czf5o4k0ikfvEbn+kVAAUgowsQEYEogNRnf+ozPgrg6PsA4xNJ7QQqAAqAikB2NrAAZEXg6iKwAFxbARSAa/Mhi14BUAC+BUABUABUBLIfBBUABUABUBHIVIC6GaQe15BBl/FTP/uj72GoN4EKwP7JIAVAARQAhfMikF0xpEVgEhEEQG0FKwAKwPIVSFprpy/6zJ+5aCUV5egCUAAUgPkbjvw9BSArH1OVoK4DVPUQUotL6js5qXG/4jN/Pwrw7w8KwC6VCoAC8M0BBUABUBHIFJFKgEpA+RUwBUABUABUBDIVoBKQqQCVAJUAlYBMBagEZCpAJUAlQCUgUwEqAZkKUAlQCVAJyFTA1UtA6nEKGXQZP/WzP/oeBvUmUAHYvxOoACgACoC4BKS+85P67E8B2FWkAqAAKAAqAuV5gNUVrFkFcDSvK4Uzf5fzP2+/pX1kd+u1AAAAAElFTkSuQmCC"
            alt="Mocked QR Code"
            className="w-48 h-48"
          />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-8 border-4 border-primary rounded-2xl scan-pulse" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 border-t-4 border-l-4 border-primary absolute -top-8 -left-8 rounded-tl-xl" />
              <div className="w-16 h-16 border-t-4 border-r-4 border-primary absolute -top-8 -right-8 rounded-tr-xl" />
              <div className="w-16 h-16 border-b-4 border-l-4 border-primary absolute -bottom-8 -left-8 rounded-bl-xl" />
              <div className="w-16 h-16 border-b-4 border-r-4 border-primary absolute -bottom-8 -right-8 rounded-br-xl" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
