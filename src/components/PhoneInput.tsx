import ReactPhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  size?: 'large' | 'middle' | 'small';
  placeholder?: string;
  disabled?: boolean;
  prefix?: React.ReactNode;
}

export default function PhoneInput({ value, onChange, size }: PhoneInputProps) {
  return (
    <ReactPhoneInput
      country="kz"
      preferredCountries={['kz', 'ru']}
      value={value}
      onChange={(phone) => onChange?.('+' + phone)}
      inputStyle={{
        width: '100%',
        height: size === 'large' ? 40 : 32,
        borderRadius: 6,
        fontSize: size === 'large' ? 16 : 14,
      }}
      buttonStyle={{ borderRadius: '6px 0 0 6px' }}
    />
  );
}
