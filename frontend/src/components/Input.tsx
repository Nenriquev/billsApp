import { InputHTMLAttributes } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
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
`;

const Input = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <Wrapper>
    <input {...props} />
  </Wrapper>
);

export default Input;
