import { InputHTMLAttributes, ReactNode } from "react";
import styled from "styled-components";

const Wrapper = styled.div<{ $hasIcon: boolean }>`
  position: relative;
  width: 100%;

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] { appearance: textfield; }

  input {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 12px;
    padding-left: ${(props) => (props.$hasIcon ? "36px" : "12px")};
    width: 100%;
    font-size: 0.88rem;
    font-family: inherit;
    color: var(--text-primary);
    background: var(--bg-card);
    transition: border-color 0.2s, box-shadow 0.2s;

    &::placeholder { color: var(--text-muted); }

    &:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-light);
    }
  }

  .icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
    display: flex;
    align-items: center;

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

const Input = ({ icon, ...props }: InputProps) => (
  <Wrapper $hasIcon={!!icon}>
    {icon && <div className="icon">{icon}</div>}
    <input {...props} />
  </Wrapper>
);

export default Input;
