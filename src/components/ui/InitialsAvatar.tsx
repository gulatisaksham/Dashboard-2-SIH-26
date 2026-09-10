import React from 'react';

interface InitialsAvatarProps {
  initials: string;
  color: string;
  size?: number;
}

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({ initials, color, size = 40 }) => {
  const style: React.CSSProperties = {
    backgroundColor: color,
    color: '#FFFFFF',
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: `${size * 0.4}px`, // proportional to size
  };

  return <div style={style}>{initials}</div>;
};
