import { createContext, useContext } from "react";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";

const TestFormContext = createContext();

export const TestFormProvider = ({ children }) => {
  // Validation schema
  const validationSchema = Yup.object({
    catgeory_id: Yup.string().required("Category is required"),
    product_id: Yup.string().required("Product is required"),
  });

  const initialFormikValues = {
    catgeory_id: "",
    product_id: "",
    vendor_id: "",
  };

  const formik = useFormik({
    initialValues: initialFormikValues,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        console.log(values);
      } catch (error) {
        toast.error("Failed to process Product Cateogries");
      }
    },
  });

  return (
    <TestFormContext.Provider
      value={{
        formik,
      }}
    >
      {children}
    </TestFormContext.Provider>
  );
};

export const useTestForm = () => useContext(TestFormContext);
