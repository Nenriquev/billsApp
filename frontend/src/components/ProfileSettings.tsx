import { useState } from "react";
import styled from "styled-components";
import { IconUser, IconLock, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../axios/axios";

/* ────── Styles ────── */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 560px;
`;

const SectionCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  font-weight: 600;
  font-size: 0.95rem;

  svg {
    width: 18px;
    height: 18px;
    color: var(--accent);
  }
`;

const SectionBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
`;

const Input = styled.input`
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--text-primary);
  background: var(--bg-primary);
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;

  &::placeholder {
    color: var(--text-muted);
  }

  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Btn = styled.button<{ $variant?: "primary" | "danger" }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 500;
  transition: 0.2s;
  align-self: flex-start;

  svg {
    width: 16px;
    height: 16px;
  }

  ${(p) =>
    p.$variant === "danger"
      ? `
    background: var(--danger);
    color: white;
    &:hover { background: #dc2626; }
  `
      : `
    background: var(--accent);
    color: white;
    &:hover { background: #4f46e5; }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Feedback = styled.div<{ $type: "success" | "error" }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.84rem;
  font-weight: 500;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  ${(p) =>
    p.$type === "success"
      ? `background: var(--success-light); color: #15803d;`
      : `background: var(--danger-light); color: var(--danger);`}
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;

  .info-label {
    font-size: 0.82rem;
    color: var(--text-secondary);
  }

  .info-value {
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--text-primary);
  }
`;

/* ────── Component ────── */

const ProfileSettings = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [nameFeedback, setNameFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [pwFeedback, setPwFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleSaveName = async () => {
    if (!name.trim() || name.trim() === user?.name) return;

    setSavingName(true);
    setNameFeedback(null);

    try {
      const res = await api.put("/auth/profile", { name: name.trim() });
      updateUser({ name: res.data.name });
      setNameFeedback({ type: "success", msg: "Nombre actualizado correctamente" });
    } catch (err: any) {
      setNameFeedback({
        type: "error",
        msg: err.response?.data?.message || "Error al actualizar el nombre",
      });
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    setPwFeedback(null);

    if (!currentPassword || !newPassword) {
      setPwFeedback({ type: "error", msg: "Completa todos los campos" });
      return;
    }

    if (newPassword.length < 6) {
      setPwFeedback({ type: "error", msg: "La nueva contraseña debe tener al menos 6 caracteres" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwFeedback({ type: "error", msg: "Las contraseñas no coinciden" });
      return;
    }

    setSavingPassword(true);

    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      setPwFeedback({ type: "success", msg: "Contraseña actualizada correctamente" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setPwFeedback({
        type: "error",
        msg: msg === "Invalid current password"
          ? "La contraseña actual es incorrecta"
          : msg || "Error al cambiar la contraseña",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Container>
      {/* ── Profile Info ── */}
      <SectionCard>
        <SectionHeader>
          <IconUser /> Información personal
        </SectionHeader>
        <SectionBody>
          <InfoRow>
            <span className="info-label">Email</span>
            <span className="info-value">{user?.email}</span>
          </InfoRow>

          <FieldGroup>
            <label>Nombre</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameFeedback(null);
              }}
              placeholder="Tu nombre"
            />
          </FieldGroup>

          {nameFeedback && (
            <Feedback $type={nameFeedback.type}>
              {nameFeedback.type === "success" ? <IconCheck /> : <IconAlertCircle />}
              {nameFeedback.msg}
            </Feedback>
          )}

          <Btn
            onClick={handleSaveName}
            disabled={savingName || !name.trim() || name.trim() === user?.name}
          >
            <IconCheck />
            {savingName ? "Guardando..." : "Guardar nombre"}
          </Btn>
        </SectionBody>
      </SectionCard>

      {/* ── Change Password ── */}
      <SectionCard>
        <SectionHeader>
          <IconLock /> Cambiar contraseña
        </SectionHeader>
        <SectionBody>
          <FieldGroup>
            <label>Contraseña actual</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setPwFeedback(null);
              }}
              placeholder="••••••••"
            />
          </FieldGroup>

          <FieldGroup>
            <label>Nueva contraseña</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPwFeedback(null);
              }}
              placeholder="Mínimo 6 caracteres"
            />
          </FieldGroup>

          <FieldGroup>
            <label>Confirmar nueva contraseña</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPwFeedback(null);
              }}
              placeholder="Repite la nueva contraseña"
            />
          </FieldGroup>

          {pwFeedback && (
            <Feedback $type={pwFeedback.type}>
              {pwFeedback.type === "success" ? <IconCheck /> : <IconAlertCircle />}
              {pwFeedback.msg}
            </Feedback>
          )}

          <Btn
            onClick={handleChangePassword}
            disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
          >
            <IconLock />
            {savingPassword ? "Cambiando..." : "Cambiar contraseña"}
          </Btn>
        </SectionBody>
      </SectionCard>
    </Container>
  );
};

export default ProfileSettings;
