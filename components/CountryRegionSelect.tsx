"use client";

import { Check, Search } from "lucide-react";
import { KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { allCountryRegionOptions } from "@/lib/country-regions";

const maxVisibleOptions = 18;

export function CountryRegionSelect({
  name = "country",
  required = false,
  defaultValue = ""
}: {
  name?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const exactOption = useMemo(
    () => allCountryRegionOptions.find((option) => option.label.toLowerCase() === query.trim().toLowerCase()),
    [query]
  );

  const filteredOptions = useMemo(() => {
    const searchWords = normalizeSearch(query).split(/\s+/).filter(Boolean);

    if (searchWords.length === 0) {
      return allCountryRegionOptions.slice(0, maxVisibleOptions);
    }

    return allCountryRegionOptions
      .filter((option) => {
        const searchText = normalizeSearch(`${option.label} ${option.code} ${option.alpha3} ${option.m49}`);
        return searchWords.every((word) => searchText.includes(word));
      })
      .slice(0, maxVisibleOptions);
  }, [query]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    if (!required || exactOption) {
      input.setCustomValidity("");
      return;
    }

    input.setCustomValidity(query.trim() ? "Please select a country / region from the list." : "Please select a country / region.");
  }, [exactOption, query, required]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function selectOption(label: string) {
    setQuery(label);
    setOpen(false);
    inputRef.current?.setCustomValidity("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, Math.max(filteredOptions.length - 1, 0)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter" && open && filteredOptions[activeIndex]) {
      event.preventDefault();
      selectOption(filteredOptions[activeIndex].label);
    }
  }

  return (
    <div className="country-region-select" ref={wrapperRef}>
      <div className="country-region-select__field">
        <Search size={15} aria-hidden="true" />
        <input
          ref={inputRef}
          name={name}
          required={required}
          type="search"
          value={query}
          placeholder="Search country / region"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {open ? (
        <div className="country-region-select__list" id={listId} role="listbox">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                aria-selected={option.label === exactOption?.label}
                className={`country-region-select__option${index === activeIndex ? " is-active" : ""}`}
                key={option.code}
                role="option"
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectOption(option.label);
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span>{option.label}</span>
                {option.label === exactOption?.label ? <Check size={15} aria-hidden="true" /> : null}
              </button>
            ))
          ) : (
            <p className="country-region-select__empty">No matching country / region</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
