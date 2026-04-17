import { Label } from "@/components/ui/label";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { useTestForm } from "@/context/testFormContext";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { Button } from "@/components/ui/button";
 
export const TestForm = () => {
  const { formik } = useTestForm();
 
  const options = [
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
  ];
 
  return (
    <form
      onSubmit={formik.handleSubmit}
      className="bg-[#f6f6f7] min-h-screen p-6"
    >
      <div className="flex flex-col gap-4 py-5">
        <div>
          <CustomDropdown
            fieldType="category"
            name="catgeory_id"
            label="Product Category"
            value={formik.values.catgeory_id}
            onChange={formik.setFieldValue}
            onBlur={formik.handleBlur}
            touched={formik.touched.catgeory_id}
            error={formik.errors.catgeory_id}
            isAddNew={false}
          />
        </div>
 
        <div className="space-y-2">
          <CustomDropdown
            fieldType="vendor"
            name="vendor_id"
            label="Product Vendor"
            value={formik.values.vendor_id}
            onChange={formik.setFieldValue}
            onBlur={formik.handleBlur}
            touched={formik.touched.vendor_id}
            error={formik.errors.vendor_id}
            isAddNew={true}
          />
        </div>
 
        <CustomSelect
          label="Product"
          placeholder="Select a product"
          options={options}
          value={formik.values.product_id}
          onValueChange={(val) => formik.setFieldValue("product_id", val)}
          touched={formik.touched.product_id}
          error={formik.errors.product_id}
        />
 
        <div>
          <Button type="submit">Add</Button>
        </div>
 
        {/* Optional: Display selected values for debugging */}
        <div className="mt-4 text-sm text-gray-500">
          <p>Selected Category ID: {formik.values.catgeory_id}</p>
          <p>Selected Vendor ID: {formik.values.vendor_id}</p>
        </div>
      </div>
    </form>
  );
};