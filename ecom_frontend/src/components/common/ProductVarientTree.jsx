import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";

export const ProductVariantTree = ({
  tree,
  level = 0,
  formik,
  openMap,
  setOpenMap,
  path = "",
  isViewMode = false,
}) => {
  const [localOpenMap, setLocalOpenMap] = useState({});

  const getOpenMap = () => openMap || localOpenMap;
  const setOpenMapState = (newMap) => {
    if (setOpenMap) {
      setOpenMap(newMap);
    } else {
      setLocalOpenMap(newMap);
    }
  };

  /* ---------------- HELPERS ---------------- */

  const updateChildren = (node, value) => {
    if (node.__variant) node.__variant.isActive = value;

    Object.values(node.__children).forEach((child) =>
      updateChildren(child, value),
    );
  };

  const isAllSelected = (node) => {
    let all = true;

    const check = (n) => {
      if (n.__variant && !n.__variant.isActive) all = false;
      Object.values(n.__children).forEach(check);
    };

    check(node);
    return all;
  };

  const getPriceRange = (node) => {
    let prices = [];

    const collect = (n) => {
      if (
        n.__variant &&
        n.__variant.price !== "" &&
        n.__variant.price !== "0"
      ) {
        prices.push(Number(n.__variant.price));
      }
      Object.values(n.__children).forEach(collect);
    };

    collect(node);

    if (!prices.length) return "-";

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
  };

  const getStockSum = (node) => {
    let total = 0;

    const collect = (n) => {
      if (n.__variant && n.__variant.inventory_quantity !== "") {
        total += Number(n.__variant.inventory_quantity || 0);
      }
      Object.values(n.__children).forEach(collect);
    };

    collect(node);
    return total;
  };

  const getChildCount = (node) => {
    let count = 0;

    const countChildren = (n) => {
      if (n.__variant) count++;
      Object.values(n.__children).forEach(countChildren);
    };

    countChildren(node);
    return count;
  };

  const flattenVariants = (node) => {
    let list = [];

    const collect = (n) => {
      if (n.__variant) list.push(n.__variant);
      Object.values(n.__children).forEach(collect);
    };

    collect(node);
    return list;
  };

  const updateVariantField = (variant, field, value) => {
    variant[field] = value;

    // If price or inventory changes, update the parent variant object
    formik.setFieldValue("variants", [...formik.values.variants]);
  };

  /* ---------------- RENDER ---------------- */

  return Object.entries(tree).map(([key, node]) => {
    const hasChildren = Object.keys(node.__children).length > 0;
    const currentPath = path ? `${path}-${key}` : key;
    const currentOpenMap = getOpenMap();
    const isOpen = currentOpenMap[currentPath] ?? false;

    const flatVariants = flattenVariants(node);

    return (
      <React.Fragment key={currentPath}>
        {/* ---------------- PARENT ROW ---------------- */}
        <tr className="transition hover:bg-gray-50">
          {/* Checkbox */}
          <td className="p-3 text-center w-[50px]">
            {!isViewMode && (
              <Checkbox
                checked={
                  hasChildren
                    ? isAllSelected(node)
                    : (node.__variant?.isActive ?? false)
                }
                onCheckedChange={(val) => {
                  if (hasChildren) {
                    updateChildren(node, val);
                  } else if (node.__variant) {
                    node.__variant.isActive = val;
                  }
                  formik.setFieldValue("variants", [...formik.values.variants]);
                }}
                className="bg-white"
                disabled={isViewMode}
              />
            )}
          </td>

          {/* Variant Name */}
          <td className="py-3 px-1 w-[40%]">
            <div className="flex items-center gap-2">
              {hasChildren && (
                <button
                  type="button"
                  onClick={() =>
                    setOpenMapState({
                      ...currentOpenMap,
                      [currentPath]: !isOpen,
                    })
                  }
                >
                  {isOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              )}

              <div>
                <div className="text-sm font-medium">{key}</div>
                {hasChildren && (
                  <div className="text-xs text-gray-500">
                    {getChildCount(node)} variants
                  </div>
                )}
              </div>
            </div>
          </td>

          {/* Price Range */}
          <td className="p-3 w-[30%]">
            {hasChildren ? (
              <Input
                type="text"
                value={getPriceRange(node)}
                readOnly
                className="bg-gray-100 cursor-default"
                disabled={isViewMode}
              />
            ) : (
              node.__variant && (
                <Input
                  type="number"
                  value={node.__variant.price}
                  onChange={(e) =>
                    updateVariantField(node.__variant, "price", e.target.value)
                  }
                  readOnly={isViewMode}
                  disabled={isViewMode}
                />
              )
            )}
          </td>

          {/* Stock Sum */}
          <td className="p-3 w-[30%]">
            {hasChildren ? (
              <Input
                type="number"
                value={getStockSum(node)}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
                disabled={isViewMode}
              />
            ) : (
              node.__variant && (
                <Input
                  type="number"
                  value={node.__variant.inventory_quantity}
                  onChange={(e) =>
                    updateVariantField(
                      node.__variant,
                      "inventory_quantity",
                      e.target.value,
                    )
                  }
                  readOnly={isViewMode}
                  disabled={isViewMode}
                />
              )
            )}
          </td>
        </tr>

        {/* ---------------- CHILD ROWS (FLATTENED) ---------------- */}
        {hasChildren &&
          isOpen &&
          flatVariants.map((variant, idx) => (
            <tr key={`${currentPath}-child-${idx}`} className="bg-gray-50">
              {/* Checkbox */}
              <td
                className="relative p-3 text-sm"
                style={{ paddingLeft: `${(level + 1) * 24}px` }}
              >
                {!isViewMode && (
                  <Checkbox
                    checked={variant.isActive}
                    onCheckedChange={(val) =>
                      updateVariantField(variant, "isActive", val)
                    }
                    className="bg-white"
                  />
                )}
              </td>

              {/* Full Variant Name */}
              <td
                className="relative p-3 text-sm"
                style={{ paddingLeft: `${(level + 1) * 40}px` }}
              >
                {variant.title.split(" / ").slice(1).join(" / ")}
              </td>

              {/* Price */}
              <td className="p-3">
                <Input
                  type="number"
                  value={variant.price}
                  onChange={(e) =>
                    updateVariantField(variant, "price", e.target.value)
                  }
                  readOnly={isViewMode}
                  disabled={isViewMode}
                />
              </td>

              {/* Stock */}
              <td className="p-3">
                <Input
                  type="number"
                  value={variant.inventory_quantity}
                  onChange={(e) =>
                    updateVariantField(
                      variant,
                      "inventory_quantity",
                      e.target.value,
                    )
                  }
                  readOnly={isViewMode}
                  disabled={isViewMode}
                />
              </td>
            </tr>
          ))}
      </React.Fragment>
    );
  });
};
