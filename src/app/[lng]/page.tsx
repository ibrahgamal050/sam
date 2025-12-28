// app/(sites)/[lng]/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
import { MainNav } from "@/components/ar/header/main-nav"
import { MobileLayout } from "@/components/ar/mobile-layout"
import {RestaurantHome} from "@/components/ar/RestaurantHome" // غيّر المسار حسب مشروعك

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlockRenderer from "@/components/cms/BlockRenderer";
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context";
import { getRootDomain, resolveRestaurantHost } from "@/lib/host-utils";
import { getPageBySlug } from "@/lib/services/page-service";
import { getPageBuilderSections, sortSections } from "@/lib/builder-sections";
import { toBranchSummary, type BranchSummary } from "@/lib/branch-utils";
import { flattenMenuItems, flattenMenuPayload, getMenuByRestaurantId, type MenuItemSummary } from "@/lib/services/menu-service";

import type { IPage } from "@/types/page";
import type { AnyBlock } from "@/types/blocks";
import type { IRestaurant } from "@/types/restaurant";
import { renderSection, type Section } from "@/types/builder";

const VALID_LOCALES = ["ar", "en"] as const;
type Locale = (typeof VALID_LOCALES)[number];
const PAGE_SLUG = "home";

type RouteParams = {
  params: Promise<{
    lng: string;
  }>;
  searchParams?: Promise<Record<string, string | string[]>>;
};

const resolveLocale = (value?: string): Locale => {
  if (!value) return "ar";
  const normalized = value.toLowerCase();
  return (VALID_LOCALES as readonly string[]).includes(normalized as any)
    ? (normalized as Locale)
    : "ar";
};

const resolveProtocol = (hostHeader: string): "http" | "https" => {
  const normalized = hostHeader.toLowerCase();
  return normalized.includes("localhost") || normalized.includes("127.0.0.1") ? "http" : "https";
};

type LoadedHomeData =
  | {
      restaurant: IRestaurant;
      page: IPage | null;
      hostHeader: string;
      locale: Locale;
      branches: BranchSummary[];
      menuItems: MenuItemSummary[];
      menu?: any;
    }
  | {
      restaurant: null;
      page: null;
      hostHeader: string;
      locale: Locale;
      branches: BranchSummary[];
      menuItems: MenuItemSummary[];
      menu?: any;
    };

async function fetchBranches(subdomainOrSlug: string, hostHeader: string): Promise<BranchSummary[]> {
  const protocol = resolveProtocol(hostHeader);
  const url = `${protocol}://${hostHeader}/api/restaurants/${subdomainOrSlug}/branches`;
  const res = await fetch(url, { cache: "no-store" }).catch(() => null);
  if (!res?.ok) return [];
  const data = await res.json().catch(() => null);
  if (!Array.isArray(data)) return [];
  return data.map((item) => toBranchSummary(item));
}

async function fetchMenuItems(subdomainOrSlug: string, hostHeader: string): Promise<MenuItemSummary[]> {
  const protocol = resolveProtocol(hostHeader);
  const url = `${protocol}://${hostHeader}/api/restaurants/${subdomainOrSlug}/menu`;
  const res = await fetch(url, { cache: "no-store" }).catch(() => null);
  if (!res?.ok) return [];
  const data = await res.json().catch(() => null);
  return flattenMenuPayload(data);
}

const normalizeRestaurantBranches = (restaurant?: IRestaurant | null): BranchSummary[] => {
  const raw = (restaurant as any)?.branches;
  if (!Array.isArray(raw)) return [];
  return raw.map((b) => toBranchSummary(b));
};

// تحميل بيانات الصفحة الرئيسية من الهيدر + الـ DB
async function loadHomeData(locale: Locale): Promise<LoadedHomeData> {
  const { restaurant, hostHeader } = await resolveRestaurantFromHeaders();

  if (!restaurant) {
    return { restaurant: null, page: null, hostHeader, locale, branches: [], menuItems: [] };
  }

  const restaurantId = restaurant._id?.toString?.();
  if (!restaurantId) {
    return { restaurant: restaurant as IRestaurant, page: null, hostHeader, locale, branches: [], menuItems: [] };
  }

  const page = await getPageBySlug(restaurantId, PAGE_SLUG, locale);
  const subOrSlug =
    restaurant.subdomain?.toLowerCase?.() || restaurant.slug?.toLowerCase?.() || restaurantId;
  const apiBranches = await fetchBranches(subOrSlug, hostHeader);
  const fallbackBranches = !apiBranches.length ? normalizeRestaurantBranches(restaurant) : [];
  const branches = apiBranches.length ? apiBranches : fallbackBranches;
  const apiMenuItems = await fetchMenuItems(subOrSlug, hostHeader);
  const menu = !apiMenuItems.length ? await getMenuByRestaurantId(restaurantId).catch(() => null) : null;
  const menuItems = apiMenuItems.length ? apiMenuItems : flattenMenuItems(menu);
  return {
    restaurant: restaurant as IRestaurant,
    page: page ?? null,
    hostHeader,
    locale,
    branches,
    menuItems,
    menu,
  };
  
} 

// تحويل الـ components/sections في الـ Page → AnyBlock[] لبلوك ريندرر
function mapPageToBlocks(page: IPage | null | undefined): AnyBlock[] {
  if (!page) return [];

  const rawComponents: any[] =
    (Array.isArray((page as any).components) && (page as any).components) ||
    (Array.isArray((page as any).sections) && (page as any).sections) ||
    [];

  return rawComponents
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((component) => {
      const type = component.type as AnyBlock["type"];
      if (!type) return null;
      return {
        id: component.component_id || component.id || component.type,
        type,
        ...(component.props ?? component), // يدعم التخزين مباشرة أو داخل props
      } as AnyBlock;
    })
    .filter(Boolean) as AnyBlock[];
}

export default async function HomeRoute({ params, searchParams }: RouteParams) {
  const { lng } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const locale = resolveLocale(lng);
  const { restaurant, page, hostHeader, branches, menuItems, menu } = await loadHomeData(locale);
let typedRestaurant: IRestaurant | null = null
  // لازم يبقى في مطعم (من السب-دومين أو الدومين المخصص)
  if (!restaurant) {
    // ممكن تختار notFound() بدل fallback حسب رغبتك
    return notFound();
  }

  // حدّد السلاج (subdomain) واستخدمه في الثيم/التخصيص
  const builderSections = getPageBuilderSections(page);
  const builderTheme = page?.theme;

  const direction = locale === "ar" ? "rtl" : "ltr";
  const accent = builderTheme?.palette?.primary ?? "#16a34a";

  if (builderSections?.length) {
    const orderedSections = sortSections(builderSections);
    return (
       <> <MainNav /> 
        <MobileLayout restaurant={restaurant}>
      <main dir={direction} className="min-h-screen bg-neutral-50 text-stone-900">
        <div className="h-1 w-full" style={{ backgroundColor: accent }} />
        {orderedSections.map((section) =>
          renderSection(section, {
            theme: builderTheme,
            dataSources: { branches, menuItems, menu },
            locale,
            searchParams: resolvedSearchParams,
          })
        )}
      </main>
      </MobileLayout>
        </>
    );
  }

  const cmsBlocks = mapPageToBlocks(page);

  return (
    <main dir={direction} className="min-h-screen bg-neutral-50 text-stone-900">
      <div className="h-1 w-full" style={{ backgroundColor: accent }} />
      {cmsBlocks.length > 0 ? (
        <BlockRenderer blocks={cmsBlocks} />
      ) : (
        <> <MainNav /> 
        <MobileLayout restaurant={restaurant}>
 <RestaurantHome
            restaurant={restaurant}
          />
          </MobileLayout></>
                )}
    </main>
  );
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { lng } = await params;
  const locale = resolveLocale(lng);
  const { restaurant, page, hostHeader } = await loadHomeData(locale);

  if (!restaurant) {
    return {
      title: locale === "ar" ? "غير متاح" : "Unavailable",
      description:
        locale === "ar"
          ? "هذه الصفحة غير متاحة حاليًا."
          : "This page is currently unavailable.",
    };
  }

  const resolvedHost = resolveRestaurantHost(restaurant, hostHeader, getRootDomain());
  const protocol = resolveProtocol(hostHeader);

  // في الهوم بنخلي الكانونيكال على /[lng] فقط (بدون /home)
  const basePath = `/${locale}`;
  const canonicalUrl = page?.seo?.canonical_url ?? `${protocol}://${resolvedHost}${basePath}`;

  // بناء العنوان والوصف حسب أولوية: page.seo → restaurant → fallback
  const rName =
    (typeof restaurant.name === "object"
      ? restaurant.name?.[locale] ?? restaurant.name?.ar ?? restaurant.name?.en
      : restaurant.name) ?? "Meelza";

  const rDesc =
    (typeof restaurant.description === "object"
      ? restaurant.description?.[locale] ?? restaurant.description?.ar ?? restaurant.description?.en
      : restaurant.description) ?? "";

  const title = page?.seo?.title ?? rName;
  const description = page?.seo?.description ?? rDesc;

  const keywords =
    (page?.seo?.keywords && page.seo.keywords.length > 0
      ? page.seo.keywords
      : [
          locale === "ar" ? "مطعم" : "Restaurant",
          rName,
        ].filter(Boolean as any)) ?? [];

  const ogImage = page?.seo?.og_image || restaurant.logo || "/placeholder.svg?height=400&width=800";

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page?.seo?.og_title ?? title,
      description: page?.seo?.og_description ?? description,
      images: [ogImage],
      type: page?.seo?.og_type ?? "website",
      url: canonicalUrl,
      siteName: rName,
      locale: locale === "ar" ? "ar_EG" : "en_US",
    },
    twitter: {
      card: page?.seo?.twitter_card ?? "summary_large_image",
      title: page?.seo?.twitter_title ?? title,
      description: page?.seo?.twitter_description ?? description,
      images: page?.seo?.twitter_image ? [page.seo.twitter_image] : [ogImage],
    },
  };
}
