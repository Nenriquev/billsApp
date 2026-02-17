import { AnimatePresence, motion } from "framer-motion";
import { ConfigurationWrapper } from "./Configuration.styles";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchCategories } from "../../redux/thunks/dataThunks";
import AIProvidersConfig from "../../components/AIProvidersConfig";

const options = [
  {
    name: "Categorias",
    value: "categories",
  },
  {
    name: "Proveedores de IA",
    value: "ai-providers",
  },
];

const Configuration = () => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState<string | null>(null);

  const categories = useAppSelector((state) => state.data.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  console.log(categories);

  return (
    <ConfigurationWrapper>
      {options.map((item: any) => (
        <div className="collapse" key={item.value}>
          <span onClick={() => setOpen(open === item.value ? null : item.value)} className="title">
            {item.name}
          </span>
          <AnimatePresence>
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: open === item.value ? "auto" : 0, opacity: 1 }} className="content">
              {item.value === "categories" && (
                <div className="content-collapse">
                  {categories?.map((category, key: number) => (
                    <div key={key}>
                      <span>{category.category}</span>
                    </div>
                  ))}
                </div>
              )}
              {item.value === "ai-providers" && (
                <div className="content-collapse">
                  <AIProvidersConfig />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      ))}
    </ConfigurationWrapper>
  );
};

export default Configuration;
