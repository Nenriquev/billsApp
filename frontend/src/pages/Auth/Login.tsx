import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { api } from "../../axios/axios";
import { useAuth } from "../../context/AuthContext";
import { IconLock, IconMail } from "@tabler/icons-react";

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
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
  border: 1px solid var(--border-light);
  
  h2 {
    text-align: center;
    margin-bottom: 24px;
    font-size: 24px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
  }
  
  .input-wrapper {
    position: relative;
    
    input {
      width: 100%;
      padding: 12px 12px 12px 40px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
      background: var(--bg-main);
      color: var(--text-primary);
      transition: all 0.2s;
      
      &:focus {
        border-color: var(--accent);
        outline: none;
        box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.1);
      }
    }
    
    svg {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.div`
  color: var(--danger);
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
  background: rgba(220, 38, 38, 0.1);
  padding: 8px;
  border-radius: var(--radius-sm);
`;

const FieldError = styled.div`
  color: var(--danger);
  font-size: 12px;
  margin-top: 4px;
`;

const Footer = styled.p`
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  
  a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
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
              <IconMail size={20} />
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
              <IconLock size={20} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
              />
            </div>
            {fieldErrors.password && <FieldError>{fieldErrors.password}</FieldError>}
          </FormGroup>
          
          <Button type="submit" disabled={loading}>
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
