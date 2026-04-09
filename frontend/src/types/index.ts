export interface ElementPosition {
  x: number;
  y: number;
}

export interface HeroButton {
  text: string;
  url: string;
  style: 'primary' | 'outline';
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
}

export interface SlideStyles {
  titleFont?: string;
  titleColor?: string;
  subtitleFont?: string;
  subtitleColor?: string;
  buttonFont?: string;
  overlayColor?: string;
  overlayOpacity?: number;
}

export type SlideLayout = 'centered' | 'left' | 'right' | 'bottom-left' | 'bottom-center' | 'top-left';

export interface SlideCustomText {
  text: string;
  font?: string;
  color?: string;
  bgColor?: string;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  fontWeight?: 'normal' | 'semibold' | 'bold';
}

export interface HeroSlide {
  imageUrl: string;
  mobileImageUrl?: string;
  title: string;
  subtitle: string;
  buttons?: HeroButton[];
  /** @deprecated replaced by layout presets */
  positions?: {
    title?: ElementPosition;
    subtitle?: ElementPosition;
    buttons?: ElementPosition[];
  };
  styles?: SlideStyles;
  layout?: SlideLayout;
  customText?: SlideCustomText;
  type?: 'generic' | 'product';
  productId?: number;
  productSlug?: string;
  backgroundUrl?: string;
  mobileBackgroundUrl?: string;
}

/** @deprecated use HeroSlide[] — kept for backward compat with old single-object format */
export type HeroBanner = HeroSlide;

export interface Benefit {
  icon: string;
  customIcon?: string;
  title: string;
  description: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  cost: number;
}

export interface ServiceCard {
  icon: string;
  title: string;
  desc: string;
}

export interface ServicePageConfig {
  heroTitle: string;
  heroSubtitle: string;
  descTitle: string;
  descBody: string;
  servicesTitle: string;
  services: ServiceCard[];
  benefitsTitle: string;
  benefits: ServiceCard[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaWhatsappMessage: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqPageConfig {
  title: string;
  subtitle: string;
  items: FaqItem[];
}

export interface AboutPageConfig {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  highlights?: string[];
}

export interface ContactPageConfig {
  phones?: string[];
  mapsEmbed?: string;
  hours?: string;
}

export interface InstagramSection {
  title?: string;
  url?: string;
  username?: string;
}

export interface PromoBanner {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
  linkText?: string;
}

export interface SiteConfig {
  id: number;
  siteName: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
  socialLinks: Record<string, string>;
  theme: Record<string, string>;
  currency: string;
  heroSlides: HeroSlide[];
  benefits: Benefit[];
  shippingOptions: ShippingOption[];
  servicioTecnico?: ServicePageConfig;
  faq?: FaqPageConfig;
  aboutPage?: AboutPageConfig;
  contactPage?: ContactPageConfig;
  instagramSection?: InstagramSection;
  promoBanner?: PromoBanner;
  footerDescription?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  tenantId?: number | null;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Tenant {
  id: number;
  slug: string;
  domain: string | null;
  name: string;
  status: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
  _count?: { users: number; products: number; orders: number; categories?: number; coupons?: number };
  siteConfig?: SiteConfig | null;
  users?: AdminUser[];
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  tenantId: number | null;
  tenant?: { id: number; name: string; slug: string } | null;
  suspendedAt: string | null;
  suspendReason: string | null;
  lastLoginAt: string | null;
  activatedAt: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  entity: string;
  entityId: number | null;
  tenantId: number | null;
  details: Record<string, unknown>;
  ip: string;
  createdAt: string;
}

export interface PlatformStats {
  tenants: number;
  admins: number;
  orders: number;
  revenue: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  parentId: number | null;
  children?: Category[];
  _count?: { products: number };
}

export interface ProductImage {
  id: number;
  url: string;
  order: number;
}

export interface ProductVariant {
  id: number;
  name: string;
  value: string;
  priceAdjust: number;
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  stock: number;
  featured: boolean;
  active: boolean;
  categoryId: number;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
}

export interface CartItem {
  id: number | string;
  productId: number;
  variantId: number | null;
  quantity: number;
  product: Product;
  variant: ProductVariant | null;
}

export interface OrderItem {
  id: number;
  productId: number;
  variantId: number | null;
  quantity: number;
  unitPrice: number;
  product: Product;
  variant: ProductVariant | null;
}

export interface Order {
  id: number;
  userId: number | null;
  guestEmail?: string;
  guestName?: string;
  status: string;
  total: number;
  shippingAddress: Record<string, string>;
  shippingOption?: string;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItem[];
  user?: User;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  products?: T[];
  orders?: T[];
  total: number;
  page: number;
  pages: number;
}
