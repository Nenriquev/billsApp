import { useDispatch, useSelector } from "react-redux";
import { axiosFetch } from "../axios/axios";
import { setAnalyticData, setCategories, setData, setDates, setLoadingData } from "../redux/slices/dataSlice";
import { setModal, setToast } from "../redux/slices/appSlice";
import { RootState } from "../redux/store";

const useData = () => {
  const dispatch = useDispatch();
  const transactions = useSelector((state: RootState) => state.data.data);

  const getData = async ({ dates }: { dates?: { from: string; to: string } }) => {
    dispatch(setLoadingData({ data: true }));
    try {
      const data: any = await axiosFetch.get(`/data`, {
        params: dates,
      });

      if (data.status === 200) dispatch(setData(data?.data));
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setLoadingData({ data: false }));
    }
  };

  const getCategories = async () => {
    dispatch(setLoadingData({ categories: true }));
    try {
      const data: any = await axiosFetch.get(`/data/categories`);

      if (data.status === 200) dispatch(setCategories(data?.data));
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setLoadingData({ categories: false }));
    }
  };

  const getAnalyticData = async ({ category, dates }: { category: string; dates: { from: string; to: string } }) => {
    category === "Otra categoría" ? (category = "Otros") : category;

    dispatch(setLoadingData({ [category as string]: true }));
    try {
      const data: any = await axiosFetch.get(`/data/analytics?category=${category === "Otros" ? "Otra categoría" : category}`, {
        params: dates,
      });

      if (data.status === 200) dispatch(setAnalyticData({ [category as string]: data.data }));
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setLoadingData({ [category as string]: false }));
    }
  };

  const updateTransaction = async ({ id, data }: { id: string; data: any }) => {
    try {
      const update = await axiosFetch.post(`/data/update/${id}`, data);
      if (update.status === 200) {
        dispatch(setData(transactions?.map((item: any) => (item.id === update?.data?._id ? { ...item, ...update.data } : item))));
        dispatch(setModal({ transaction: false }));
        dispatch(setToast({ open: true, msg: "Entrada actualizada !", type: "success" }));
      }
    } catch (error) {
      console.log(error);
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

  return { getAnalyticData, getData, formateDate, setDate, extractYear, formatCurrency, updateTransaction, getCategories };
};

export default useData;
