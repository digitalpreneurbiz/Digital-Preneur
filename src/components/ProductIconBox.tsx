import React from 'react';
import {
  Coffee,
  CupSoda,
  UtensilsCrossed,
  Croissant,
  Package,
  ShoppingBag,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { ProductCategory, ProductIconKey } from '../types/finance';

interface ProductIconBoxProps {
  icon: ProductIconKey;
  category: ProductCategory;
  size?: 'sm' | 'md' | 'lg';
}

const CATEGORY_TINTS: Record<ProductCategory, string> = {
  Minuman: 'bg-[#EEF5F3] text-[#14534B]',
  Makanan: 'bg-[#F5F3EE] text-[#7A541E]',
  Retail: 'bg-[#EEF2F6] text-[#1E4761]',
  Jasa: 'bg-[#F2F0F7] text-[#49386E]',
};

export const ProductIconBox: React.FC<ProductIconBoxProps> = ({
  icon,
  category,
  size = 'md',
}) => {
  const iconClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';
  const boxClass =
    size === 'sm'
      ? 'w-9 h-9 rounded-lg'
      : size === 'lg'
        ? 'w-14 h-14 rounded-2xl'
        : 'w-11 h-11 rounded-xl';

  const renderIcon = () => {
    switch (icon) {
      case 'coffee':
        return <Coffee className={iconClass} strokeWidth={1.8} />;
      case 'cup':
        return <CupSoda className={iconClass} strokeWidth={1.8} />;
      case 'utensils':
        return <UtensilsCrossed className={iconClass} strokeWidth={1.8} />;
      case 'croissant':
        return <Croissant className={iconClass} strokeWidth={1.8} />;
      case 'package':
        return <Package className={iconClass} strokeWidth={1.8} />;
      case 'bag':
        return <ShoppingBag className={iconClass} strokeWidth={1.8} />;
      case 'sparkles':
        return <Sparkles className={iconClass} strokeWidth={1.8} />;
      case 'wrench':
        return <Wrench className={iconClass} strokeWidth={1.8} />;
      default:
        return <Package className={iconClass} strokeWidth={1.8} />;
    }
  };

  return (
    <div
      className={`${boxClass} ${CATEGORY_TINTS[category]} flex items-center justify-center shrink-0`}
    >
      {renderIcon()}
    </div>
  );
};
