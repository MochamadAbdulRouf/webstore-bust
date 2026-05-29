'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/Input';

interface GameSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: string | number;
}

export const GameSearch: React.FC<GameSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search games...',
  width = 200,
}) => {
  return (
    <Input
      as="input"
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      icon={<Search size={15} />}
      iconPosition="left"
      containerStyle={{ marginBottom: 0 }}
      style={{ width: width, paddingLeft: '2.25rem' }}
    />
  );
};

export default GameSearch;
