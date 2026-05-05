import React from 'react';

const ProductSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="relative aspect-square bg-bg-elevated overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-bg-elevated/50 rounded w-3/4 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <div className="h-3 bg-bg-elevated/50 rounded w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 bg-bg-elevated/50 rounded w-20 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          <div className="h-8 w-8 bg-bg-elevated/50 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
