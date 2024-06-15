import { useDispatch } from "react-redux";
import { axiosFetch } from "../axios/axios";
import { setData, setDates, setLoadingData } from "../redux/slices/dataSlice";

const useData = () => {
  const dispatch = useDispatch();

  const getData = async ({ category, dates }: { category: string; dates: { from: string; to: string } }) => {
    dispatch(setLoadingData({ [category as string]: true }));
    try {
      const data: any = await axiosFetch.get(`/api/data?category=${category}`, {
        params: dates
      });

      if (data.status === 200) dispatch(setData({ [category as string]: data.data }));
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setLoadingData({ [category as string]: false }));
    }
  };

  const setDate = (year: number) => {
    const fromDate = new Date(year, 0, 1).toISOString();
    const toDate = new Date(year, 11, 31).toISOString();

    dispatch(
      setDates({
        from: fromDate,
        to: toDate,
      })
    );
  };

  const formateDate = (date: string): string => {
    const formatedDate = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return formatedDate.toLocaleDateString("es-ES", options);
  };
  return { getData, formateDate, setDate };
};

export default useData;
