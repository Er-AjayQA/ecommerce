import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  X,
  Eye,
  Trash2,
  Save,
  CirclePlus,
  Plus,
} from "lucide-react";
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
import { useProduct } from "@/context/productContext";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductVariantTree } from "@/components/common/ProductVarientTree";
import { useFormUnsavedChanges } from "@/context/unsavedChangesContext";

const AddProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    formik,
    handleAddOption,
    displayVariant,
    treeData,
    images,
    handleImage,
    removeImage,
    isViewMode,
    isEditMode,
    isCreateMode,
    handleEditProduct,
    handleViewProduct,
    productDataLoading,
    resetToCreateMode,
  } = useProduct();

  const statusDropdown = [
    { label: "Draft", value: "DRAFT" },
    { label: "Published", value: "PUBLISHED" },
  ];

  const isDisabled = isViewMode;
  const [openMap, setOpenMap] = useState({});

  const { confirmNavigation } = useFormUnsavedChanges({
    when: isCreateMode || isEditMode,
    isDirty: formik.dirty,
  });

  // Get page title based on mode
  const getPageTitle = () => {
    if (isViewMode) return "View Product";
    if (isEditMode) return "Edit Product";
    return "Add New Product";
  };

  const getPageDescription = () => {
    if (isViewMode) return "View product details in your curated catalog";
    if (isEditMode) return "Edit product information in your curated catalog";
    return "Create a new entry in your curated catalog";
  };

  // Handle option value change
  const handleOptionValueChange = (optionIdx, valueIdx, newValue) => {
    const options = [...formik.values.options];
    const updatedValues = [...options[optionIdx].values];
    updatedValues[valueIdx] = newValue;

    // Add empty input at the end if this is the last value and it's not empty
    if (valueIdx === updatedValues.length - 1 && newValue.trim() !== "") {
      updatedValues.push("");
    }

    options[optionIdx].values = updatedValues;
    formik.setFieldValue("options", options);
  };

  // Remove option value
  const handleRemoveOptionValue = (optionIdx, valueIdx) => {
    const options = [...formik.values.options];
    const filtered = options[optionIdx].values.filter((_, i) => i !== valueIdx);
    options[optionIdx].values = filtered;
    formik.setFieldValue("options", options);
  };

  // Remove entire option
  const handleRemoveOption = (optionIdx) => {
    const filtered = formik.values.options.filter((_, i) => i !== optionIdx);
    formik.setFieldValue("options", filtered);
  };

  // Handle select all variants
  const handleSelectAllVariants = (checked) => {
    const updatedVariants = formik.values.variants.map((v) => ({
      ...v,
      isActive: checked,
    }));
    formik.setFieldValue("variants", updatedVariants);
  };

  const areAllVariantsSelected = () => {
    return (
      formik.values.variants.length > 0 &&
      formik.values.variants.every((v) => v.isActive === true)
    );
  };

  const handleback = () => {
    confirmNavigation(() => {
      resetToCreateMode();
      navigate("/products");
    });
  };

  useEffect(() => {
    if (!id) {
      resetToCreateMode();
    }
  }, [id]);

  // Load product data when in edit/view mode
  useEffect(() => {
    const loadProductData = async () => {
      if (!id) return;

      const needsLoading = !formik.values.title && !productDataLoading;

      if (needsLoading) {
        const isViewPath = window.location.pathname.includes("/view/");
        const isEditPath = window.location.pathname.includes("/edit/");

        if (isViewPath) {
          await handleViewProduct(id);
        } else if (isEditPath) {
          await handleEditProduct(id);
        }
      }
    };

    loadProductData();
  }, [id, formik.values.title, productDataLoading]);

  if (productDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-gray-900 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading product data...</p>
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
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Title"
                  placeholder="e.g. Minimalist Ceramic Vase"
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
                  placeholder="Tell the story of this product..."
                  value={formik.values.description}
                  onChange={(e) =>
                    formik.setFieldValue("description", e.target.value)
                  }
                  readOnly={isDisabled}
                  disabled={isDisabled}
                />

                <div className="grid grid-cols-2 gap-4">
                  <CustomDropdown
                    fieldType="category"
                    name="category_id"
                    label="Product Category"
                    value={formik.values.category_id}
                    onChange={formik.setFieldValue}
                    onBlur={formik.handleBlur}
                    touched={formik.touched.category_id}
                    error={formik.errors.category_id}
                    isAddNew={false}
                    isMulti={false}
                    isViewMode={isViewMode}
                  />

                  <Input
                    label="SKU"
                    placeholder="Product sku"
                    value={formik.values.sku}
                    onChange={(e) =>
                      formik.setFieldValue("sku", e.target.value)
                    }
                    touched={formik.touched.sku}
                    error={formik.errors.sku}
                    readOnly={isDisabled}
                    disabled={isDisabled}
                  />
                </div>

                {!displayVariant && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Price"
                      placeholder="0.00"
                      type="number"
                      value={formik.values.price}
                      onChange={(e) =>
                        formik.setFieldValue("price", e.target.value)
                      }
                      readOnly={isDisabled}
                      disabled={isDisabled}
                    />

                    <Input
                      label="Quantity"
                      placeholder="0"
                      type="number"
                      value={formik.values.quantity}
                      onChange={(e) =>
                        formik.setFieldValue("quantity", e.target.value)
                      }
                      readOnly={isDisabled}
                      disabled={isDisabled}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Media */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Media</CardTitle>
                <p className="mt-1 text-xs text-gray-500">
                  Upload product images (Maximum 10 images)
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-4 sm:grid-cols-4 md:grid-cols-6">
                  {/* Upload box */}
                  {images.length < 10 && !isDisabled && (
                    <label className="flex flex-col items-center justify-center w-32 h-32 transition-colors border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400">
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

            {/* Variants */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Variants</CardTitle>
              </CardHeader>

              {formik.values.options?.length > 0 && (
                <CardContent className="space-y-4">
                  {formik.values.options?.map((option, idx) => (
                    <div
                      key={idx}
                      className="relative p-4 border border-gray-200 rounded-lg bg-gray-50/50"
                    >
                      <div className="grid grid-cols-1 gap-4">
                        <Input
                          label="Option name"
                          placeholder="e.g., Size, Color, Material"
                          value={option.name}
                          onChange={(e) =>
                            formik.setFieldValue(
                              `options[${idx}].name`,
                              e.target.value,
                            )
                          }
                          readOnly={isDisabled}
                          disabled={isDisabled}
                        />

                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-600">
                            Option values
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {option.values.map((val, vIdx) => (
                              <div key={vIdx} className="relative">
                                <Input
                                  value={val}
                                  placeholder="Enter value"
                                  onChange={(e) =>
                                    handleOptionValueChange(
                                      idx,
                                      vIdx,
                                      e.target.value,
                                    )
                                  }
                                  className="pr-7"
                                  readOnly={isDisabled}
                                  disabled={isDisabled}
                                />
                                {val && !isDisabled && (
                                  <X
                                    size={14}
                                    className="absolute text-gray-400 cursor-pointer hover:text-red-500 top-2/4 right-2 -translate-y-2/4"
                                    onClick={() =>
                                      handleRemoveOptionValue(idx, vIdx)
                                    }
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {!isDisabled && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute h-8 text-gray-400 top-2 right-2 hover:text-red-500"
                          onClick={() => handleRemoveOption(idx)}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}

              {!isDisabled && (
                <CardFooter className="p-0">
                  {formik.values.options.length < 3 ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-8 bg-gray-200"
                      onClick={handleAddOption}
                    >
                      <CirclePlus size={16} className="mr-2" />
                      Add option like size or color
                    </Button>
                  ) : (
                    <p className="w-full text-sm text-center text-gray-400">
                      Maximum 3 options allowed
                    </p>
                  )}
                </CardFooter>
              )}
            </Card>

            {/* Generated Combinations Table */}
            {formik.values.variants.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-gray-200">
                      <TableRow>
                        <TableHead className="w-12">
                          {!isDisabled && (
                            <Checkbox
                              checked={areAllVariantsSelected()}
                              onCheckedChange={handleSelectAllVariants}
                              className="bg-white"
                            />
                          )}
                        </TableHead>
                        <TableHead className="w-[40%]">Variant</TableHead>
                        <TableHead className="w-[30%]">Price (₹)</TableHead>
                        <TableHead className="w-[30%]">Stock</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      <ProductVariantTree
                        tree={treeData}
                        formik={formik}
                        openMap={openMap}
                        setOpenMap={setOpenMap}
                        isViewMode={isDisabled}
                      />
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel */}
          <div className="col-span-1 space-y-6">
            {/* Product Organization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Product Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CustomDropdown
                  fieldType="productType"
                  name="product_type_id"
                  label="Type"
                  value={formik.values.product_type_id}
                  onChange={formik.setFieldValue}
                  onBlur={formik.handleBlur}
                  touched={formik.touched.product_type_id}
                  error={formik.errors.product_type_id}
                  isAddNew={!isDisabled}
                  isMulti={false}
                  isViewMode={isViewMode}
                />

                <CustomDropdown
                  fieldType="collections"
                  name="collections"
                  label="Collections"
                  value={formik.values.collections || []}
                  onChange={formik.setFieldValue}
                  onBlur={formik.handleBlur}
                  touched={formik.touched.collections}
                  error={formik.errors.collections}
                  isAddNew={!isDisabled}
                  isMulti={true}
                  isViewMode={isViewMode}
                />

                <CustomDropdown
                  fieldType="vendor"
                  name="vendor_id"
                  label="Vendor"
                  value={formik.values.vendor_id}
                  onChange={formik.setFieldValue}
                  onBlur={formik.handleBlur}
                  touched={formik.touched.vendor_id}
                  error={formik.errors.vendor_id}
                  isAddNew={!isDisabled}
                  isMulti={false}
                  isViewMode={isViewMode}
                />

                <CustomDropdown
                  fieldType="tag"
                  name="tags"
                  label="Tags"
                  value={formik.values.tags || []}
                  onChange={formik.setFieldValue}
                  onBlur={formik.handleBlur}
                  touched={formik.touched.tags}
                  error={formik.errors.tags}
                  isAddNew={!isDisabled}
                  isMulti={true}
                  isViewMode={isViewMode}
                />
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
                  options={statusDropdown}
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
                Products with max 10 high-quality images and a description over
                200 words tend to see higher conversion rates.
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
              {isEditMode ? "Update Product" : "Save Product"}
            </Button>
          </div>
        )}
      </form>
    </>
  );
};

export default AddProduct;
