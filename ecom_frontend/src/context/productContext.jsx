import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  createProduct,
  getAllProducts,
  getByIdProduct,
  updateProduct,
  updateProductStatus,
} from "@/services/productService";
import { useNavigate } from "react-router-dom";
import { getAllMediaApi } from "@/services/mediaService";

const ProductContext = createContext();

// Helper to generate combinations from options (for CREATE mode)
const generateCombinations = (options) => {
  const activeOptions = options.filter(
    (opt) =>
      opt.name.trim() !== "" && opt?.values?.some((v) => v.trim() !== ""),
  );

  if (activeOptions.length === 0) return [];

  return activeOptions.reduce((acc, option) => {
    const values = option.values.filter((v) => v.trim() !== "");

    if (acc.length === 0) {
      return values.map((v) => ({
        title: v,
        combination: [v],
        option_values: [{ option: option.name, value: v }],
        price: "",
        sku: "",
        inventory_quantity: "",
        isActive: true,
      }));
    }

    const newAcc = [];

    acc.forEach((prev) => {
      values.forEach((v) => {
        newAcc.push({
          title: `${prev.title} / ${v}`,
          combination: [...prev.combination, v],
          option_values: [
            ...prev.option_values,
            { option: option.name, value: v },
          ],
          price: prev.price || "",
          sku: prev.sku || "",
          inventory_quantity: prev.inventory_quantity || "",
          isActive: true,
        });
      });
    });

    return newAcc;
  }, []);
};

// Helper to generate variant tree view
const buildVariantTree = (variants) => {
  const tree = {};

  if (!variants || !Array.isArray(variants) || variants.length === 0) {
    return {};
  }

  variants.forEach((variant) => {
    if (
      !variant ||
      !variant.combination ||
      !Array.isArray(variant.combination)
    ) {
      return;
    }

    let current = tree;

    variant.combination.forEach((value, idx) => {
      if (!value || value.trim() === "") {
        return;
      }

      if (!current[value]) {
        current[value] = {
          __children: {},
          __variant: null,
        };
      }

      if (idx === variant.combination.length - 1) {
        current[value].__variant = variant;
      }

      current = current[value].__children;
    });
  });

  return tree;
};

// Only keep comparable image data for unsaved-change detection
const getComparableImages = (images = []) => {
  return images.map((img, index) => ({
    id: img.id || null,
    isExisting: !!img.isExisting,
    preview: img.isExisting ? img.preview : "",
    name: img.file?.name || "",
    size: img.file?.size || 0,
    type: img.type || img.file?.type || "",
    position: img.position || index + 1,
  }));
};

export const ProductProvider = ({ children }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("create");
  const [listing, setListing] = useState([]);
  const [listingLoading, setListingLoading] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [mediaListLoading, setMediaListLoading] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [displayVariant, setDisplayVariant] = useState(false);
  const [images, setImages] = useState([]);
  const statusOptions = [
    { label: "All", value: "ALL" },
    { label: "Draft", value: "DRAFT" },
    { label: "Published", value: "PUBLISHED" },
  ];
  const [searchBy, setSearchBy] = useState("ALL");
  const previousValuesRef = useRef({
    price: "",
    quantity: "",
  });
  const [currentProductId, setCurrentProductId] = useState(null);
  const [productDataLoading, setProductDataLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [nextPath, setNextPath] = useState(null);
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Validation schema
  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    sku: Yup.string().required("SKU is required"),
    category_id: Yup.string().required("Category is required"),
    vendor_id: Yup.string().required("Vendor is required"),
    product_type_id: Yup.string().required("Type is required"),
  });

  const initialFormikValues = useMemo(
    () => ({
      title: "",
      price: 0,
      quantity: 0,
      sku: "",
      category_id: "",
      vendor_id: "",
      options: [],
      variants: [],
      tags: [],
      product_type_id: "",
      collections: [],
      description: "",
      status: "DRAFT",
    }),
    [],
  );

  // Initial snapshot refs for dirty-check
  const initialFormSnapshotRef = useRef(JSON.stringify(initialFormikValues));
  const initialImagesSnapshotRef = useRef(JSON.stringify([]));

  const setInitialSnapshots = useCallback((formValues, imageValues = []) => {
    initialFormSnapshotRef.current = JSON.stringify(formValues);
    initialImagesSnapshotRef.current = JSON.stringify(
      getComparableImages(imageValues),
    );
  }, []);

  const formik = useFormik({
    initialValues: initialFormikValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();

        // Handle images - separate new and existing
        const newFiles = images.filter((img) => img.file && !img.isExisting);
        const existingImages = images.filter((img) => img.isExisting && img.id);

        // Append new files
        newFiles.forEach((img) => {
          formData.append("files", img.file);
        });

        // CRITICAL: Send existing images info for edit mode
        if (isEditMode && existingImages.length > 0) {
          const existingImagesData = existingImages.map((img) => ({
            id: img.id,
            url: img.preview,
          }));

          formData.append(
            "existing_images",
            JSON.stringify(existingImagesData),
          );
        } else if (isEditMode && existingImages.length === 0) {
          // Send empty array to delete all images
          formData.append("existing_images", JSON.stringify([]));
        }

        formData.append("title", values.title);
        formData.append("sku", values.sku);
        formData.append("category_id", values.category_id);
        formData.append("vendor_id", values.vendor_id);
        formData.append("product_type_id", values.product_type_id);
        formData.append("description", values.description);
        formData.append("status", values.status);
        formData.append("price", values.price);
        formData.append("quantity", values.quantity);
        formData.append("collections", JSON.stringify(values.collections));

        // Prepare options - remove empty values
        const cleanOptions = values.options.map((opt) => ({
          name: opt.name,
          values: opt.values.filter((v) => v && v.trim() !== ""),
        }));
        formData.append("options", JSON.stringify(cleanOptions));

        // Prepare variants based on mode
        let variantsToSend = [];

        if (isEditMode) {
          variantsToSend = values.variants.map((variant) => {
            const optionValuesWithIds = variant.option_values.map((ov) => {
              if (ov.option_value_id) {
                return {
                  option: ov.option,
                  value: ov.value,
                  option_value_id: ov.option_value_id,
                };
              }

              let optionId = ov.option;
              if (!optionId.includes("-")) {
                const foundOption = values.options.find(
                  (opt) => opt.name === ov.option && opt._id,
                );
                if (foundOption) {
                  optionId = foundOption._id;
                }
              }

              return {
                option: optionId,
                value: ov.value,
              };
            });

            return {
              product_variant_id: variant.product_variant_id,
              title: variant.title,
              combination: variant.combination,
              option_values: optionValuesWithIds,
              price: variant.price || "0",
              sku: variant.sku || values.sku,
              inventory_quantity: variant.inventory_quantity || "0",
              isActive: variant.isActive !== false,
            };
          });
        } else {
          variantsToSend = values.variants.map((variant) => ({
            title: variant.title,
            combination: variant.combination,
            option_values: variant.option_values,
            price: variant.price || "0",
            sku: variant.sku || values.sku,
            inventory_quantity: variant.inventory_quantity || "0",
            isActive: variant.isActive !== false,
          }));
        }

        formData.append("variants", JSON.stringify(variantsToSend));
        formData.append("tags", JSON.stringify(values.tags));

        if (isEditMode) {
          const res = await updateProduct(currentProductId, formData);
          if (res.data.success) {
            toast.success("Product updated successfully!");
            await refreshListing();
            resetToCreateMode();
            navigate("/products");
          }
        } else {
          const res = await createProduct(formData);
          if (res.data.success) {
            toast.success("Product created successfully!");
            await refreshListing();
            resetToCreateMode();
            navigate("/products");
          }
        }
      } catch (error) {
        console.error("Error details:", error.response?.data || error);
        toast.error(error.response?.data?.message || "Failed to save product");
      }
    },
  });

  const hasUnsavedChanges = useMemo(() => {
    if (isViewMode) return false;

    const currentForm = JSON.stringify(formik.values);
    const currentImages = JSON.stringify(getComparableImages(images));

    return (
      currentForm !== initialFormSnapshotRef.current ||
      currentImages !== initialImagesSnapshotRef.current
    );
  }, [formik.values, images, isViewMode]);

  // Fetch Listing Data
  const fetchData = async () => {
    setListingLoading(true);
    try {
      let statusBy = "";

      if (searchBy !== "ALL") {
        statusBy = searchBy;
      } else {
        statusBy = "";
      }

      const res = await getAllProducts(
        currentPage,
        itemsPerPage,
        search,
        statusBy,
      );
      setListing(res?.data?.data || []);
    } catch (err) {
      console.error("Error fetching products list:", err);
    } finally {
      setListingLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [itemsPerPage, search, searchBy, currentPage]);

  // Handle Pagination
  const { paginatedData, totalPages } = useMemo(() => {
    const listingArray = Array.isArray(listing) ? listing : [];
    const totalItems = listingArray.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const paginatedData = listingArray.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );

    return { paginatedData, totalPages };
  }, [listing, currentPage, itemsPerPage]);

  // Reset form to initial state
  const resetToCreateMode = () => {
    setMode("create");
    setCurrentProductId(null);
    formik.resetForm({ values: initialFormikValues });
    setImages([]);
    setDisplayVariant(false);
    setCurrentPage(1);
    setShowPopup(false);
    setNextPath(null);
    setInitialSnapshots(initialFormikValues, []);
  };

  // Transform API options to form options
  const transformApiOptionsToFormOptions = (apiOptions) => {
    if (!apiOptions || !Array.isArray(apiOptions)) return [];

    return apiOptions.map((option) => {
      const values =
        option.OptionValues?.map((ov) => ov.value).filter(Boolean) || [];

      return {
        name: option.name,
        values: [...values, ""],
        _id: option.product_option_id,
      };
    });
  };

  // Transform API variants to form variants with correct structure
  const transformApiVariantsToFormVariants = (apiVariants, formOptions) => {
    if (!apiVariants || !Array.isArray(apiVariants)) return [];

    return apiVariants.map((variant) => {
      const valueByOptionName = {};

      variant.optionValues?.forEach((ov) => {
        const option = formOptions.find(
          (opt) => opt._id === ov.product_option_id,
        );
        if (option) {
          valueByOptionName[option.name] = ov.value;
        }
      });

      const combination = [];

      formOptions.forEach((opt) => {
        const value = valueByOptionName[opt.name] || "";
        combination.push(value);
      });

      const option_values =
        variant.optionValues?.map((ov) => {
          const option = formOptions.find(
            (opt) => opt._id === ov.product_option_id,
          );
          return {
            option: option?.name || ov.product_option_id,
            value: ov.value,
            option_value_id: ov.option_value_id,
          };
        }) || [];

      return {
        title: variant.title,
        combination: combination,
        option_values: option_values,
        price: variant.price?.toString() || "",
        sku: variant.sku || "",
        inventory_quantity: variant.inventory_quantity?.toString() || "",
        isActive: variant.isActive !== false,
        product_variant_id: variant.product_variant_id,
      };
    });
  };

  // Handle Edit & View Product
  const fetchProductData = async (id, viewMode = false) => {
    setProductDataLoading(true);
    try {
      const res = await getByIdProduct(id);
      const productData = res?.data?.data || null;

      if (productData) {
        setMode(viewMode ? "view" : "edit");
        setCurrentProductId(id);

        const transformedOptions = transformApiOptionsToFormOptions(
          productData.options,
        );

        const transformedVariants = transformApiVariantsToFormVariants(
          productData.variants,
          transformedOptions,
        );

        const transformedTags =
          productData.tags?.map((tag) => tag.tag_id) || [];

        const transformedCollections =
          productData.collectionProducts?.map((cp) => cp.collection_id) || [];

        const nextFormValues = {
          title: productData.title || "",
          price: productData.price?.toString() || "0",
          quantity: productData.quantity?.toString() || "0",
          sku: productData.sku || "",
          category_id: productData.category_id || "",
          vendor_id: productData.vendor_id || "",
          options: transformedOptions,
          variants: transformedVariants,
          tags: transformedTags,
          product_type_id: productData.product_type_id || "",
          collections: transformedCollections,
          description: productData.description || "",
          status: productData.status || "DRAFT",
        };

        formik.setValues(nextFormValues);

        const existingImages =
          productData.media && productData.media.length > 0
            ? productData.media.map((media, idx) => ({
                file: null,
                preview: media.url,
                id: media.product_media_id,
                type: media.type,
                isExisting: true,
                position: media.position || idx + 1,
              }))
            : [];

        setImages(existingImages);

        setDisplayVariant(transformedOptions.length > 0);
        setInitialSnapshots(nextFormValues, existingImages);

        if (viewMode) {
          navigate(`/products/view/${id}`);
        } else {
          navigate(`/products/edit/${id}`);
        }
      }
    } catch (err) {
      console.error("Error fetching product detail:", err);
      toast.error("Failed to load product data");
    } finally {
      setProductDataLoading(false);
    }
  };

  const handleEditProduct = async (id) => {
    await fetchProductData(id, false);
  };

  const handleViewProduct = async (id) => {
    await fetchProductData(id, true);
  };

  // Handle Add new Option
  const handleAddOption = () => {
    const newOption = {
      name: "",
      values: [""],
    };

    formik.setFieldValue("options", [...formik.values.options, newOption]);
  };

  const treeData = useMemo(() => {
    return buildVariantTree(formik.values.variants);
  }, [formik.values.variants]);

  // Handle Upload Images
  const handleImage = (e) => {
    const files = Array.from(e.target.files);

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/avif",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];

    if (images.length + files.length > 10) {
      toast.error("You can upload maximum 10 images");
      return;
    }

    const validFiles = files.filter((file) => allowedTypes.includes(file.type));
    const invalidFiles = files.filter(
      (file) => !allowedTypes.includes(file.type),
    );

    if (invalidFiles.length > 0) {
      toast.error(`Please use JPEG, JPG, PNG, AVIF, GIF, WEBP, MP4, or WEBM`);
      return;
    }

    if (validFiles.length === 0) {
      return;
    }

    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  // Remove image
  const removeImage = (index) => {
    const imageToRemove = images[index];

    if (imageToRemove.preview && !imageToRemove.isExisting) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
  };

  // Handle Change Status
  const handleChangeStatus = async (id, status) => {
    try {
      const res = await updateProductStatus(id, { status });

      if (res?.data?.success) {
        fetchData();
      }
    } catch (err) {
      console.error("Error updating product status:", err);
      toast.error("Failed to update product status");
    }
  };

  // Handle Get All Media List
  const handleGetAllMediaList = async (id, type) => {
    setMediaListLoading(true);
    setShowMedia(true);
    try {
      const res = await getAllMediaApi(id, type);

      if (res?.data?.success) {
        setMediaList(res.data.data);
      } else {
        setMediaList([]);
        toast.error("No media found");
      }
    } catch (err) {
      console.error("Error fetching product media:", err);
      toast.error("Failed to fetch product media");
      setMediaList([]);
    } finally {
      setMediaListLoading(false);
    }
  };

  // Generate variants when options change
  useEffect(() => {
    if (!formik.values.options || formik.values.options.length === 0) return;

    const generated = generateCombinations(formik.values.options);

    if (isCreateMode) {
      formik.setFieldValue("variants", generated);
    } else if (isEditMode) {
      const existingVariants = formik.values.variants;

      const merged = generated.map((newVariant) => {
        const match = existingVariants.find(
          (v) =>
            JSON.stringify(v.combination) ===
            JSON.stringify(newVariant.combination),
        );

        return match
          ? {
              ...newVariant,
              ...match,
            }
          : newVariant;
      });

      formik.setFieldValue("variants", merged);
    }
  }, [formik.values.options]);

  // Handle display variant toggle
  useEffect(() => {
    const hasValidOptions =
      formik.values.options.length > 0 &&
      formik.values.options.some(
        (opt) =>
          opt.name.trim() !== "" && opt.values.some((v) => v.trim() !== ""),
      );

    if (hasValidOptions && !displayVariant) {
      previousValuesRef.current = {
        price: formik.values.price,
        quantity: formik.values.quantity,
      };

      formik.setFieldValue("price", 0);
      formik.setFieldValue("quantity", 0);
      setDisplayVariant(true);
    }

    if (!hasValidOptions && displayVariant) {
      formik.setFieldValue("price", previousValuesRef.current.price || 0);
      formik.setFieldValue("quantity", previousValuesRef.current.quantity || 0);
      setDisplayVariant(false);
    }
  }, [formik.values.options, displayVariant]);

  // Cleanup image URLs
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.preview && !img.isExisting) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!formik.values.options) return;

    const updatedOptions = formik.values.options.map((opt) => {
      const hasEmpty = opt.values.some((v) => v.trim() === "");

      if (!hasEmpty) {
        return {
          ...opt,
          values: [...opt.values, ""],
        };
      }

      return opt;
    });

    formik.setFieldValue("options", updatedOptions);
  }, [formik.values.options.length]);

  // set initial snapshot once for create mode
  useEffect(() => {
    setInitialSnapshots(initialFormikValues, []);
  }, [initialFormikValues, setInitialSnapshots]);

  const refreshListing = async () => {
    await fetchData();
  };

  const values = {
    formik,
    listingLoading,
    paginatedData,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleAddOption,
    displayVariant,
    setDisplayVariant,
    treeData,
    images,
    setImages,
    handleImage,
    removeImage,
    statusOptions,
    searchBy,
    setSearchBy,
    search,
    setSearch,
    handleEditProduct,
    handleViewProduct,
    isViewMode,
    isEditMode,
    isCreateMode,
    resetToCreateMode,
    productDataLoading,
    refreshListing,
    showPopup,
    setShowPopup,
    nextPath,
    setNextPath,
    handleChangeStatus,
    handleGetAllMediaList,
    showMedia,
    setShowMedia,
    mediaList,
    setMediaList,
    mediaListLoading,
    setMediaListLoading,
    hasUnsavedChanges,
  };

  return (
    <ProductContext.Provider value={values}>{children}</ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);
