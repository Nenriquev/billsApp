import { useState, useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchAIProviders,
  createAIProvider,
  updateAIProvider,
  deleteAIProvider,
  testAIProvider,
} from "../redux/thunks/dataThunks";
import { setToast } from "../redux/slices/appSlice";
import { AIProvider } from "../types";
import Input from "./Input";
import Dropdown from "./Dropdown";
import {
  IconPlus,
  IconTrash,
  IconCheck,
  IconX,
  IconTestPipe,
  IconToggleLeft,
  IconToggleRight,
} from "@tabler/icons-react";
import { DropdownOption } from "../types";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: 0.2s;

    &:hover {
      background: #4f46e5;
    }
  }
`;

const ProvidersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ProviderCard = styled.div`
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  background: var(--bg-card);

  .provider-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .provider-info {
      flex: 1;

      .provider-name {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        gap: 8px;

        .badge {
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: 12px;
          background: var(--accent-light);
          color: var(--accent);
          font-weight: 500;
        }

        .default-badge {
          background: #10b981;
          color: white;
        }
      }

      .provider-type {
        font-size: 0.85rem;
        color: var(--text-secondary);
        text-transform: capitalize;
      }
    }

    .provider-actions {
      display: flex;
      gap: 8px;

      button {
        padding: 6px 12px;
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: 0.2s;

        &.btn-test {
          background: var(--border-light);
          color: var(--text-secondary);

          &:hover {
            background: var(--border);
          }
        }

        &.btn-delete {
          background: #fef2f2;
          color: var(--danger);

          &:hover {
            background: #fee2e2;
          }
        }
      }
    }
  }

  .provider-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 16px;

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-secondary);
      }

      input,
      select {
        padding: 8px 12px;
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        background: var(--bg-primary);
        color: var(--text-primary);
        font-size: 0.9rem;

        &:focus {
          outline: none;
          border-color: var(--accent);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    .toggle-field {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;

      label {
        font-size: 0.9rem;
        color: var(--text-primary);
      }

      button {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-muted);
        transition: 0.2s;

        &.enabled {
          color: var(--accent);
        }
      }
    }
  }

  .provider-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border);

    button {
      padding: 8px 16px;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: 0.2s;

      &.btn-cancel {
        background: var(--border-light);
        color: var(--text-secondary);

        &:hover {
          background: var(--border);
        }
      }

      &.btn-save {
        background: var(--accent);
        color: white;

        &:hover {
          background: #4f46e5;
        }
      }
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  width: min(90vw, 500px);
  max-height: 90vh;
  overflow-y: auto;

  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;

    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    input,
    select {
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.9rem;

      &:focus {
        outline: none;
        border-color: var(--accent);
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;

    button {
      padding: 10px 20px;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: 0.2s;

      &.btn-cancel {
        background: var(--border-light);
        color: var(--text-secondary);

        &:hover {
          background: var(--border);
        }
      }

      &.btn-save {
        background: var(--accent);
        color: white;

        &:hover {
          background: #4f46e5;
        }
      }
    }
  }
`;

const providerOptions: DropdownOption[] = [
  { name: "Mistral", value: "mistral" },
  { name: "OpenAI", value: "openai" },
  { name: "Google Gemini", value: "gemini" },
  { name: "Anthropic (Claude)", value: "anthropic" },
];

const modelOptions: Record<string, DropdownOption[]> = {
  mistral: [
    { name: "mistral-small-latest", value: "mistral-small-latest" },
    { name: "mistral-medium-latest", value: "mistral-medium-latest" },
    { name: "mistral-large-latest", value: "mistral-large-latest" },
  ],
  openai: [
    { name: "gpt-4o-mini", value: "gpt-4o-mini" },
    { name: "gpt-4o", value: "gpt-4o" },
    { name: "gpt-3.5-turbo", value: "gpt-3.5-turbo" },
  ],
  gemini: [
    { name: "gemini-2.5-flash", value: "gemini-2.5-flash" },
    { name: "gemini-2.5-flash-lite", value: "gemini-2.5-flash-lite" },
    { name: "gemini-2.5-pro", value: "gemini-2.5-pro" },
    { name: "gemini-2.0-flash", value: "gemini-2.0-flash" },
  ],
  anthropic: [
    { name: "Claude Sonnet 4", value: "claude-sonnet-4-20250514" },
    { name: "Claude Haiku 3.5", value: "claude-3-5-haiku-20241022" },
    { name: "Claude Opus 4", value: "claude-opus-4-20250514" },
  ],
};

const AIProvidersConfig = () => {
  const dispatch = useAppDispatch();
  const providers = useAppSelector((state) => state.data.aiProviders);
  const loading = useAppSelector((state) => state.data.loading.aiProviders);

  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    provider: "mistral" as "mistral" | "openai" | "gemini" | "anthropic",
    name: "",
    apiKey: "",
    model: "",
    enabled: true,
    isDefault: false,
  });

  useEffect(() => {
    dispatch(fetchAIProviders());
  }, [dispatch]);

  const handleOpenModal = (provider?: AIProvider) => {
    if (provider) {
      setEditingProvider(provider);
      setFormData({
        provider: provider.provider,
        name: provider.name,
        apiKey: "",
        model: provider.model || "",
        enabled: provider.enabled,
        isDefault: provider.isDefault,
      });
    } else {
      setEditingProvider(null);
      setFormData({
        provider: "mistral",
        name: "",
        apiKey: "",
        model: "",
        enabled: true,
        isDefault: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProvider(null);
  };

  const handleSave = async () => {
    if (!formData.name || (!editingProvider && !formData.apiKey)) {
      dispatch(setToast({ open: true, msg: "Nombre y API Key son requeridos", type: "danger" }));
      return;
    }

    try {
      if (editingProvider) {
        const updateData: Record<string, any> = { ...formData };
        if (!updateData.apiKey) delete updateData.apiKey;
        await dispatch(
          updateAIProvider({
            id: editingProvider._id,
            data: updateData,
          })
        ).unwrap();
        dispatch(setToast({ open: true, msg: "Proveedor actualizado", type: "success" }));
      } else {
        await dispatch(createAIProvider(formData)).unwrap();
        dispatch(setToast({ open: true, msg: "Proveedor creado", type: "success" }));
      }
      handleCloseModal();
      dispatch(fetchAIProviders());
    } catch (error: any) {
      dispatch(
        setToast({
          open: true,
          msg: error || "Error al guardar proveedor",
          type: "danger",
        })
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este proveedor?")) return;

    try {
      await dispatch(deleteAIProvider(id)).unwrap();
      dispatch(setToast({ open: true, msg: "Proveedor eliminado", type: "success" }));
      dispatch(fetchAIProviders());
    } catch (error: any) {
      dispatch(
        setToast({
          open: true,
          msg: error || "Error al eliminar proveedor",
          type: "danger",
        })
      );
    }
  };

  const handleTest = async (id: string) => {
    setTestingProvider(id);
    try {
      const result = await dispatch(testAIProvider(id)).unwrap();
      dispatch(
        setToast({
          open: true,
          msg: result.valid ? "Conexión exitosa" : (result.error || "Error de conexión"),
          type: result.valid ? "success" : "danger",
        })
      );
    } catch (error: any) {
      dispatch(
        setToast({
          open: true,
          msg: error || "Error al probar conexión",
          type: "danger",
        })
      );
    } finally {
      setTestingProvider(null);
    }
  };

  const handleToggleEnabled = async (provider: AIProvider) => {
    try {
      await dispatch(
        updateAIProvider({
          id: provider._id,
          data: { enabled: !provider.enabled },
        })
      ).unwrap();
      dispatch(fetchAIProviders());
    } catch (error: any) {
      dispatch(
        setToast({
          open: true,
          msg: error || "Error al actualizar proveedor",
          type: "danger",
        })
      );
    }
  };

  const handleSetDefault = async (provider: AIProvider) => {
    try {
      await dispatch(
        updateAIProvider({
          id: provider._id,
          data: { isDefault: true },
        })
      ).unwrap();
      dispatch(fetchAIProviders());
      dispatch(setToast({ open: true, msg: "Proveedor por defecto actualizado", type: "success" }));
    } catch (error: any) {
      dispatch(
        setToast({
          open: true,
          msg: error || "Error al actualizar proveedor",
          type: "danger",
        })
      );
    }
  };

  return (
    <Container>
      <Header>
        <h3>Proveedores de IA</h3>
        <button onClick={() => handleOpenModal()}>
          <IconPlus size={18} />
          Agregar proveedor
        </button>
      </Header>

      <ProvidersList>
        {loading && providers.length === 0 ? (
          <div>Cargando...</div>
        ) : providers.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)" }}>
            No hay proveedores configurados. Agrega uno para comenzar.
          </div>
        ) : (
          providers.map((provider) => (
            <ProviderCard key={provider._id}>
              <div className="provider-header">
                <div className="provider-info">
                  <div className="provider-name">
                    {provider.name}
                    {provider.isDefault && <span className="badge default-badge">Por defecto</span>}
                    {!provider.enabled && <span className="badge">Deshabilitado</span>}
                  </div>
                  <div className="provider-type">{provider.provider}</div>
                </div>
                <div className="provider-actions">
                  <button
                    className="btn-test"
                    onClick={() => handleTest(provider._id)}
                    disabled={testingProvider === provider._id}
                  >
                    <IconTestPipe size={16} />
                    {testingProvider === provider._id ? "Probando..." : "Probar"}
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(provider._id)}>
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>

              <div className="provider-details">
                <div className="field">
                  <label>Modelo</label>
                  <input type="text" value={provider.model || "Por defecto"} disabled />
                </div>
                <div className="toggle-field">
                  <label>Habilitado</label>
                  <button
                    className={provider.enabled ? "enabled" : ""}
                    onClick={() => handleToggleEnabled(provider)}
                  >
                    {provider.enabled ? <IconToggleRight size={24} /> : <IconToggleLeft size={24} />}
                  </button>
                </div>
              </div>

              {!provider.isDefault && (
                <div className="provider-footer">
                  <button className="btn-save" onClick={() => handleSetDefault(provider)}>
                    Establecer como predeterminado
                  </button>
                  <button className="btn-cancel" onClick={() => handleOpenModal(provider)}>
                    Editar
                  </button>
                </div>
              )}
            </ProviderCard>
          ))
        )}
      </ProvidersList>

      {showModal && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>{editingProvider ? "Editar proveedor" : "Nuevo proveedor"}</h3>

            <div className="form-group">
              <label>Proveedor</label>
              <Dropdown
                options={providerOptions}
                selectedOption={formData.provider}
                handleSelect={(option) => {
                  setFormData({
                    ...formData,
                    provider: option.value as "mistral" | "openai" | "gemini" | "anthropic",
                    model: "",
                  });
                }}
              />
            </div>

            <div className="form-group">
              <label>Nombre</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Mistral Principal"
              />
            </div>

            <div className="form-group">
              <label>API Key</label>
              <Input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder={editingProvider ? `Actual: ${editingProvider.apiKey || "••••••••"} — dejar vacío para mantener` : "sk-..."}
              />
            </div>

            <div className="form-group">
              <label>Modelo</label>
              <Dropdown
                options={modelOptions[formData.provider] || []}
                selectedOption={formData.model}
                handleSelect={(option) => setFormData({ ...formData, model: option.value as string })}
              />
            </div>

            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                />
                Habilitado
              </label>
            </div>

            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
                Establecer como predeterminado
              </label>
            </div>

            <div className="form-actions">
              <button className="btn-cancel" onClick={handleCloseModal}>
                Cancelar
              </button>
              <button className="btn-save" onClick={handleSave}>
                Guardar
              </button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default AIProvidersConfig;
