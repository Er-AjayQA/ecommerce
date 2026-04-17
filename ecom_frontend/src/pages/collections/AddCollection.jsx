import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Save, CirclePlus, ArrowLeft, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCollections } from "@/context/collectionsContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
} from "@/components/ui/field";
import { toast } from "react-toastify";
import { useFormUnsavedChanges } from "@/context/unsavedChangesContext";

export const AddCollection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    formik,
    handleAddCondition,
    images,
    handleImage,
    removeImage,
    statusOptions,
    handleEditCollection,
    handleViewCollection,
    isViewMode,
    isEditMode,
    isCreateMode,
    resetToCreateMode,
    collectionDataLoading,
    selectionTypeOptions,
    getConditionTypesOptions,
    conditionBaseOptions,
    conditionMatchingOptions,
    productOptions,
    setProductOptions,
    productOptionsLoading,
    getValidConditions,
    handleRemoveProduct,
    handleClearAllProducts,
    selectedProductsWithDetails,
    setSelectedProductsWithDetails,
    handleClearAllConditions,
  } = useCollections();

  const isDisabled = isViewMode;

  const { confirmNavigation } = useFormUnsavedChanges({
    when: isCreateMode || isEditMode,
    isDirty: formik.dirty,
  });

  // Get page title
  const getPageTitle = () => {
    if (isViewMode) return "View Collection";
    if (isEditMode) return "Edit Collection";
    return "Add New Collection";
  };

  // Get page description
  const getPageDescription = () => {
    if (isViewMode)
      return "View collection details in your collections catalog";
    if (isEditMode)
      return "Edit collection information in your collections catalog";
    return "Create a new entry in your collection";
  };

  // Handle Back button click
  const handleback = () => {
    confirmNavigation(() => {
      resetToCreateMode();
      navigate("/collections");
    });
  };

  useEffect(() => {
    if (!id) {
      resetToCreateMode();
    }
  }, [id]);

  // Load collection data when in edit/view mode
  useEffect(() => {
    const loadProductData = async () => {
      if (!id) return;

      const needsLoading = !formik.values.title && !collectionDataLoading;

      if (needsLoading) {
        const isViewPath = window.location.pathname.includes("/view/");
        const isEditPath = window.location.pathname.includes("/edit/");

        if (isViewPath) {
          await handleViewCollection(id);
        } else if (isEditPath) {
          await handleEditCollection(id);
        }
      }
    };

    loadProductData();
  }, [id]);

  useEffect(() => {
    return () => {
      if (setProductOptions) {
        setProductOptions([]);
      }
    };
  }, []);

  // Don't clear products, just show warning
  useEffect(() => {
    if (formik.values.products?.length > 0 && !isCreateMode) {
      if (formik.values.collection_type === "SMART") {
        toast.warning(
          "Products in SMART collections are managed by conditions. Manual selections will be removed.",
          {
            position: "top-right",
            autoClose: 3000,
          },
        );
        setSelectedProductsWithDetails([]);
      }
    }
  }, [formik.values.collection_type]);

  if (collectionDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-gray-900 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading collections data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl hover:scale-110"
              onClick={handleback}
            >
              <ArrowLeft size={18} />
            </Button>

            <div>
              <h2 className="text-lg font-semibold">{getPageTitle()}</h2>
              <p className="text-sm text-gray-500">{getPageDescription()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardContent className="space-y-4">
                <Input
                  label="Title"
                  placeholder="e.g. Summer Collection, Staff picks"
                  value={formik.values.title}
                  onChange={(e) =>
                    formik.setFieldValue("title", e.target.value)
                  }
                  touched={formik.touched.title}
                  error={formik.errors.title}
                  readOnly={isDisabled}
                  disabled={isDisabled}
                />

                <Textarea
                  label="Description"
                  placeholder="Tell the story of this collection..."
                  value={formik.values.description}
                  onChange={(e) =>
                    formik.setFieldValue("description", e.target.value)
                  }
                  readOnly={isDisabled}
                  disabled={isDisabled}
                />
              </CardContent>
            </Card>

            {/* Collection Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Collection Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={formik.values.collection_type}
                  onValueChange={(val) =>
                    formik.setFieldValue("collection_type", val)
                  }
                  className="w-fit"
                  disabled={isDisabled}
                >
                  {selectionTypeOptions?.map((item, idx) => {
                    return (
                      <Field key={idx} orientation="horizontal">
                        <RadioGroupItem
                          value={item?.value}
                          id={`${idx}-${item?.value}`}
                        />
                        <FieldContent>
                          <FieldLabel
                            htmlFor={`${idx}-${item?.value}`}
                            className="cursor-pointer"
                          >
                            {item?.label}
                          </FieldLabel>
                          <FieldDescription>
                            {item?.description}
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Conditions */}
            {formik.values.collection_type === "SMART" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base ">
                    Conditions{" "}
                    {getValidConditions(formik.values.conditions).length >
                      0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAllConditions}
                        className="h-auto p-1 text-red-600 hover:text-red-700"
                      >
                        Clear All
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-row items-center gap-4">
                    <FieldLegend variant="label" className="m-0 basis-1/4">
                      Products must match:
                    </FieldLegend>

                    <RadioGroup
                      value={formik.values.condition_apply_type}
                      onValueChange={(val) =>
                        formik.setFieldValue("condition_apply_type", val)
                      }
                      className=""
                      disabled={isDisabled}
                      orientation="horizontal"
                    >
                      {conditionMatchingOptions.map((item, idx) => {
                        return (
                          <Field
                            key={idx}
                            orientation="horizontal"
                            className="flex items-center basis-1/4"
                          >
                            <RadioGroupItem
                              value={item?.value}
                              id={`condition-match-${idx}-${item?.value}`}
                            />
                            <FieldLabel
                              htmlFor={`condition-match-${idx}-${item?.value}`}
                              className="font-normal cursor-pointer"
                            >
                              {item?.label}
                            </FieldLabel>
                          </Field>
                        );
                      })}
                    </RadioGroup>
                  </div>
                  {formik.values.conditions.map((item, idx) => (
                    <div
                      key={idx}
                      className={`grid items-start grid-cols-12 gap-2 rounded-lg ${formik.touched.conditions && formik.errors.conditions && "py-2 bg-red-50 border border-red-600"}`}
                    >
                      <div className="col-span-4">
                        <CustomSelect
                          label=""
                          placeholder="Select base type..."
                          options={conditionBaseOptions}
                          value={item?.title || ""}
                          onValueChange={(val) => {
                            formik.setFieldValue(
                              `conditions[${idx}].title`,
                              val,
                            );
                            formik.setFieldValue(
                              `conditions[${idx}].algorithm`,
                              "",
                            );
                            formik.setFieldValue(
                              `conditions[${idx}].values`,
                              [],
                            );
                          }}
                          isViewMode={isViewMode}
                          disabled={isViewMode}
                        />
                      </div>

                      <div className="col-span-4">
                        <CustomSelect
                          label=""
                          placeholder="Select condition type..."
                          options={getConditionTypesOptions(item?.title)}
                          value={item?.algorithm || ""}
                          onValueChange={(val) =>
                            formik.setFieldValue(
                              `conditions[${idx}].algorithm`,
                              val,
                            )
                          }
                          isViewMode={isViewMode}
                          disabled={isViewMode}
                        />
                      </div>

                      <div className="col-span-3">
                        {["category", "tag", "type", "vendor"].includes(
                          item?.title,
                        ) ? (
                          <CustomDropdown
                            fieldType={
                              item?.title === "tag"
                                ? "tag"
                                : item?.title === "type"
                                  ? "productType"
                                  : item?.title === "vendor"
                                    ? "vendor"
                                    : item?.title === "category"
                                      ? "category"
                                      : "product"
                            }
                            name={`conditions[${idx}].values`}
                            label=""
                            value={item?.values || []}
                            onChange={(fieldName, newValue) => {
                              formik.setFieldValue(fieldName, newValue);
                            }}
                            onBlur={formik.handleBlur}
                            touched={formik.touched.conditions?.[idx]?.values}
                            error={formik.errors.conditions?.[idx]?.values}
                            isAddNew={!isDisabled}
                            isMulti={true}
                            isViewMode={isViewMode}
                            disabled={isDisabled}
                          />
                        ) : (
                          <Input
                            label=""
                            placeholder="Enter value..."
                            value={item?.values || ""}
                            onChange={(e) =>
                              formik.setFieldValue(
                                `conditions[${idx}].values`,
                                [e.target.value],
                              )
                            }
                            readOnly={isDisabled}
                            disabled={isDisabled}
                          />
                        )}
                      </div>

                      {/* Remove condition button */}
                      {!isDisabled && formik.values.conditions.length > 1 && (
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = formik.values.conditions.filter(
                                (_, i) => i !== idx,
                              );
                              formik.setFieldValue("conditions", updated);
                            }}
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {formik.touched.conditions && formik.errors.conditions && (
                    <p className="text-xs text-red-600">
                      ⚠ {formik.errors.conditions}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="p-0">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-8 bg-gray-200"
                    onClick={handleAddCondition}
                  >
                    <CirclePlus size={16} className="mr-2" />
                    Add another condition
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <CustomDropdown
                  options={productOptions}
                  optionLabelKey="title"
                  optionValueKey="product_id"
                  name="products"
                  label=""
                  value={formik.values.products}
                  onChange={formik.setFieldValue}
                  onBlur={formik.handleBlur}
                  touched={formik.touched.products}
                  error={formik.errors.products}
                  isAddNew={false}
                  isMulti={true}
                  isViewMode={isViewMode}
                  isLoading={productOptionsLoading}
                />

                {/* Products List Table with Details */}
                {selectedProductsWithDetails.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">
                        Selected Products ({selectedProductsWithDetails.length})
                      </Label>
                      {!isDisabled &&
                        selectedProductsWithDetails.length > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAllProducts}
                            className="h-auto p-1 text-red-600 hover:text-red-700"
                          >
                            Clear All
                          </Button>
                        )}
                    </div>

                    <div className="overflow-hidden border rounded-lg">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>SKU</TableHead>
                            {!isDisabled && (
                              <TableHead className="w-[80px]">
                                Actions
                              </TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedProductsWithDetails.map((product, idx) => (
                            <TableRow key={product.product_id}>
                              <TableCell className="font-medium">
                                {idx + 1}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {product.media?.[0]?.url && (
                                    <img
                                      src={product.media[0].url}
                                      alt={product.title}
                                      loading="lazy"
                                      className="object-cover w-10 h-10 rounded"
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium">
                                      {product.title}
                                    </div>
                                    {product.product_type_name && (
                                      <div className="text-xs text-gray-500">
                                        {product.product_type_name}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-gray-600">
                                  SKU:{" "}
                                  <span className="font-semibold">
                                    {product?.sku}
                                  </span>
                                </span>
                              </TableCell>
                              {!isDisabled && (
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveProduct(product.product_id)
                                    }
                                    className="w-8 h-8 p-0 hover:bg-red-50"
                                  >
                                    <Trash2
                                      size={16}
                                      className="text-red-500"
                                    />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-end mt-3 text-sm">
                      <div className="p-2 px-3 rounded-lg bg-gray-50">
                        <span className="text-gray-600">Total Products: </span>
                        <span className="font-semibold">
                          {selectedProductsWithDetails.length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="col-span-1 space-y-6">
            {/* Media */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Media</CardTitle>
                <p className="mt-1 text-xs text-gray-500">
                  Upload banner images (Maximum 10 images)
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {/* Upload box */}
                  {images.length < 10 && !isDisabled && (
                    <label className="flex flex-col items-center justify-center gap-2 transition-all border-2 border-gray-300 border-dashed rounded-lg cursor-pointer aspect-square hover:border-emerald-500 hover:bg-emerald-50 group">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-1 text-3xl text-gray-400 group-hover:text-emerald-500">
                          <Plus className="w-8 h-8" />
                        </div>
                        <div className="text-xs text-gray-500 group-hover:text-emerald-600">
                          Add Media
                        </div>
                      </div>
                      <input
                        type="file"
                        multiple
                        hidden
                        onChange={handleImage}
                        accept="image/*"
                      />
                    </label>
                  )}

                  {/* Image previews */}
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-lg aspect-square group"
                    >
                      {img?.type?.startsWith("video") ||
                      img?.file?.type?.startsWith("video") ||
                      img.preview?.includes("video") ? (
                        <video
                          src={img.preview}
                          controls
                          loop={true}
                          autoPlay={true}
                          className="object-cover w-full h-full rounded-lg"
                        />
                      ) : (
                        <img
                          src={img.preview}
                          alt={`Preview ${index + 1}`}
                          loading="lazy"
                          className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                        />
                      )}

                      {/* Image order badge */}
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                        {index + 1}
                      </div>

                      {!isDisabled && (
                        <div className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-200 opacity-0 bg-black/60 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => window.open(img.preview, "_blank")}
                            className="p-2 transition-colors bg-white rounded-lg hover:bg-gray-100"
                            title="View full size"
                          >
                            <Eye size={16} className="text-gray-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-2 text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
                            title="Remove image"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Upload progress/info */}
                {images.length > 0 && (
                  <div className="mt-4 text-sm text-gray-600">
                    <span className="font-medium">{images.length}</span> of 10
                    images used
                  </div>
                )}

                {images.length === 10 && (
                  <div className="p-2 mt-3 text-xs rounded-lg text-amber-600 bg-amber-50">
                    ⚠️ Maximum 10 images reached. Remove some images to add
                    more.
                  </div>
                )}

                {/* Tip for better images */}
                {!isDisabled && images.length < 10 && (
                  <div className="p-2 mt-3 text-xs text-gray-500 rounded-lg bg-blue-50">
                    💡 Tip: Use high-quality images (JPEG, JPG, PNG, AVIF, GIF,
                    WEBP, MP4, WEBM) for better product presentation
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomSelect
                  label=""
                  placeholder="Select status"
                  options={statusOptions}
                  value={formik.values.status}
                  onValueChange={(val) => formik.setFieldValue("status", val)}
                  touched={formik.touched.status}
                  error={formik.errors.status}
                  isViewMode={isViewMode}
                  disabled={isViewMode}
                />
              </CardContent>
            </Card>

            <div className="p-4 bg-green-50 rounded-xl">
              <h4 className="mb-2 text-sm font-semibold">Curator’s Tip</h4>
              <p className="text-sm text-gray-600">
                Collections with max 10 high-quality images and a description
                over 200 words tend to see higher conversion rates.
              </p>
            </div>
          </div>
        </div>

        {!isDisabled && (
          <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
            <Button type="button" variant="outline" onClick={handleback}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="text-white bg-gradient-to-r from-blue-500 to-blue-600"
            >
              <Save size={16} className="mr-2" />
              {isEditMode ? "Update Collection" : "Save Collection"}
            </Button>
          </div>
        )}
      </form>
    </>
  );
};
