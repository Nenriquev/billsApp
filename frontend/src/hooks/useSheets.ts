
const apiUrl = import.meta.env.VITE_BACKEND_URL;

export const useSheets = () => {
  const uploadSheet = async (formData: any) => {
    
    try {
      const response = await fetch(`${apiUrl}/api/sheet/upload`, {
        method: "post",
        body: formData,
      });

      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  return { uploadSheet };
};
