import React, { useEffect, useState, useMemo } from "react";
import {
  Check,
  ChevronsUpDown,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Command, CommandInput } from "./command";
import { cn } from "@/lib/utils";

import { getAllVendorsApi, createVendorsApi } from "@/services/vendorService";
import { getAllCategoriesApi } from "@/services/categoriesService";
import {
  createProductTags,
  createProductTypes,
  getAllFilteredProducts,
  getAllProducts,
  getAllProductTags,
  getAllProductTypesApi,
} from "@/services/productService";
import {
  createCollections,
  getAllCollectionsApi,
} from "@/services/collectionService";

const FIELD_CONFIGS = {
  product: {
    fetch: getAllProducts,
    create: null,
    labelKey: "title",
    valueKey: "product_id",
    placeholder: "Select products...",
    displayName: "Products",
  },
  vendor: {
    fetch: getAllVendorsApi,
    create: createVendorsApi,
    labelKey: "vendor_name",
    valueKey: "vendor_id",
    placeholder: "Select vendor...",
    displayName: "Vendor",
  },
  category: {
    fetch: getAllCategoriesApi,
    create: null,
    labelKey: "category_name",
    valueKey: "category_id",
    placeholder: "Select category...",
    displayName: "Category",
  },
  collections: {
    fetch: getAllCollectionsApi,
    create: createCollections,
    labelKey: "title",
    valueKey: "collection_id",
    placeholder: "Select collection...",
    displayName: "Collection",
  },
  tag: {
    fetch: getAllProductTags,
    create: createProductTags,
    labelKey: "tag_name",
    valueKey: "tag_id",
    placeholder: "Select tags...",
    displayName: "Tag",
  },
  productType: {
    fetch: getAllProductTypesApi,
    create: createProductTypes,
    labelKey: "product_type_name",
    valueKey: "product_type_id",
    placeholder: "Select type...",
    displayName: "Type",
  },
};

export const CustomDropdown = ({
  fieldType,
  name,
  value,
  onChange,
  onBlur,
  label,
  error,
  touched,
  helpText,
  containerClass,
  disabled,
  isViewMode = false,
  isAddNew,
  isMulti = false,

  options,
  optionLabelKey,
  optionValueKey,
  onCustomCreate,
  isLoading,
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [history, setHistory] = useState([]);

  // 🔥 Check if direct mode (options provided)
  const isDirectMode = options !== undefined;

  // Get config based on mode
  const config = useMemo(() => {
    if (isDirectMode) {
      // Direct mode config
      return {
        fetch: null,
        create: onCustomCreate || null,
        labelKey: optionLabelKey || "label",
        valueKey: optionValueKey || "value",
        placeholder: "Select option...",
        displayName: label || "Option",
      };
    }
    // Config mode - original behavior
    return FIELD_CONFIGS[fieldType] || {};
  }, [
    isDirectMode,
    fieldType,
    options,
    optionLabelKey,
    optionValueKey,
    onCustomCreate,
    label,
  ]);

  const showError = touched && error;
  const isLocked = isViewMode || disabled;

  // Fetch data based on mode
  useEffect(() => {
    if (isDirectMode) {
      // Direct mode: use provided options
      setRawData(options || []);
      return;
    }

    // Config mode: fetch from API
    const fetchData = async () => {
      if (!config.fetch) return;
      setLoading(true);
      try {
        const res = await config.fetch();
        setRawData(res?.data?.data || []);
      } catch (err) {
        console.error(`Error fetching ${fieldType}:`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [config, fieldType, isDirectMode, options]);

  // Update rawData when options change in direct mode
  useEffect(() => {
    if (isDirectMode && options) {
      setRawData(options);
    }
  }, [isDirectMode, options]);

  const activeLevel = useMemo(() => {
    return history.length > 0 ? history[history.length - 1].children : rawData;
  }, [history, rawData]);

  const handleSelect = (itemId) => {
    if (isLocked) return;

    if (isMulti) {
      let newValue = Array.isArray(value) ? [...value] : [];

      if (newValue.includes(itemId)) {
        newValue = newValue.filter((v) => v !== itemId);
      } else {
        newValue.push(itemId);
      }

      onChange(name, newValue);
    } else {
      onChange(name, itemId);
      setOpen(false);
      setHistory([]);
    }
  };

  const handleClear = (e) => {
    if (isLocked) return;

    e.preventDefault();
    e.stopPropagation();
    onChange(name, isMulti ? [] : "");
    setHistory([]);
    setSearchValue("");
  };

  const handleCreate = async () => {
    if (!searchValue || !config.create || isLocked) return;

    setIsCreating(true);
    try {
      let newItem;

      if (isDirectMode && onCustomCreate) {
        // Direct mode: call custom create handler
        newItem = await onCustomCreate(searchValue);
      } else if (config.create) {
        // Config mode: use API create
        const payload = { [config.labelKey]: searchValue };
        const res = await config.create(payload);
        newItem = res?.data?.data;
      }

      if (newItem) {
        setRawData((prev) => [...prev, newItem]);
        handleSelect(newItem[config.valueKey]);
        setSearchValue("");
      }
    } catch (error) {
      console.error(`Error creating ${fieldType || "option"}:`, error);
    } finally {
      setIsCreating(false);
    }
  };

  const getSelectedLabel = () => {
    const isLoadingState = isDirectMode ? isLoading : loading;
    if (isLoadingState) return "Loading...";

    if (!value || (isMulti && value.length === 0)) {
      return config.placeholder;
    }

    // Helper to find path in nested structure
    const findPath = (data, targetId, path = []) => {
      for (const item of data) {
        const newPath = [...path, item];

        if (String(item[config.valueKey]) === String(targetId)) {
          return newPath;
        }

        if (item.children && Array.isArray(item.children)) {
          const found = findPath(item.children, targetId, newPath);
          if (found) return found;
        }
      }
      return null;
    };

    // Multi-select case
    if (isMulti) {
      const labels = [];

      value.forEach((val) => {
        const path = findPath(rawData, val);
        if (!path) return;

        const selected = path[path.length - 1];
        const parent = path.length > 1 ? path[path.length - 2] : null;

        if (parent) {
          labels.push(
            `${selected[config.labelKey]} in ${parent[config.labelKey]}`,
          );
        } else {
          labels.push(selected[config.labelKey]);
        }
      });

      if (labels.length > 2) {
        return `${labels.length} selected`;
      }

      return labels.join(", ");
    }

    // Single select case
    const path = findPath(rawData, value);
    if (!path) return config.placeholder;

    const selected = path[path.length - 1];
    const parent = path.length > 1 ? path[path.length - 2] : null;

    if (!parent) return selected[config.labelKey];

    return {
      parent: parent[config.labelKey],
      child: selected[config.labelKey],
    };
  };

  const displayItems = useMemo(() => {
    if (!searchValue) return activeLevel;

    const flatten = (data) => {
      if (!Array.isArray(data)) return [];
      return data.reduce((acc, item) => {
        acc.push(item);
        if (item.children && Array.isArray(item.children)) {
          acc.push(...flatten(item.children));
        }
        return acc;
      }, []);
    };

    const flattened = flatten(rawData);
    return flattened
      .filter((item) =>
        String(item[config.labelKey] || "")
          .toLowerCase()
          .includes(searchValue.toLowerCase()),
      )
      .slice(0, 50);
  }, [activeLevel, searchValue, rawData, config.labelKey]);

  const currentLoading = isDirectMode ? isLoading : loading;

  return (
    <div className={cn("space-y-1.5 w-full", containerClass)}>
      {label && (
        <label className="text-xs font-medium text-gray-600">{label}</label>
      )}

      <div
        className={cn(
          "flex items-center rounded-lg border bg-white overflow-hidden",
          showError ? "border-red-500 bg-red-50" : "border-gray-300",
          isLocked && "cursor-default",
        )}
      >
        <Popover
          open={isLocked ? false : open}
          onOpenChange={(val) => {
            if (isLocked) return;
            setOpen(val);
            if (!val) {
              setHistory([]);
              setSearchValue("");
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              role="combobox"
              onBlur={onBlur}
              disabled={isLocked}
              className={cn(
                "justify-between w-full h-10 px-3 font-normal hover:bg-transparent",
                isLocked && "pointer-events-none cursor-default opacity-70",
              )}
            >
              <span className={cn("truncate", !value && "text-gray-400")}>
                {(() => {
                  const labelValue = getSelectedLabel();

                  if (typeof labelValue === "string") {
                    return <span className="truncate">{labelValue}</span>;
                  }

                  return (
                    <span className="truncate">
                      <span className="text-gray-400">
                        {labelValue.child} in {labelValue.parent}
                      </span>
                    </span>
                  );
                })()}
              </span>

              <div className="flex items-center gap-1 shrink-0">
                {value &&
                  (!isMulti ? value : value?.length > 0) &&
                  !isLocked &&
                  !currentLoading && (
                    <div
                      role="button"
                      onClick={handleClear}
                      className="p-1 mr-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                    </div>
                  )}
                {!isLocked && <ChevronsUpDown className="w-4 h-4 opacity-50" />}
              </div>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] shadow-xl bg-white border border-gray-200">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={`Search ${config.displayName}...`}
                value={searchValue}
                onValueChange={setSearchValue}
                readOnly={isLocked}
              />

              <div className="overflow-y-auto max-h-72">
                {/* Add New option */}
                {isAddNew &&
                  config.create &&
                  searchValue &&
                  displayItems.length === 0 && (
                    <div className="p-2 border-b border-gray-50">
                      <Button
                        type="button"
                        variant="secondary"
                        className="justify-start w-full gap-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                        onClick={handleCreate}
                        disabled={isCreating}
                      >
                        {isCreating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        Add new "{searchValue}"
                      </Button>
                    </div>
                  )}

                {/* Back button for nested navigation */}
                {!searchValue && history.length > 0 && (
                  <div className="px-3 py-2 border-b bg-gray-50">
                    <div
                      className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer"
                      onClick={(e) => {
                        if (isLocked) return;
                        e.stopPropagation();
                        setHistory((prev) => prev.slice(0, -1));
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>
                        {history.length > 1
                          ? history[history.length - 2][config.labelKey]
                          : "All"}
                      </span>
                    </div>

                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {history[history.length - 1][config.labelKey]}
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {currentLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                )}

                {/* Items list */}
                {!currentLoading &&
                  displayItems.map((item) => {
                    const isSelected = isMulti
                      ? value?.includes(item[config.valueKey])
                      : String(value) === String(item[config.valueKey]);

                    const hasChildren =
                      !searchValue && item.children?.length > 0;

                    return (
                      <div
                        key={item[config.valueKey]}
                        className={cn(
                          "group flex items-center justify-between px-3 py-1 border-b border-gray-50",
                          !isLocked &&
                            "cursor-pointer hover:bg-emerald-600 hover:text-white",
                        )}
                      >
                        <div
                          className="flex items-center flex-1 gap-2 text-sm"
                          onClick={() => handleSelect(item[config.valueKey])}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-emerald-600 group-hover:text-white" />
                          )}
                          <span>{item[config.labelKey]}</span>
                        </div>

                        {hasChildren && (
                          <ChevronRight
                            className="w-4 h-4 text-gray-400 cursor-pointer"
                            onClick={(e) => {
                              if (isLocked) return;
                              e.stopPropagation();
                              setHistory((prev) => [...prev, item]);
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
              </div>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {showError && <p className="text-xs text-red-600">⚠ {error}</p>}
      {!showError && helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};
