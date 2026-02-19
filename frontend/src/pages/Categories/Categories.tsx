import { useEffect, useState } from "react";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconChevronDown,
  IconChevronRight,
  IconX,
  IconCheck,
  IconTag,
  IconCategory,
} from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "../../redux/thunks/dataThunks";
import { Category } from "../../types";

/* ────── Types ────── */

interface TypeEntry {
  name: string;
  entry: string;
}

interface SubcategoryEntry {
  name: string;
  types: string[];
}

interface CategoryForm {
  category: string;
  types: TypeEntry[];
  subcategories: SubcategoryEntry[];
}

const emptyForm: CategoryForm = {
  category: "",
  types: [{ name: "", entry: "" }],
  subcategories: [],
};

/* ────── Styles ────── */

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  h1 {
    font-size: 1.6rem;
    font-weight: 700;
  }
`;

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  svg { width: 18px; height: 18px; }
  &:hover { background: #4f46e5; }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Card = styled(motion.div)`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;

  &:hover { background: var(--border-light); }

  .icon-toggle {
    color: var(--text-muted);
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .cat-name {
    font-weight: 600;
    font-size: 0.95rem;
    flex: 1;
  }

  .badge {
    font-size: 0.72rem;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 20px;
    background: var(--accent-light);
    color: var(--accent);
  }

  .actions {
    display: flex;
    gap: 4px;
    margin-left: 8px;
  }
`;

const IconBtn = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  color: ${(p) => (p.$danger ? "var(--danger)" : "var(--text-muted)")};
  transition: all 0.15s;

  svg { width: 16px; height: 16px; }

  &:hover {
    background: ${(p) => (p.$danger ? "#fef2f2" : "var(--border-light)")};
    color: ${(p) => (p.$danger ? "#dc2626" : "var(--text-primary)")};
  }
`;

const CardBody = styled(motion.div)`
  border-top: 1px solid var(--border);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Section = styled.div`
  .section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 10px;

    svg { width: 14px; height: 14px; }
  }
`;

const TypeChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  background: var(--border-light);
  color: var(--text-primary);
  margin: 0 6px 6px 0;

  .chip-label {
    font-weight: 500;
  }
  .chip-entry {
    color: var(--text-muted);
    font-size: 0.72rem;
  }
`;

const SubcatRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: var(--border-light);
  margin-bottom: 6px;

  .sub-name {
    font-weight: 500;
    font-size: 0.85rem;
    min-width: 120px;
  }

  .sub-types {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .sub-type-chip {
    font-size: 0.72rem;
    padding: 2px 8px;
    border-radius: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    color: var(--text-secondary);
  }
`;

const EmptyMsg = styled.span`
  font-size: 0.82rem;
  color: var(--text-muted);
  font-style: italic;
`;

/* ── Form Styles ── */

const FormOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 60px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 50;
  overflow-y: auto;
`;

const FormPanel = styled(motion.div)`
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  width: min(92vw, 560px);
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);

    h3 { font-size: 1.05rem; font-weight: 600; }

    .close-btn {
      cursor: pointer;
      color: var(--text-muted);
      transition: 0.2s;
      &:hover { color: var(--danger); }
    }
  }

  .form-body {
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px;
    border-top: 1px solid var(--border);
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-secondary);
  }
`;

const StyledInput = styled.input`
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 9px 12px;
  font-size: 0.88rem;
  font-family: inherit;
  color: var(--text-primary);
  background: var(--bg-card);
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;

  &::placeholder { color: var(--text-muted); }
  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
  }
`;

const TypeRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  input { flex: 1; }
`;

const SubcatFormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--border-light);

  .sub-header {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .sub-types-input {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
`;

const SmallBtn = styled.button<{ $variant?: "primary" | "danger" | "ghost" }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: 0.15s;

  svg { width: 14px; height: 14px; }

  ${(p) => {
    switch (p.$variant) {
      case "danger":
        return `
          background: #fef2f2;
          color: var(--danger);
          &:hover { background: #fee2e2; }
        `;
      case "ghost":
        return `
          background: transparent;
          color: var(--text-muted);
          &:hover { background: var(--border-light); color: var(--text-primary); }
        `;
      default:
        return `
          background: var(--accent-light);
          color: var(--accent);
          &:hover { background: #e0e7ff; }
        `;
    }
  }}
`;

const Btn = styled.button<{ $primary?: boolean }>`
  padding: 9px 20px;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 500;
  transition: 0.2s;

  ${(p) =>
    p.$primary
      ? `
    background: var(--accent);
    color: white;
    &:hover { background: #4f46e5; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  `
      : `
    background: var(--border-light);
    color: var(--text-secondary);
    &:hover { background: var(--border); }
  `}
`;

const ConfirmOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 60;
`;

const ConfirmBox = styled(motion.div)`
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  width: min(90vw, 380px);
  box-shadow: var(--shadow-lg);
  text-align: center;

  h4 { margin-bottom: 8px; font-size: 1rem; }
  p { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 20px; }

  .confirm-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
  }
`;

/* ────── Component ────── */

const Categories = () => {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((s) => s.data);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  const toggle = (id: string) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  /* ── Form helpers ── */

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEditForm = (cat: Category) => {
    setEditingId(cat._id);
    setForm({
      category: cat.category,
      types: cat.types.length > 0 ? [...cat.types] : [{ name: "", entry: "" }],
      subcategories: cat.subcategories.map((s) => ({ name: s.name, types: [...s.types] })),
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
  };

  /* ── Type management ── */

  const addType = () =>
    setForm((p) => ({ ...p, types: [...p.types, { name: "", entry: "" }] }));

  const removeType = (i: number) =>
    setForm((p) => ({ ...p, types: p.types.filter((_, idx) => idx !== i) }));

  const updateType = (i: number, field: "name" | "entry", val: string) =>
    setForm((p) => ({
      ...p,
      types: p.types.map((t, idx) =>
        idx === i
          ? {
              ...t,
              [field]: val,
              ...(field === "name" ? { entry: t.entry || val.toLowerCase() } : {}),
            }
          : t
      ),
    }));

  /* ── Subcategory management ── */

  const addSubcategory = () =>
    setForm((p) => ({
      ...p,
      subcategories: [...p.subcategories, { name: "", types: [""] }],
    }));

  const removeSubcategory = (i: number) =>
    setForm((p) => ({
      ...p,
      subcategories: p.subcategories.filter((_, idx) => idx !== i),
    }));

  const updateSubName = (i: number, val: string) =>
    setForm((p) => ({
      ...p,
      subcategories: p.subcategories.map((s, idx) =>
        idx === i ? { ...s, name: val } : s
      ),
    }));

  const addSubType = (i: number) =>
    setForm((p) => ({
      ...p,
      subcategories: p.subcategories.map((s, idx) =>
        idx === i ? { ...s, types: [...s.types, ""] } : s
      ),
    }));

  const removeSubType = (si: number, ti: number) =>
    setForm((p) => ({
      ...p,
      subcategories: p.subcategories.map((s, idx) =>
        idx === si ? { ...s, types: s.types.filter((_, j) => j !== ti) } : s
      ),
    }));

  const updateSubType = (si: number, ti: number, val: string) =>
    setForm((p) => ({
      ...p,
      subcategories: p.subcategories.map((s, idx) =>
        idx === si
          ? { ...s, types: s.types.map((t, j) => (j === ti ? val : t)) }
          : s
      ),
    }));

  /* ── Submit ── */

  const handleSubmit = () => {
    const cleanTypes = form.types.filter((t) => t.name.trim() || t.entry.trim());
    const cleanSubs = form.subcategories
      .filter((s) => s.name.trim())
      .map((s) => ({ ...s, types: s.types.filter((t) => t.trim()) }));

    const payload = {
      category: form.category,
      types: cleanTypes,
      subcategories: cleanSubs,
    };

    if (editingId) {
      dispatch(updateCategory({ id: editingId, data: payload }));
    } else {
      dispatch(createCategory(payload));
    }

    closeForm();
  };

  const handleDelete = () => {
    if (confirmDelete) {
      dispatch(deleteCategory(confirmDelete._id));
      setConfirmDelete(null);
    }
  };

  if (loading.categories && categories.length === 0) {
    return (
      <Page>
        <Header><h1>Categorías</h1></Header>
        <EmptyMsg>Cargando categorías...</EmptyMsg>
      </Page>
    );
  }

  return (
    <Page>
      <Header>
        <h1>Categorías</h1>
        <AddBtn onClick={openCreateForm}>
          <IconPlus /> Nueva categoría
        </AddBtn>
      </Header>

      <List>
        {categories.map((cat) => (
          <Card
            key={cat._id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CardHeader onClick={() => toggle(cat._id)}>
              {expanded[cat._id] ? (
                <IconChevronDown className="icon-toggle" />
              ) : (
                <IconChevronRight className="icon-toggle" />
              )}
              <span className="cat-name">{cat.category}</span>
              <span className="badge">
                {cat.types.length} patrón{cat.types.length !== 1 ? "es" : ""}
              </span>
              <div className="actions">
                <IconBtn
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditForm(cat);
                  }}
                  title="Editar"
                >
                  <IconEdit />
                </IconBtn>
                <IconBtn
                  $danger
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(cat);
                  }}
                  title="Eliminar"
                >
                  <IconTrash />
                </IconBtn>
              </div>
            </CardHeader>

            <AnimatePresence>
              {expanded[cat._id] && (
                <CardBody
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Section>
                    <div className="section-title">
                      <IconTag /> Patrones de coincidencia
                    </div>
                    {cat.types.length === 0 ? (
                      <EmptyMsg>Sin patrones configurados</EmptyMsg>
                    ) : (
                      <div>
                        {cat.types.map((t, i) => (
                          <TypeChip key={i}>
                            <span className="chip-label">{t.name}</span>
                            <span className="chip-entry">({t.entry})</span>
                          </TypeChip>
                        ))}
                      </div>
                    )}
                  </Section>

                  <Section>
                    <div className="section-title">
                      <IconCategory /> Subcategorías
                    </div>
                    {cat.subcategories.length === 0 ? (
                      <EmptyMsg>Sin subcategorías</EmptyMsg>
                    ) : (
                      cat.subcategories.map((sub, i) => (
                        <SubcatRow key={i}>
                          <span className="sub-name">{sub.name}</span>
                          <div className="sub-types">
                            {sub.types.map((t, j) => (
                              <span className="sub-type-chip" key={j}>{t}</span>
                            ))}
                          </div>
                        </SubcatRow>
                      ))
                    )}
                  </Section>
                </CardBody>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </List>

      {/* ── Create/Edit Form Modal ── */}
      <AnimatePresence>
        {formOpen && (
          <FormOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FormPanel
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="form-header">
                <h3>{editingId ? "Editar categoría" : "Nueva categoría"}</h3>
                <IconX onClick={closeForm} className="close-btn" size={20} />
              </div>

              <div className="form-body">
                <FieldGroup>
                  <label>Nombre de la categoría</label>
                  <StyledInput
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    placeholder="Ej: Supermercados, Luz, Seguros..."
                  />
                </FieldGroup>

                <FieldGroup>
                  <label>Patrones de coincidencia</label>
                  {form.types.map((t, i) => (
                    <TypeRow key={i}>
                      <StyledInput
                        value={t.name}
                        onChange={(e) => updateType(i, "name", e.target.value)}
                        placeholder="Nombre (ej: Mercadona)"
                      />
                      <StyledInput
                        value={t.entry}
                        onChange={(e) => updateType(i, "entry", e.target.value)}
                        placeholder="Patrón (ej: mercadona)"
                      />
                      {form.types.length > 1 && (
                        <IconBtn $danger onClick={() => removeType(i)}>
                          <IconX />
                        </IconBtn>
                      )}
                    </TypeRow>
                  ))}
                  <SmallBtn onClick={addType}><IconPlus /> Añadir patrón</SmallBtn>
                </FieldGroup>

                <FieldGroup>
                  <label>Subcategorías (opcional)</label>
                  {form.subcategories.map((sub, si) => (
                    <SubcatFormRow key={si}>
                      <div className="sub-header">
                        <StyledInput
                          value={sub.name}
                          onChange={(e) => updateSubName(si, e.target.value)}
                          placeholder="Nombre subcategoría"
                        />
                        <IconBtn $danger onClick={() => removeSubcategory(si)}>
                          <IconTrash />
                        </IconBtn>
                      </div>
                      <div className="sub-types-input">
                        {sub.types.map((t, ti) => (
                          <TypeRow key={ti}>
                            <StyledInput
                              value={t}
                              onChange={(e) => updateSubType(si, ti, e.target.value)}
                              placeholder="Patrón"
                              style={{ maxWidth: 180 }}
                            />
                            {sub.types.length > 1 && (
                              <IconBtn $danger onClick={() => removeSubType(si, ti)}>
                                <IconX />
                              </IconBtn>
                            )}
                          </TypeRow>
                        ))}
                        <SmallBtn $variant="ghost" onClick={() => addSubType(si)}>
                          <IconPlus /> Patrón
                        </SmallBtn>
                      </div>
                    </SubcatFormRow>
                  ))}
                  <SmallBtn onClick={addSubcategory}><IconPlus /> Añadir subcategoría</SmallBtn>
                </FieldGroup>
              </div>

              <div className="form-footer">
                <Btn onClick={closeForm}>Cancelar</Btn>
                <Btn $primary onClick={handleSubmit} disabled={!form.category.trim()}>
                  <IconCheck size={16} style={{ marginRight: 4 }} />
                  {editingId ? "Guardar cambios" : "Crear categoría"}
                </Btn>
              </div>
            </FormPanel>
          </FormOverlay>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation ── */}
      <AnimatePresence>
        {confirmDelete && (
          <ConfirmOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ConfirmBox
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h4>¿Eliminar categoría?</h4>
              <p>
                Se eliminará <strong>{confirmDelete.category}</strong> y sus patrones.
                Las transacciones asignadas no se eliminarán pero quedarán sin categoría.
              </p>
              <div className="confirm-actions">
                <Btn onClick={() => setConfirmDelete(null)}>Cancelar</Btn>
                <Btn
                  $primary
                  onClick={handleDelete}
                  style={{ background: "var(--danger)" }}
                >
                  Eliminar
                </Btn>
              </div>
            </ConfirmBox>
          </ConfirmOverlay>
        )}
      </AnimatePresence>
    </Page>
  );
};

export default Categories;
