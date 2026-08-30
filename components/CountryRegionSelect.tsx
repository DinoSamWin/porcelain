"use client";

import { countryRegionOptions, priorityCountryRegions } from "@/lib/country-regions";

export function CountryRegionSelect({
  name = "country",
  required = false,
  defaultValue = ""
}: {
  name?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <select name={name} required={required} defaultValue={defaultValue}>
      <option value="" disabled>
        Select country / region
      </option>
      <optgroup label="China">
        {priorityCountryRegions.map((option) => (
          <option key={option.code} value={option.label}>
            {option.label}
          </option>
        ))}
      </optgroup>
      <optgroup label="All countries and regions">
        {countryRegionOptions.map((option) => (
          <option key={option.code} value={option.label}>
            {option.label}
          </option>
        ))}
      </optgroup>
    </select>
  );
}
