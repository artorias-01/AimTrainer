import React, { useState, useEffect } from 'react';
import { isValidHexColor, normalizeHexColor } from '../../utils/crosshairImporter';

interface HexColorInputProps {
  value: string;
  onChange: (hex: string) => void;
  className?: string;
  placeholder?: string;
}

export const HexColorInput: React.FC<HexColorInputProps> = ({
  value,
  onChange,
  className,
  placeholder,
}) => {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDraft(val);
    if (isValidHexColor(val)) {
      onChange(normalizeHexColor(val));
    }
  };

  const handleBlur = () => {
    if (isValidHexColor(draft)) {
      const normalized = normalizeHexColor(draft);
      setDraft(normalized);
      onChange(normalized);
    } else {
      setDraft(value);
    }
  };

  const isValid = isValidHexColor(draft);

  return (
    <input
      type="text"
      value={draft}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder || '#RRGGBB'}
      className={
        className ||
        `w-28 bg-[#141414] border ${
          !isValid && draft.length > 0 ? 'border-red-500' : 'border-[#262626]'
        } rounded-[8px] px-3 py-1 text-xs font-mono uppercase text-white font-bold focus:outline-none focus:border-white transition-colors`
      }
    />
  );
};
