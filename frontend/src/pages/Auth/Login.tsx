import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { api } from "../../axios/axios";
import { useAuth } from "../../context/AuthContext";
import { IconLock, IconMail } from "@tabler/icons-react";
import Button from "../../components/Button";

const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--bg-main);
`;

const AuthCard = styled.div`
  background: var(--bg-card);
  padding: 40px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 400px;
  border: 1px solid var(--border);

  h2 {
    text-align: center;
    margin-bottom: 24px;
    font-size: 1.5rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .input-wrapper {
    position: relative;

    input {
      width: 100%;
      padding: 11px 12px 11px 40px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.9rem;
      font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;

      &::placeholder { color: var(--text-muted); }

      &:focus {
        border-color: var(--accent);
        outline: none;
        box-shadow: 0 0 0 3px var(--accent-light);
      }
    }

    svg {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      width: 18px;
      height: 18px;
    }
  }
`;

const ErrorMsg = styled.div`
  color: var(--danger);
  font-size: 0.84rem;
  text-align: center;
  background: var(--danger-light);
  padding: 10px 14px;
  border-radius: var(--radius-sm);
`;

const FieldError = styled.div`
  color: var(--danger);
  font-size: 0.75rem;
  margin-top: 2px;
`;

const Footer = styled.p`
  margin-top: 24px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-secondary);

  a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 600;
    &:hover { text-decoration: underline; }
  }
`;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email) {
      errors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email no válido";
    }
    if (!password) {
      errors.password = "La contraseña es obligatoria";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validate()) return;

    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <h2>Bienvenido de nuevo</h2>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <form onSubmit={handleSubmit} noValidate>
          <FormGroup>
            <label>Email</label>
            <div className="input-wrapper">
              <IconMail />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>
            {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
          </FormGroup>

          <FormGroup>
            <label>Contraseña</label>
            <div className="input-wrapper">
              <IconLock />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {fieldErrors.password && <FieldError>{fieldErrors.password}</FieldError>}
          </FormGroup>

          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </Button>
        </form>
        <Footer>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </Footer>
      </AuthCard>
    </AuthContainer>
  );
};

export default Login;
