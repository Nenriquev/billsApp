import { useDispatch, useSelector } from "react-redux";
import { setCounter } from "../redux/slices/counterSlice";
import { RootState } from "../redux/store";

const useCounter = () => {
  const dispatch = useDispatch();
  const value = useSelector((state: RootState) => state.counter.value);

  console.log(value)

  const setCounterSum = () => {
    dispatch(setCounter(value + 1));
  };

  return { setCounterSum, value };
};

export default useCounter;
