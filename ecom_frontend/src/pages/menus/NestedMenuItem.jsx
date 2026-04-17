import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, PlusCircle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { useMenus } from "@/context/menusContext";

export const NestedMenuItem = ({
  item,
  depth = 0,
  isDisabled = false,
  overId = null,
}) => {
  const {
    linkOptions,
    handleAddChildItem,
    handleRemoveMenuItem,
    handleUpdateMenuItem,
    handleDropInside,
  } = useMenus();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: "menu-item",
      item,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 220ms ease",
  };

  const leftIndent = depth * 20;
  const isOver = overId === item.id;

  return (
    <div
      className="space-y-3"
      style={{
        marginLeft: depth === 0 ? 0 : `${leftIndent}px`,
      }}
    >
      <div className="relative">
        {isOver && !isDragging && (
          <div className="absolute left-0 right-0 z-20 h-[2px] -top-1 rounded-full bg-blue-500" />
        )}
        <div
          ref={setNodeRef}
          style={style}
          className={[
            "rounded-2xl border bg-white shadow-sm transition-all",
            isOver
              ? "border-blue-400 ring-2 ring-blue-100 bg-blue-50/40"
              : "border-slate-200",
            isDragging
              ? "scale-[0.995] opacity-35 shadow-lg"
              : "hover:shadow-md",
          ].join(" ")}
        >
          <div className="p-4 md:p-5">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <span
                  {...attributes}
                  {...listeners}
                  className="flex items-center justify-center w-5 h-10 transition cursor-grab text-slate-500 active:cursor-grabbing"
                >
                  <GripVertical size={15} />
                </span>
              </div>

              <div className="flex-1 grid gap-4 grid-cols-12">
                <div className="lg:col-span-6">
                  <Input
                    label=""
                    placeholder="Label..."
                    value={item.menu_label}
                    onChange={(e) =>
                      handleUpdateMenuItem(
                        item.id,
                        "menu_label",
                        e.target.value,
                      )
                    }
                    disabled={isDisabled}
                  />
                </div>

                <div className="lg:col-span-6">
                  <CustomDropdown
                    options={linkOptions}
                    optionLabelKey="label"
                    optionValueKey="value"
                    name={`menu_link_${item.id}`}
                    label=""
                    value={item.menu_link}
                    onChange={(name, val) =>
                      handleUpdateMenuItem(item.id, "menu_link", val)
                    }
                    isAddNew={false}
                    isMulti={false}
                    isViewMode={isDisabled}
                  />
                </div>
              </div>

              {!isDisabled && (
                <div className="flex flex-wrap items-end gap-1 lg:col-span-3 lg:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDropInside(item.id, item.id)}
                    className="hidden"
                  >
                    Hidden Action
                  </Button>

                  {item.level < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddChildItem(item.id)}
                      className="h-8 rounded-lg"
                    >
                      <PlusCircle size={16} className="" />
                      Child
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemoveMenuItem(item.id)}
                    className="h-8 rounded-lg border-none hover:bg-transparent"
                  >
                    <Trash2 size={16} color="red" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {item.children?.length > 0 && (
        <div className="relative pl-5 ml-5 space-y-3">
          <div className="absolute top-0 bottom-0 left-0 w-px bg-slate-200" />
          {item.children.map((child) => (
            <div key={child.id} className="relative">
              <div className="absolute left-[-20px] top-8 h-px w-4 bg-slate-200" />
              <NestedMenuItem
                item={child}
                depth={depth + 1}
                isDisabled={isDisabled}
                overId={overId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
