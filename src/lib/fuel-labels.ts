import type { MessageId } from "@/lib/i18n/catalog";
import { translate } from "@/lib/i18n/catalog";
import type { UiLocale } from "@/lib/i18n/locale-types";
import type { FuelPriceSource } from "@/types/vehicle";

function titleId(source: FuelPriceSource): MessageId {
  switch (source) {
    case "manual":
      return "fuel_title_manual";
    case "france_average":
      return "fuel_title_france";
    case "near_my_location":
      return "fuel_title_near";
    default:
      return "fuel_title_default";
  }
}

function detailId(source: FuelPriceSource): MessageId {
  switch (source) {
    case "manual":
      return "fuel_detail_manual";
    case "france_average":
      return "fuel_detail_france";
    case "near_my_location":
      return "fuel_detail_near";
    default:
      return "fuel_detail_manual";
  }
}

/** Short label for trust / transparency UI */
export function fuelPriceSourceTitle(
  source: FuelPriceSource,
  locale: UiLocale,
): string {
  return translate(locale, titleId(source));
}

/** One-line explanation for tooltips and footnotes */
export function fuelPriceSourceDetail(
  source: FuelPriceSource,
  locale: UiLocale,
): string {
  return translate(locale, detailId(source));
}
