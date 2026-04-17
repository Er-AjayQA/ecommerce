import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CirclePlus, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";

import { useMenus } from "@/context/menusContext";
import { NestedMenuItem } from "./NestedMenuItem";
import { useFormUnsavedChanges } from "@/context/unsavedChangesContext";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

export const AddMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const {
    formik,
    isCreateMode,
    isEditMode,
    isViewMode,
    menuTree,
    resetToCreateMode,
    handleEditMenu,
    handleViewMenu,
    handleAddMenuItem,
    handleDropInside,
    findMenuItemById,
    linkOptions,
  } = useMenus();

  const isDisabled = isViewMode;
  const activeItem = activeId ? findMenuItemById(menuTree, activeId) : null;

  const { confirmNavigation } = useFormUnsavedChanges({
    when: isCreateMode || isEditMode,
    isDirty: formik.dirty,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const getPageTitle = () => {
    if (isViewMode) return "View Menu";
    if (isEditMode) return "Edit Menu";
    return "Add New Menu";
  };

  useEffect(() => {
    if (!id) {
      resetToCreateMode();
      return;
    }

    const isViewPath = window.location.pathname.includes("/view/");
    const isEditPath = window.location.pathname.includes("/edit/");

    if (isViewPath) handleViewMenu(id);
    if (isEditPath) handleEditMenu(id);
  }, [id]);

  const handleBack = () => {
    confirmNavigation(() => {
      resetToCreateMode();
      navigate("/menus");
    });
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="w-full py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            className="w-10 h-10 p-0 rounded-xl"
          >
            <ArrowLeft size={18} />
          </Button>

          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">
              {getPageTitle()}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your menu details and structure
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="grid grid-cols-1 gap-5 pt-6 md:grid-cols-2">
            <Input
              label="Menu Name"
              placeholder="e.g Header Menu"
              value={formik.values.name}
              onChange={(e) => formik.setFieldValue("name", e.target.value)}
              touched={formik.touched.name}
              error={formik.errors.name}
              disabled={isDisabled}
            />

            <CustomSelect
              label="Status"
              options={[
                { label: "Draft", value: "DRAFT" },
                { label: "Published", value: "PUBLISHED" },
              ]}
              value={formik.values.status}
              onValueChange={(val) => formik.setFieldValue("status", val)}
              disabled={isDisabled}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Menu Items</CardTitle>

              <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                {menuTree?.length || 0} root item
                {menuTree?.length === 1 ? "" : "s"}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-4 md:p-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={({ active }) => {
                setActiveId(active.id);
              }}
              onDragOver={({ over }) => {
                setOverId(over?.id || null);
              }}
              onDragCancel={() => {
                setActiveId(null);
                setOverId(null);
              }}
              onDragEnd={({ active, over }) => {
                setActiveId(null);

                if (!over) {
                  setOverId(null);
                  return;
                }

                if (active.id === over.id) {
                  setOverId(null);
                  return;
                }

                handleDropInside(active.id, over.id);
                setOverId(null);
              }}
            >
              <div className="space-y-4">
                {menuTree?.length > 0 ? (
                  menuTree.map((item) => (
                    <NestedMenuItem
                      key={item.id}
                      item={item}
                      isDisabled={isDisabled}
                      overId={overId}
                    />
                  ))
                ) : (
                  <div className="px-6 py-10 text-center border border-dashed rounded-2xl border-slate-300 bg-slate-50">
                    <p className="text-sm text-slate-500">
                      No menu items added yet.
                    </p>
                  </div>
                )}
              </div>
              <DragOverlay>
                {activeItem ? (
                  <div className="bg-white border shadow-2xl rounded-2xl border-slate-200 opacity-95">
                    <div className="p-4 md:p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center pt-5">
                          <span className="flex items-center justify-center w-10 h-10 border rounded-xl border-slate-200 bg-slate-50 text-slate-500">
                            ::
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                            <div className="lg:col-span-4">
                              <Input
                                label="Label"
                                value={activeItem.menu_label || ""}
                                disabled
                              />
                            </div>

                            <div className="lg:col-span-5">
                              <CustomDropdown
                                options={linkOptions}
                                optionLabelKey="label"
                                optionValueKey="value"
                                name={`drag_preview_${activeItem.id}`}
                                label="Link"
                                value={activeItem.menu_link}
                                onChange={() => {}}
                                isAddNew={false}
                                isMulti={false}
                                isViewMode={true}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </CardContent>

          {!isDisabled && (
            <CardFooter className="p-0">
              <Button
                type="button"
                variant="outline"
                className="w-full h-8 bg-gray-200"
                onClick={handleAddMenuItem}
              >
                <CirclePlus size={16} className="mr-2" />
                Add menu item
              </Button>
            </CardFooter>
          )}
        </Card>

        {!isDisabled && (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="px-6 h-11 rounded-xl"
            >
              Cancel
            </Button>

            <Button type="submit" className="px-6 h-11 rounded-xl">
              <Save size={16} className="mr-2" />
              {isEditMode ? "Update Menu" : "Save Menu"}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
};
