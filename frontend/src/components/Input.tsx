import { InputHTMLAttributes } from "react";
import styled from "styled-components";

const InputWrapper = styled.div`
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type="number"] {
    appearance: textfield;
  }
  input {
    border: 1px solid #8787875d;
    border-radius: 5px;
    padding: 10px;
    width: 100%;

    &:focus {
      outline: 2px solid #c1dfff;
    }
  }
`;

const Input = (props: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <InputWrapper>
      <input {...props}/>
    </InputWrapper>
  );
};

export default Input;
