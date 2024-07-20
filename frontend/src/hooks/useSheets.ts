import { useDispatch } from "react-redux";
import { setErrors } from "../redux/slices/dataSlice";
import { setToast } from "../redux/slices/appSlice";

const apiUrl = import.meta.env.VITE_BACKEND_URL;

export const useSheets = () => {
  const dispatch = useDispatch();

  const uploadSheet = async (formData: any) => {
    try {
      const upload = await fetch(`${apiUrl}/sheet/upload`, {
        method: "post",
        body: formData,
      });

      const response = await upload.json();

      if (upload.status !== 200) {
        dispatch(setErrors({ uploadSheet: response.err }));
        dispatch(setToast({ open: true, msg: response.err, type: "danger" }));
      } else {
        dispatch(setToast({ open: true, msg: "Archivo subido exitosamente!", type: "success" }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return { uploadSheet };
};
