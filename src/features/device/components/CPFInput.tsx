import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { formatCPF } from '@/shared/utils/validators';

interface CPFInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const CPFInput = forwardRef<HTMLInputElement, CPFInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, '');
      if (rawValue.length <= 11) {
        onChange(rawValue);
      }
    };

    return (
      <Input
        ref={ref}
        {...props}
        type="text"
        inputMode="numeric"
        value={formatCPF(value)}
        onChange={handleChange}
        placeholder="000.000.000-00"
        className="text-lg h-14 text-center tracking-wider"
      />
    );
  }
);

CPFInput.displayName = 'CPFInput';
