import { useStore } from '../../../store/store';
import { BundleCardA } from './bundle-cards/BundleCardA';
import { BundleCardB } from './bundle-cards/BundleCardB';
import { BundleCardC } from './bundle-cards/BundleCardC';
import { BundleCardD } from './bundle-cards/BundleCardD';

type BundleProduct = {
  id: string;
  name_ar?: string;
  name_en?: string;
  price: number;
  image_url?: string;
  images?: string[];
};

type BundleItem = {
  product_id: string;
  quantity: number;
  discount?: number;
  product?: BundleProduct;
};

export type BundleCardProduct = {
  id: string;
  name_ar?: string;
  name_en?: string;
  price: number;
  old_price?: number;
  image_url?: string;
  images?: string[];
  bundle_items?: BundleItem[];
};

interface BundleCardProps {
  prod: BundleCardProduct;
  rtl: boolean;
  onAdd?: (event: React.MouseEvent) => void;
}

export const VisualBundleCard = (props: BundleCardProps) => {
  const { bundleCardStyle } = useStore();

  switch (bundleCardStyle) {
    case 'B': return <BundleCardB {...props} />;
    case 'C': return <BundleCardC {...props} />;
    case 'D': return <BundleCardD {...props} />;
    default: return <BundleCardA {...props} />;
  }
};
