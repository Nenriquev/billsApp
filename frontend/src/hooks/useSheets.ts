import { useDispatch } from "react-redux";
import { setErrors } from "../redux/slices/dataSlice";

const apiUrl = import.meta.env.VITE_BACKEND_URL;

export const useSheets = () => {
  const dispatch = useDispatch();

  const uploadSheet = async (formData: any) => {
    try {
      const upload = await fetch(`${apiUrl}/api/sheet/upload`, {
        method: "post",
        body: formData,
      });

      const response = await upload.json();

      if (upload.status !== 200) {
        dispatch(setErrors({ uploadSheet: response.err }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return { uploadSheet };
};
