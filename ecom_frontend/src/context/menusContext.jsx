import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import {
  createMenuApi,
  getAllMenusApi,
  getMenuByIdApi,
  updateMenuApi,
  updateMenuStatus,
} from "@/services/menuService";

const MenusContext = createContext();

const MAX_LEVEL = 3;

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createMenuNode = (level = 1, parent_id = null) => ({
  id: generateId(),
  menu_label: "",
  menu_link: "",
  level,
  parent_id,
  children: [],
});

const mapBackendMenuTree = (items = [], parentId = null, level = 1) => {
  return items.map((item) => ({
    id: item.id || item.menu_item_id || generateId(),
    menu_item_id: item.menu_item_id || null,
    menu_label: item.menu_label || "",
    menu_link: item.menu_link || "",
    level: item.level || level,
    parent_id: item.parent_id || parentId,
    children: mapBackendMenuTree(
      item.children || [],
      item.id || item.menu_item_id || null,
      level + 1,
    ),
  }));
};

const validateTreeNodes = (nodes = [], level = 1) => {
  for (const node of nodes) {
    if (!node.menu_label?.trim()) return "Each menu item label is required";
    if (!node.menu_link?.trim()) return "Each menu item link is required";
    if (level > MAX_LEVEL) return "Only 3 nesting levels are allowed";

    if (node.children?.length) {
      const childError = validateTreeNodes(node.children, level + 1);
      if (childError) return childError;
    }
  }
  return null;
};

const flattenMenuTree = (nodes = [], parentId = null, level = 1) => {
  return nodes.flatMap((node, index) => {
    const nodeId = node.menu_item_id || node.id;

    const current = {
      menu_item_id: node.menu_item_id || undefined,
      temp_id: node.id,
      menu_label: node.menu_label,
      menu_link: node.menu_link,
      parent_id: parentId,
      level,
      order_by: index + 1,
    };

    return [
      current,
      ...flattenMenuTree(node.children || [], nodeId, level + 1),
    ];
  });
};

const updateNodeById = (nodes, nodeId, updater) =>
  nodes.map((node) => {
    if (node.id === nodeId) {
      return updater(node);
    }

    return {
      ...node,
      children: updateNodeById(node.children || [], nodeId, updater),
    };
  });

const removeNodeById = (nodes, nodeId) =>
  nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => ({
      ...node,
      children: removeNodeById(node.children || [], nodeId),
    }));

const addChildToNode = (nodes, parentId) =>
  nodes.map((node) => {
    if (node.id === parentId) {
      if (node.level >= MAX_LEVEL) {
        return node;
      }

      const child = createMenuNode(node.level + 1, node.id);

      return {
        ...node,
        children: [...(node.children || []), child],
      };
    }

    return {
      ...node,
      children: addChildToNode(node.children || [], parentId),
    };
  });

const findNodeById = (nodes, nodeId) => {
  for (const node of nodes) {
    if (node.id === nodeId) return node;

    if (node.children?.length) {
      const found = findNodeById(node.children, nodeId);
      if (found) return found;
    }
  }

  return null;
};

const isDescendant = (parentNode, targetId) => {
  if (!parentNode?.children?.length) return false;

  for (const child of parentNode.children) {
    if (child.id === targetId) return true;
    if (isDescendant(child, targetId)) return true;
  }

  return false;
};

const getNodeAndRemove = (nodes, nodeId) => {
  let removedNode = null;

  const next = nodes
    .filter((node) => {
      if (node.id === nodeId) {
        removedNode = node;
        return false;
      }
      return true;
    })
    .map((node) => {
      const result = getNodeAndRemove(node.children || [], nodeId);

      if (result.removedNode) {
        removedNode = result.removedNode;
      }

      return {
        ...node,
        children: result.next,
      };
    });

  return { next, removedNode };
};

const updateLevelsRecursively = (nodes, level = 1, parentId = null) =>
  nodes.map((node) => ({
    ...node,
    level,
    parent_id: parentId,
    children: updateLevelsRecursively(node.children || [], level + 1, node.id),
  }));

const insertNodeInsideTarget = (nodes, targetId, draggedNode) =>
  nodes.map((node) => {
    if (node.id === targetId) {
      const nextLevel = node.level + 1;

      if (nextLevel > MAX_LEVEL) return node;

      return {
        ...node,
        children: [
          ...(node.children || []),
          ...updateLevelsRecursively([draggedNode], nextLevel, node.id),
        ],
      };
    }

    return {
      ...node,
      children: insertNodeInsideTarget(
        node.children || [],
        targetId,
        draggedNode,
      ),
    };
  });

export const MenusProvider = ({ children }) => {
  const navigate = useNavigate();

  const [mode, setMode] = useState("create");
  const [listing, setListing] = useState([]);
  const [listingLoading, setListingLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentMenuId, setCurrentMenuId] = useState(null);
  const [menuTree, setMenuTree] = useState([]);
  const itemsPerPage = 10;
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";

  const [linkOptions] = useState([
    { label: "Home page", value: "/" },
    { label: "Contact", value: "/contact" },
    { label: "Privacy Policy", value: "/privacy-policy" },
    { label: "Products", value: "/products" },
    { label: "Collections", value: "/collections" },
    { label: "Policies", value: "/policies" },
    { label: "Newsletter", value: "__newsletter" },
  ]);

  const validationSchema = Yup.object({
    name: Yup.string().required("Menu Name is required"),
    status: Yup.string().required("Status is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      status: "DRAFT",
      menuItems: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const treeError = validateTreeNodes(menuTree);

        if (treeError) {
          toast.error(treeError);
          return;
        }

        if (menuTree.length === 0) {
          toast.error("At least 1 menu item required");
          return;
        }

        const payload = {
          name: values.name,
          status: values.status,
          menuItems: flattenMenuTree(menuTree),
        };

        if (isEditMode) {
          const res = await updateMenuApi(currentMenuId, payload);

          if (res?.data?.success) {
            toast.success("Menu Updated Successfully");
            resetToCreateMode();
            await fetchMenus();
            navigate("/menus");
          }
        } else {
          const res = await createMenuApi(payload);

          if (res?.data?.success) {
            toast.success("Menu Created Successfully");
            resetToCreateMode();
            await fetchMenus();
            navigate("/menus");
          }
        }
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || "Failed");
      }
    },
  });

  const fetchMenus = async () => {
    setListingLoading(true);
    try {
      let statusBy = "";

      if (searchBy !== "ALL") {
        statusBy = searchBy;
      } else {
        statusBy = "";
      }

      const res = await getAllMenusApi(
        currentPage,
        itemsPerPage,
        search,
        statusBy,
      );
      setListing(res?.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setListingLoading(false);
    }
  };

  const fetchMenuById = async (id, viewMode = false) => {
    try {
      const res = await getMenuByIdApi(id);
      const menu = res?.data?.data;
      if (!menu) return;

      const parsedTree = mapBackendMenuTree(menu.menuItems || []);

      setCurrentMenuId(id);
      setMode(viewMode ? "view" : "edit");
      setMenuTree(parsedTree);

      formik.setValues({
        name: menu.name || "",
        status: menu.status || "DRAFT",
        menuItems: menu.menuItems || [],
      });

      navigate(viewMode ? `/menus/view/${id}` : `/menus/edit/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load menu");
    }
  };

  const handleEditMenu = async (id) => {
    await fetchMenuById(id, false);
  };

  const handleViewMenu = async (id) => {
    await fetchMenuById(id, true);
  };

  const resetToCreateMode = () => {
    setMode("create");
    setCurrentMenuId(null);
    setMenuTree([]);
    formik.resetForm();
  };

  const handleAddMenuItem = () => {
    setMenuTree((prev) => [...prev, createMenuNode(1, null)]);
  };

  const handleAddChildItem = (parentId) => {
    const parentNode = findNodeById(menuTree, parentId);

    if (!parentNode) return;

    if (parentNode.level >= MAX_LEVEL) {
      toast.error("Only 3 levels are allowed");
      return;
    }

    setMenuTree((prev) => addChildToNode(prev, parentId));
  };

  const handleRemoveMenuItem = (id) => {
    setMenuTree((prev) => removeNodeById(prev, id));
  };

  const handleUpdateMenuItem = (id, field, value) => {
    setMenuTree((prev) =>
      updateNodeById(prev, id, (node) => ({
        ...node,
        [field]: value,
      })),
    );
  };

  const handleDropInside = (activeId, overId) => {
    if (!activeId || !overId || activeId === overId) return;

    const targetNode = findNodeById(menuTree, overId);
    const draggedNode = findNodeById(menuTree, activeId);

    if (!targetNode || !draggedNode) return;

    if (isDescendant(draggedNode, overId)) {
      toast.error("You cannot drop a parent inside its own child");
      return;
    }

    if (targetNode.level >= MAX_LEVEL) {
      toast.error("Only 3 levels are allowed");
      return;
    }

    const removed = getNodeAndRemove(menuTree, activeId);
    if (!removed.removedNode) return;

    const inserted = insertNodeInsideTarget(
      removed.next,
      overId,
      removed.removedNode,
    );

    setMenuTree(inserted);
  };

  const handleChangeStatus = async (id, status) => {
    try {
      const res = await updateMenuStatus(id, { status });

      if (res?.data?.success) {
        fetchMenus();
      }
    } catch (err) {
      console.error("Error updating menu status:", err);
      toast.error("Failed to update menu status");
    }
  };

  const findMenuItemById = (items, id) => {
    for (const item of items || []) {
      if (item.id === id) return item;

      if (item.children?.length) {
        const found = findMenuItemById(item.children, id);
        if (found) return found;
      }
    }

    return null;
  };

  const paginatedSource = useMemo(() => {
    return listing.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [listing, search]);

  const { paginatedData, totalPages } = useMemo(() => {
    const totalPages = Math.ceil(paginatedSource.length / itemsPerPage) || 1;

    const paginatedData = paginatedSource.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );

    return { paginatedData, totalPages };
  }, [paginatedSource, currentPage]);

  useEffect(() => {
    fetchMenus();
  }, [search, itemsPerPage, currentPage, searchBy]);

  return (
    <MenusContext.Provider
      value={{
        formik,
        listingLoading,
        paginatedData,
        totalPages,
        currentPage,
        itemsPerPage,
        search,
        isCreateMode,
        isEditMode,
        isViewMode,
        linkOptions,
        menuTree,
        searchBy,
        setSearchBy,
        setSearch,
        setCurrentPage,
        setMenuTree,
        resetToCreateMode,
        handleEditMenu,
        handleViewMenu,
        handleAddMenuItem,
        handleAddChildItem,
        handleRemoveMenuItem,
        handleUpdateMenuItem,
        handleDropInside,
        handleChangeStatus,
        findMenuItemById,
      }}
    >
      {children}
    </MenusContext.Provider>
  );
};

export const useMenus = () => useContext(MenusContext);
