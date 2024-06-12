import { addDays, format, parse } from "date-fns";
import data from "../data/data.json";
import moment from "moment-timezone";

const destructureData = (sheetData: Array<any>, bank: "santander" | "bbva") => {
  if (bank === "santander") {
    const categorizedTransactions = sheetData
      .filter((transaction) => transaction["IMPORTE EUR"] < 0)
      .map((transaction) => {
        const utcDate = moment.tz(transaction["FECHA OPERACIÓN"], "DD/MM/YYYY", "UTC").toDate();

        const categoryEntry = data.find((entry) => transaction.CONCEPTO.toLowerCase().includes(entry.name));
        const category = categoryEntry ? categoryEntry.category : "Otra categoría";
        const value = Math.abs(transaction["IMPORTE EUR"]);

        return { concept: transaction.CONCEPTO, date: utcDate, value: value, category };
      });

    return categorizedTransactions;
  }

  if (bank === "bbva") {
    const categorizedTransactions = sheetData
      .filter((transaction) => transaction.Importe < 0)
      .map((transaction) => {
        const baseDate = new Date(Date.UTC(1900, 0, 1));
        const days = Math.floor(transaction.Fecha);
        const resultDate = addDays(baseDate, days);
        resultDate.setUTCHours(0, 0, 0, 0);

        const categoryEntry = data.find((entry) => transaction.Concepto.toLowerCase().includes(entry.name));
        const category = categoryEntry ? categoryEntry.category : "Otra categoría";
        const value = Math.abs(transaction.Importe);
        return { concept: transaction.Concepto, date: resultDate, value: value, category };
      });

    return categorizedTransactions;
  }
};

export { destructureData };
