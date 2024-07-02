import { useDispatch } from "react-redux";
import { axiosFetch } from "../axios/axios";
import { setAnalyticData, setData, setDates, setLoadingData } from "../redux/slices/dataSlice";

const useData = () => {
  const dispatch = useDispatch();

  const getData = async ({ dates }: { dates?: { from: string; to: string } }) => {
    dispatch(setLoadingData({ data: true }));
    try {
      const data: any = await axiosFetch.get(`/api/data`, {
        params: dates,
      });

      if (data.status === 200) dispatch(setData(data?.data));
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setLoadingData({ data: false }));
    }
  };

  const getAnalyticData = async ({ category, dates }: { category: string; dates: { from: string; to: string } }) => {
    category === "Otra categoría" ? (category = "Otros") : category;

    dispatch(setLoadingData({ [category as string]: true }));
    try {
      const data: any = await axiosFetch.get(`/api/data/analytics?category=${category === "Otros" ? "Otra categoría" : category}`, {
        params: dates,
      });

      if (data.status === 200) dispatch(setAnalyticData({ [category as string]: data.data }));
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

  const formatCurrency = (value: number) => {
    const euro = new Intl.NumberFormat("en-DE", {
      style: "currency",
      currency: "EUR",
    });

    return euro.format(value);
  };

  const extractYear = (date: string): string | number | undefined => {
    const fecha = new Date(date);
    const year = fecha.getUTCFullYear();
    return year;
  };

  return { getAnalyticData, getData, formateDate, setDate, extractYear, formatCurrency };
};

export default useData;
