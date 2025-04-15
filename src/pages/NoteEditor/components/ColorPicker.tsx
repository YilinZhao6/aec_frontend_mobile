import React, { useState, useRef, useEffect } from 'react';
import { Type } from 'lucide-react';

interface Color {
  name: string;
  color: string;
  isNone?: boolean;
}

interface ColorPickerProps {
  colors: Color[];
  activeColor: Color;
  onChange: (color: Color) => void;
  icon: typeof Type;
  label: string;
  isHighlight?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  activeColor,
  onChange,
  icon: Icon,
  label,
  isHighlight = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded hover:bg-gray-100 relative group ${
          activeColor.color !== 'inherit' && !activeColor.isNone ? 'bg-gray-100' : ''
        }`}
        title={label}
      >
        <Icon className="w-4 h-4" />
        <div 
          className="w-2 h-2 rounded-full absolute bottom-1 right-1"
          style={{ 
            backgroundColor: activeColor.color !== 'inherit' ? activeColor.color : undefined,
            border: activeColor.isNone ? '1px solid #D1D5DB' : undefined
          }}
        />
      </button>

      {isOpen && (
        <div className="color-picker-dropdown">
          <div className="grid grid-cols-4 gap-1 p-1" style={{ width: '120px' }}>
            {colors.map((color, index) => (
              <button
                key={index}
                onClick={() => {
                  onChange(color);
                  setIsOpen(false);
                }}
                className="w-6 h-6 rounded hover:scale-110 transition-transform relative"
                style={{ 
                  backgroundColor: color.color,
                  border: color.isNone ? '1px solid #D1D5DB' : isHighlight ? '1px solid rgba(0,0,0,0.1)' : undefined
                }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;