import React, { useEffect, useState } from 'react';

const getStageScale = (baseWidth, baseHeight) => {
  if (typeof window === 'undefined') return 1;

  const widthScale = window.innerWidth / baseWidth;
  const heightScale = window.innerHeight / baseHeight;

  return Math.min(widthScale, heightScale, 1);
};

const FixedStage = ({ baseWidth, baseHeight, children, className = '' }) => {
  const [scale, setScale] = useState(() => getStageScale(baseWidth, baseHeight));

  useEffect(() => {
    const updateScale = () => {
      setScale(getStageScale(baseWidth, baseHeight));
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    return () => window.removeEventListener('resize', updateScale);
  }, [baseWidth, baseHeight]);

  return (
    <div className={`flex w-full justify-center ${className}`}>
      <div
        className="relative"
        style={{
          width: baseWidth * scale,
          height: baseHeight * scale,
        }}
      >
        <div
          style={{
            width: baseWidth,
            height: baseHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default FixedStage;
