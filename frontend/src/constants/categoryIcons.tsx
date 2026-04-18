import {
  Trash2, GlassWater, ShoppingBag,
  Pizza, Box, CircleDot, Layout, Layers,
  Droplets, Coffee, Utensils, Zap, Palette,
  Briefcase, Archive, Container, CupSoda,
  Tag, ShieldCheck, Hand, UtensilsCrossed, FileText, BoxSelect, Package
} from 'lucide-react';
import type { ReactNode } from 'react';

export const CATEGORY_ICONS: Record<string, ReactNode> = {
  'cat-can-plastic':       <Container size={18} />,
  'cat-can-plastic-cups':  <CupSoda size={18} />,
  'cat-general-cups':      <GlassWater size={18} />,
  'cat-single-cups-1c':   <Zap size={18} />,
  'cat-single-cups-2c':   <Palette size={18} />,
  'cat-fabric-bags':       <ShoppingBag size={18} />,
  'cat-kraft-bags':        <Briefcase size={18} />,
  'cat-pizza-boxes':       <Pizza size={18} />,
  'cat-paper-boxes':       <Box size={18} />,
  'cat-paper-box-item':    <Archive size={18} />,
  'cat-lids':              <CircleDot size={18} />,
  'cat-cup-holders':       <Layout size={18} />,
  'cat-sandwich-covers':   <Layers size={18} />,
  'cat-plastic-cups-1c':  <Droplets size={18} />,
  'cat-plastic-cups-2c':  <Coffee size={18} />,
  'cat-double-paper-cups': <Container size={18} />,
  'cat-cutlery-covers':    <Utensils size={18} />,
  'cat-consumables':       <Trash2 size={18} />,
  'cat-disposables':       <Package size={18} />,
  'cat-metal-cups':        <CupSoda size={18} />,
  'cat-tamper-evident':    <ShieldCheck size={18} />,
  'cat-gloves':            <Hand size={18} />,
  'cat-takeout-bags':      <ShoppingBag size={18} />,
  'cat-food-labels':       <Tag size={18} />,
  'cat-chopsticks':        <UtensilsCrossed size={18} />,
  'cat-guest-checks':      <FileText size={18} />,
  'cat-glove-dispensers':  <BoxSelect size={18} />,
};
