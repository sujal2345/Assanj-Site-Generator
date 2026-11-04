import {
  Award, BadgeCheck, BatteryCharging, Building2, Calculator, Clock, FileText, Factory, Gauge, Handshake, HardHat, Home, IndianRupee,
  Leaf, LucideIcon, MessageCircle, Phone, Receipt, Settings, ShieldCheck, Star, Sun, ThumbsUp, TrendingUp, Users, Wallet, Wrench, Zap,
  Banknote, ClipboardCheck, Headphones, MapPin, Mail, PiggyBank, Sparkles, Trophy, Lightbulb, CircleDollarSign,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  sun: Sun, zap: Zap, leaf: Leaf, wallet: Wallet, "trending-up": TrendingUp, "shield-check": ShieldCheck, "badge-check": BadgeCheck,
  award: Award, star: Star, home: Home, building: Building2, factory: Factory, battery: BatteryCharging, wrench: Wrench, settings: Settings,
  users: Users, handshake: Handshake, "hard-hat": HardHat, clock: Clock, gauge: Gauge, "thumbs-up": ThumbsUp, rupee: IndianRupee,
  receipt: Receipt, calculator: Calculator, phone: Phone, "message-circle": MessageCircle, "file-text": FileText, banknote: Banknote,
  clipboard: ClipboardCheck, headphones: Headphones, "map-pin": MapPin, mail: Mail, "piggy-bank": PiggyBank, sparkles: Sparkles,
  trophy: Trophy, lightbulb: Lightbulb, dollar: CircleDollarSign,
};
export const ICON_NAMES = Object.keys(ICONS);
export const getIcon = (name: string): LucideIcon => ICONS[name] ?? Sun;
