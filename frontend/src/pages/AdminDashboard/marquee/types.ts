export interface MarqueeLogo {
  id: string;
  image_url: string;
  name_ar: string;
  name_en: string;
  strip: string;
  order_index: number;
  type: string;
  text_ar: string;
  text_en: string;
  color: string;
  background_color: string;
  speed: number;
}

export interface SvgMarqueeSettings {
  id: string;
  left_text_1: string;
  left_text_2: string;
  right_text_1: string;
  right_text_2: string;
  text_color: string;
  animation_duration: number;
  show_can: boolean;
  show_bg_svg: boolean;
  can_image_url: string | null;
  can_size: number;
  font_family: string;
  enabled: boolean;
}

export interface MarqueeSettings {
  id: string;
  enabled: boolean;
}

export interface SvgMarqueeItem {
  id: string;
  svg_marquee_id: string;
  type: string;
  image_url: string | null;
  text_ar: string | null;
  text_en: string | null;
  strip: string;
  order_index: number;
}
