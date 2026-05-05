import React from 'react';

const ProductSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
      <div className="relative aspect-square bg-bg-elevated/50" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-bg-elevated/50 rounded w-3/4" />
        <div className="h-3 bg-bg-elevated/50 rounded w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 bg-bg-elevated/50 rounded w-20" />
          <div className="h-8 w-8 bg-bg-elevated/50 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
