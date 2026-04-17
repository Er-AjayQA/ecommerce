import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  getAllFilteredProducts,
  getAllProducts,
} from "@/services/productService";
import { useNavigate } from "react-router-dom";
import {
  createCollections,
  getAllCollectionsApi,
  getByIdCollections,
  updateCollections,
  updateCollectionStatus,
} from "@/services/collectionService";
import { getAllMediaApi } from "@/services/mediaService";

const formDataToObject = (formData) => {
  const object = {};
  for (let [key, value] of formData.entries()) {
    if (key === "files") {
      if (!object[key]) object[key] = [];
      object[key].push(value);
    } else {
      // Try to parse JSON strings
      try {
        object[key] = JSON.parse(value);
      } catch {
        object[key] = value;
      }
    }
  }
  return object;
};

const CollectionsContext = createContext();

export const CollectionsProvider = ({ children }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("create");
  const [listing, setListing] = useState([]);
  const [listingLoading, setListingLoading] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [mediaListLoading, setMediaListLoading] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const [productOptionsLoading, setProductOptionsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [images, setImages] = useState([]);
  const [searchBy, setSearchBy] = useState("ALL");
  const [currentCollectionId, setCurrentCollectionId] = useState(null);
  const [collectionDataLoading, setCollectionDataLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [nextPath, setNextPath] = useState(null);
  const [selectedProductsWithDetails, setSelectedProductsWithDetails] =
    useState([]);
  const [isProductsLoaded, setIsProductsLoaded] = useState(false);
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";
  const initialDataLoadedRef = useRef(false);

  const selectionTypeOptions = [
    {
      label: "Manual",
      value: "MANUAL",
      description: "Add products to this collection one by one.",
    },
    {
      label: "Smart",
      value: "SMART",
      description:
        "Existing and future products that match the conditions you set will automatically be added to this collection.",
    },
  ];

  const statusOptions = [
    { label: "All", value: "ALL" },
    { label: "Draft", value: "DRAFT" },
    { label: "Published", value: "PUBLISHED" },
  ];

  const conditionMatchingOptions = [
    {
      label: "All Conditions",
      value: "ALL",
    },
    {
      label: "Any Condition",
      value: "ANY",
    },
  ];

  const conditionBaseOptions = [
    {
      label: "Title",
      value: "title",
    },
    {
      label: "Type",
      value: "type",
    },
    {
      label: "Category",
      value: "category",
    },
    {
      label: "Vendor",
      value: "vendor",
    },
    {
      label: "Tag",
      value: "tag",
    },
    {
      label: "Price",
      value: "price",
    },
    {
      label: "Weight",
      value: "weight",
    },
    {
      label: "Inventory Stock",
      value: "inventory_stock",
    },
  ];

  // Get Condition Type
  const getConditionTypesOptions = (type) => {
    switch (type) {
      case "title":
      case "type":
      case "vendor":
        return [
          { label: "Contains", value: "contains" },
          { label: "Does not Contains", value: "not_contains" },
          { label: "Is Equal to", value: "is_equal_to" },
          { label: "Is not Equal to", value: "is_not_equal_to" },
          { label: "Starts With", value: "starts_with" },
          { label: "Ends With", value: "ends_with" },
        ];
      case "category":
      case "tag":
        return [
          { label: "Is Equal to", value: "is_equal_to" },
          { label: "Is not Equal to", value: "is_not_equal_to" },
        ];
      case "price":
      case "weight":
        return [
          { label: "Is Equal to", value: "is_equal_to" },
          { label: "Is not Equal to", value: "is_not_equal_to" },
          { label: "Is Greater than", value: "is_greater_than" },
          { label: "Is Less than", value: "is_less_than" },
        ];
      case "inventory_stock":
        return [
          { label: "Is Equal to", value: "is_equal_to" },
          { label: "Is Greater than", value: "is_greater_than" },
          { label: "Is Less than", value: "is_less_than" },
        ];
      default:
        return [
          { label: "Contains", value: "contains" },
          { label: "Does not Contains", value: "not_contains" },
          { label: "Is Equal to", value: "is_equal_to" },
          { label: "Is not Equal to", value: "is_not_equal_to" },
          { label: "Starts With", value: "starts_with" },
          { label: "Ends With", value: "ends_with" },
        ];
    }
  };

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
      const res = await getAllCollectionsApi(
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

  // Fetch All Products for Manual Collection
  const fetchAllProducts = async () => {
    setProductOptionsLoading(true);
    try {
      const res = await getAllProducts(
        1,
        100, // Fetch more products for manual selection
        search,
        "",
      );
      setProductOptions(res?.data?.data || []);
    } catch (err) {
      console.error("Error fetching products list:", err);
    } finally {
      setProductOptionsLoading(false);
    }
  };

  // Fetch Filtered Products
  const fetchFilteredProducts = async (validConditions) => {
    setProductOptionsLoading(true);
    try {
      if (validConditions.length === 0) {
        setProductOptions([]);
        return;
      }

      const data = {
        conditions: validConditions,
        condition_apply_type: formik.values.condition_apply_type,
      };

      const res = await getAllFilteredProducts(search, data);
      setProductOptions(res?.data?.data || []);
    } catch (err) {
      console.error("Error fetching filtered products list:", err);
      setProductOptions([]);
    } finally {
      setProductOptionsLoading(false);
    }
  };

  // Check if a condition is valid (all fields filled)
  const isValidCondition = (condition) => {
    return (
      condition.title &&
      condition.title.trim() !== "" &&
      condition.algorithm &&
      condition.algorithm.trim() !== "" &&
      Array.isArray(condition.values) &&
      condition.values.length > 0 &&
      condition.values.some((val) => val && val.toString().trim() !== "")
    );
  };

  // Get only valid conditions
  const getValidConditions = (conditions) => {
    if (!Array.isArray(conditions)) return [];
    return conditions.filter(isValidCondition);
  };

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

  // Validation schema
  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    conditions: Yup.array().when("collection_type", {
      is: "SMART",
      then: (schema) =>
        schema
          .test(
            "at-least-one-valid-condition",
            "Please add at least one valid condition",
            (conditions) => {
              if (!Array.isArray(conditions)) return false;

              return conditions.some((cond) => {
                const hasTitle = cond?.title?.trim();
                const hasAlgorithm = cond?.algorithm?.trim();
                const hasValues =
                  Array.isArray(cond?.values) &&
                  cond.values.some((v) => v && v.toString().trim() !== "");

                return hasTitle && hasAlgorithm && hasValues;
              });
            },
          )
          .required("Conditions are required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    products: Yup.array()
      .min(1, "Please select at least one product")
      .required("Products is required"),
  });

  const initialFormikValues = {
    title: "",
    collection_type: "MANUAL",
    condition_apply_type: "ALL",
    conditions: [{ title: "", algorithm: "", values: [] }],
    products: [],
    description: "",
    status: "DRAFT",
  };

  // Reset form to initial state
  const resetToCreateMode = () => {
    setMode("create");
    setCurrentCollectionId(null);
    formik.resetForm();
    setImages([]);
    setCurrentPage(1);
    setProductOptions([]);
  };

  const formik = useFormik({
    initialValues: initialFormikValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();

        // Handle images
        const newFiles = images.filter((img) => img.file && !img.isExisting);
        const existingImages = images.filter((img) => img.isExisting && img.id);

        // Append new files
        newFiles.forEach((img) => {
          formData.append("files", img.file);
        });

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
          formData.append("existing_images", JSON.stringify([]));
        }

        formData.append("title", values.title);
        formData.append("collection_type", values.collection_type);
        formData.append("condition_apply_type", values.condition_apply_type);
        formData.append("description", values.description);
        formData.append("status", values.status);

        const cleanConditions = (values.conditions || [])
          .filter((cond) => {
            const hasValidTitle = cond?.title && cond.title.trim() !== "";
            const hasValidAlgorithm =
              cond?.algorithm && cond.algorithm.trim() !== "";
            const hasValidValues =
              Array.isArray(cond?.values) &&
              cond.values.length > 0 &&
              cond.values.some((v) => v && v.toString().trim() !== "");

            return hasValidTitle && hasValidAlgorithm && hasValidValues;
          })
          .map((cond) => ({
            title: cond.title,
            algorithm: cond.algorithm,
            values: (cond.values || []).filter(
              (v) => v && v.toString().trim() !== "",
            ),
          }));

        formData.append("conditions", JSON.stringify(cleanConditions));
        formData.append("products", JSON.stringify(values.products));

        // console.log("FormData as object:", formDataToObject(formData));
        // return;

        if (isEditMode) {
          const res = await updateCollections(currentCollectionId, formData);
          if (res.data.success) {
            toast.success("Collection updated successfully!");
            await refreshListing();
            resetToCreateMode();
            navigate("/collections");
          }
        } else {
          const res = await createCollections(formData);
          if (res.data.success) {
            toast.success("Collection created successfully!");
            await refreshListing();
            resetToCreateMode();
            navigate("/collections");
          }
        }
      } catch (error) {
        console.error("Error details:", error.response?.data || error);
        toast.error(error.response?.data?.message || "Failed to save product");
      }
    },
  });

  // Handle Edit & View Collection
  const fetchCollectionData = async (id, viewMode = false) => {
    setCollectionDataLoading(true);
    try {
      const res = await getByIdCollections(id);
      const collectionData = res?.data?.data || null;

      if (collectionData) {
        setMode(viewMode ? "view" : "edit");
        setCurrentCollectionId(id);

        // Mark that initial data is loaded
        initialDataLoadedRef.current = true;

        // Process conditions - ensure values is always an array
        const processedConditions = (collectionData.conditions || []).map(
          (cond) => ({
            ...cond,
            values: Array.isArray(cond.values)
              ? cond.values
              : cond.values
                ? [cond.values]
                : [],
          }),
        );

        // Set form values
        formik.setValues({
          title: collectionData.title || "",
          collection_type:
            collectionData.collection_type === "SMART" ? "SMART" : "MANUAL",
          condition_apply_type:
            collectionData.condition_apply_type === "ANY" ? "ANY" : "ALL",
          conditions:
            processedConditions.length > 0
              ? processedConditions
              : [{ title: "", algorithm: "", values: [] }],
          products: collectionData.products || [],
          description: collectionData.description || "",
          status: collectionData.status || "DRAFT",
        });

        // Set images if any
        if (collectionData.media && collectionData.media.length > 0) {
          const existingImages = collectionData.media.map((media, idx) => ({
            file: null,
            preview: media.url,
            id: media.collection_media_id,
            type: media.type,
            isExisting: true,
            position: media.position || idx + 1,
          }));

          setImages(existingImages);
        }

        setTimeout(() => {
          initialDataLoadedRef.current = false;
        }, 1000);

        // Navigate after state updates
        if (viewMode) {
          navigate(`/collections/view/${id}`);
        } else {
          navigate(`/collections/edit/${id}`);
        }
      }
    } catch (err) {
      console.error("Error fetching collection detail:", err);
      toast.error("Failed to load collection data");
    } finally {
      setCollectionDataLoading(false);
    }
  };

  const handleEditCollection = async (id) => {
    await fetchCollectionData(id, false);
  };

  const handleViewCollection = async (id) => {
    await fetchCollectionData(id, true);
  };

  // Handle Add new Conditions
  const handleAddCondition = () => {
    const newCondition = { title: "", algorithm: "", values: [] };
    formik.setFieldValue("conditions", [
      ...formik.values.conditions,
      newCondition,
    ]);
  };

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

    // Show error for invalid file types
    if (invalidFiles.length > 0) {
      toast.error(`Please use JPEG, JPG, PNG, AVIF, GIF, WEBP, MP4, or WEBM`);
      return;
    }

    // If no valid files, return
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

  const refreshListing = async () => {
    await fetchData();
  };

  // Handle product fetching based on collection type and conditions
  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const fetchProducts = async () => {
      // All Products API
      if (formik.values.collection_type === "MANUAL") {
        if (!productOptionsLoading) {
          timeoutId = setTimeout(async () => {
            if (isMounted) {
              await fetchAllProducts();
            }
          }, 500);
        }
        return;
      }

      // Filtered Product API
      if (formik.values.collection_type === "SMART") {
        const validConditions = getValidConditions(formik.values.conditions);

        if (validConditions.length > 0) {
          if (!productOptionsLoading) {
            timeoutId = setTimeout(async () => {
              if (isMounted) {
                await fetchFilteredProducts(validConditions);
              }
            }, 500);
          }
        } else {
          if (isMounted && !productOptionsLoading) {
            setProductOptions([]);
            if (formik.values.products?.length > 0) {
              formik.setFieldValue("products", []);
              setSelectedProductsWithDetails([]);
            }
          }
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    search,
    formik.values.collection_type,
    formik.values.conditions,
    formik.values.condition_apply_type,
  ]);

  // Product Details
  useEffect(() => {
    if (productOptions.length > 0 && formik.values.products?.length > 0) {
      const detailedProducts = formik.values.products
        .map((productId) =>
          productOptions.find((p) => p.product_id === productId),
        )
        .filter(Boolean);

      setSelectedProductsWithDetails(detailedProducts);
      setIsProductsLoaded(true);
    } else if (
      productOptions.length > 0 &&
      formik.values.products?.length === 0
    ) {
      setSelectedProductsWithDetails([]);
      setIsProductsLoaded(true);
    }
  }, [productOptions, formik.values.products]);

  // Product Details in edit mode
  useEffect(() => {
    if (
      isEditMode &&
      productOptions.length > 0 &&
      formik.values.products?.length > 0 &&
      !isProductsLoaded
    ) {
      const detailedProducts = formik.values.products
        .map((productId) =>
          productOptions.find((p) => p.product_id === productId),
        )
        .filter(Boolean);
      setSelectedProductsWithDetails(detailedProducts);
      setIsProductsLoaded(true);
    }
  }, [isEditMode, productOptions, formik.values.products, isProductsLoaded]);

  // Handle remove product
  const handleRemoveProduct = (productId) => {
    if (formik.values.collection_type === "SMART") {
      toast.warning(
        "Cannot remove products from SMART collection. They are auto-selected based on conditions.",
        {
          position: "top-right",
          autoClose: 3000,
        },
      );
      return;
    }

    const updatedProductIds = formik.values.products.filter(
      (id) => id !== productId,
    );
    formik.setFieldValue("products", updatedProductIds);

    // Fix the filter logic
    setSelectedProductsWithDetails((prev) =>
      prev.filter((product) => product.product_id !== productId),
    );
  };

  // Handle clear all products
  const handleClearAllProducts = () => {
    if (formik.values.collection_type === "SMART") {
      toast.warning(
        "Cannot clear products from SMART collection. They are auto-selected based on conditions.",
        {
          position: "top-right",
          autoClose: 3000,
        },
      );
      return;
    }

    formik.setFieldValue("products", []);
    setSelectedProductsWithDetails([]);
  };

  // Handle clear all conditions
  const handleClearAllConditions = () => {
    formik.setFieldValue("conditions", [
      { title: "", algorithm: "", values: [] },
    ]);
  };

  // Handle Change Status
  const handleChangeStatus = async (id, status) => {
    try {
      const res = await updateCollectionStatus(id, { status });

      if (res?.data?.success) {
        fetchData();
      }
    } catch (err) {
      console.error("Error updating colelction status:", err);
      toast.error("Failed to update colelction status");
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

  // Auto Select products in SMART collection type
  useEffect(() => {
    if (formik.values.collection_type === "SMART") {
      const validConditions = getValidConditions(formik.values.conditions);

      if (validConditions.length > 0 && productOptions.length > 0) {
        const productIds = productOptions.map((product) => product.product_id);

        const currentIds = formik.values.products || [];
        const isDifferent =
          productIds.length !== currentIds.length ||
          productIds.some((id) => !currentIds.includes(id));

        if (isDifferent) {
          formik.setFieldValue("products", productIds);
          setSelectedProductsWithDetails(productOptions);
          setIsProductsLoaded(true);
        }
      } else if (
        validConditions.length === 0 &&
        formik.values.products?.length > 0
      ) {
        formik.setFieldValue("products", []);
        setSelectedProductsWithDetails([]);
        setIsProductsLoaded(true);
      }
    }
  }, [
    formik.values.collection_type,
    productOptions,
    formik.values.conditions,
    getValidConditions,
  ]);

  // Initial Listing
  useEffect(() => {
    fetchData();
  }, [search, itemsPerPage, currentPage, searchBy]);

  const values = {
    formik,
    listingLoading,
    paginatedData,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleAddCondition,
    images,
    setImages,
    handleImage,
    removeImage,
    statusOptions,
    searchBy,
    setSearchBy,
    search,
    setSearch,
    handleEditCollection,
    handleViewCollection,
    isViewMode,
    isEditMode,
    isCreateMode,
    resetToCreateMode,
    collectionDataLoading,
    refreshListing,
    showPopup,
    setShowPopup,
    nextPath,
    setNextPath,
    selectionTypeOptions,
    getConditionTypesOptions,
    conditionBaseOptions,
    conditionMatchingOptions,
    productOptions,
    setProductOptions,
    productOptionsLoading,
    setProductOptionsLoading,
    isValidCondition,
    getValidConditions,
    handleRemoveProduct,
    handleClearAllProducts,
    selectedProductsWithDetails,
    setSelectedProductsWithDetails,
    isProductsLoaded,
    setIsProductsLoaded,
    handleClearAllConditions,
    handleChangeStatus,
    handleGetAllMediaList,
    showMedia,
    setShowMedia,
    mediaList,
    setMediaList,
    mediaListLoading,
    setMediaListLoading,
  };

  return (
    <CollectionsContext.Provider value={values}>
      {children}
    </CollectionsContext.Provider>
  );
};

export const useCollections = () => useContext(CollectionsContext);
