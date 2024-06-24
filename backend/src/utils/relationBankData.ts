import { addDays, format, parse } from "date-fns";
import data from "../data/data.json";
import moment from "moment-timezone";

const destructureData = (sheetData: Array<any>, bank: "santander" | "bbva") => {
  if (bank === "santander") {
    const categorizedTransactions = sheetData
      .filter((transaction) => transaction["IMPORTE EUR"] < 0)
      .map((transaction) => {
        const utcDate = moment.tz(transaction["FECHA OPERACIÓN"], "DD/MM/YYYY", "UTC").toDate();

        let matchedType: string = "";

        const categoryEntry = data.find((entry) => {
          return entry.types.some((type) => {
            if (transaction.CONCEPTO.toLowerCase().includes(type.entry)) {
              matchedType = type.name;
              return true;
            }
            return false;
          });
        });
        const category = categoryEntry ? categoryEntry.category : "Otra categoría";
        const value = Math.abs(transaction["IMPORTE EUR"]);

        const element = {
          concept: transaction.CONCEPTO,
          date: utcDate,
          value: value,
          category,
          bank,
        };
        if (matchedType) element.concept = matchedType.charAt(0).toUpperCase() + matchedType.slice(1);
        if (category === "Seguro") element.concept = "Adeslas Neru";

        return element;
      });

    return categorizedTransactions;
  }

  if (bank === "bbva") {
    const categorizedTransactions = sheetData
      .filter((transaction) => transaction.Importe < 0)
      .map((transaction) => {
        const baseDate = new Date(Date.UTC(1900, 0, 1));
        const days = Math.floor(transaction.Fecha) - 2;
        const resultDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
        resultDate.setUTCHours(0, 0, 0, 0);
        let matchedType: string = "";

        const categoryEntry = data.find((entry) => {
          return entry.types.some((type) => {
            if (transaction.Concepto.toLowerCase().includes(type.entry)) {
              matchedType = type.name;
              return true;
            }
            return false;
          });
        });
        const category = categoryEntry ? categoryEntry.category : "Otra categoría";
        const value = Math.abs(transaction.Importe);

        const element = {
          concept: transaction.Concepto,
          date: resultDate,
          value: value,
          category,
          bank,
        };

        if (matchedType) element.concept = matchedType.charAt(0).toUpperCase() + matchedType.slice(1);
        if (category === "Seguro") element.concept = "Adeslas Uriel";

        return element;
      });

    return categorizedTransactions;
  }
};

export { destructureData };
