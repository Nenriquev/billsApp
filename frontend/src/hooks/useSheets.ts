

export const useSheets = () => {
  const uploadSheet = async (formData: any) => {
    
    try {
      const response = await fetch("http://localhost:3000/sheet/upload", {
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
