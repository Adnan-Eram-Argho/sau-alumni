import "flag-icons/css/flag-icons.min.css";
import { getCountryCode } from "@/utils/countries";

// v6 fix: emoji flag Windows-e bhenge jay — SVG flag use kori
export default function CountryFlag({ country }: { country: string }) {
  const code = getCountryCode(country);

  if (!code) {
    return <span aria-hidden="true">🌍</span>;
  }

  return (
    <span
      className={`fi fi-${code} inline-block h-3.5 w-[1.15rem] rounded-[2px]`}
      aria-hidden="true"
    />
  );
}