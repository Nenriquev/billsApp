import { ButtonHTMLAttributes } from "react";
import styled, { css } from "styled-components";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const sizeStyles = {
  sm: css`
    padding: 7px 14px;
    font-size: 0.8rem;
    gap: 5px;
    svg { width: 14px; height: 14px; }
  `,
  md: css`
    padding: 10px 20px;
    font-size: 0.88rem;
    gap: 6px;
    svg { width: 16px; height: 16px; }
  `,
  lg: css`
    padding: 14px 28px;
    font-size: 1rem;
    gap: 8px;
    svg { width: 18px; height: 18px; }
  `,
};

const variantStyles = {
  primary: css`
    background: var(--accent);
    color: white;
    &:hover:not(:disabled) { background: #4f46e5; }
  `,
  secondary: css`
    background: var(--border-light);
    color: var(--text-secondary);
    &:hover:not(:disabled) { background: var(--border); color: var(--text-primary); }
  `,
  danger: css`
    background: var(--danger);
    color: white;
    &:hover:not(:disabled) { background: #dc2626; }
  `,
  ghost: css`
    background: transparent;
    color: var(--text-secondary);
    &:hover:not(:disabled) { background: var(--border-light); color: var(--text-primary); }
  `,
};

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  width: ${(p) => (p.$fullWidth ? "100%" : "auto")};

  ${(p) => sizeStyles[p.$size]}
  ${(p) => variantStyles[p.$variant]}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Button = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  children,
  ...rest
}: ButtonProps) => (
  <StyledButton $variant={variant} $size={size} $fullWidth={fullWidth} {...rest}>
    {icon}
    {children}
  </StyledButton>
);

export default Button;
