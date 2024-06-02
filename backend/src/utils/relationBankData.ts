import { addDays, format } from "date-fns";
import data from "../data/data.json";

const destructureData = (sheetData: Array<any>, bank: "santander" | "bbva") => {
  if (bank === "santander") {
    const categorizedTransactions = sheetData.map((transaction) => {
      const categoryEntry = data.find((entry) => transaction.CONCEPTO.toLowerCase().includes(entry.name));
      const category = categoryEntry ? categoryEntry.category : "Otra categoría";
      return { concept: transaction.CONCEPTO, date: transaction["FECHA OPERACIÓN"], value: transaction["IMPORTE EUR"], category };
    });

    return categorizedTransactions;
  }

  if (bank === "bbva") {
    const categorizedTransactions = sheetData.map((transaction) => {
      const baseDate = new Date(Date.UTC(1900, 0, 1));
      const days = Math.floor(transaction.Fecha);
      const resultDate = addDays(baseDate, days);
      resultDate.setUTCHours(0, 0, 0, 0);

      const categoryEntry = data.find((entry) => transaction.Concepto.toLowerCase().includes(entry.name));
      const category = categoryEntry ? categoryEntry.category : "Otra categoría";
      return { concept: transaction.Concepto, date: resultDate, value: transaction.Importe, category };
    });

    return categorizedTransactions;
  }
};

export { destructureData };
