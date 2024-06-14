import { useDispatch } from "react-redux";
import { axiosFetch } from "../axios/axios";
import { setData, setLoadingData } from "../redux/slices/dataSlice";

const useData = () => {
  const dispatch = useDispatch();

  const getData = async ({ category }: { category: string }) => {
    dispatch(setLoadingData({ [category as string]: true }));
    try {
      const data: any = await axiosFetch.get(`/api/data?category=${category}`);

      if (data.status === 200) dispatch(setData({ [category as string]: data.data }));
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setLoadingData({ [category as string]: false }));
    }
  };

  const setDate = (date: string): string => {
    const formatedDate = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    return formatedDate.toLocaleDateString('es-ES', options);  
}
  return { getData, setDate };
};

export default useData;
