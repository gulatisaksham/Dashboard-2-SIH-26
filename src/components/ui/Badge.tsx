import React from 'react';

type BadgeVariant = 'stable' | 'monitor' | 'attention-needed';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, label }) => {
  let backgroundColor = '';
  switch (variant) {
    case 'stable':
      backgroundColor = '#276749'; // alertGreen
      break;
    case 'monitor':
      backgroundColor = '#B7791F'; // alertAmber
      break;
    case 'attention-needed':
      backgroundColor = '#C53030'; // alertRed
      break;
  }

  const style: React.CSSProperties = {
    backgroundColor,
    color: '#FFFFFF',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'inline-block',
  };

  return <span style={style}>{label}</span>;
};
