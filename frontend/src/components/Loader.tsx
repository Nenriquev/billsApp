import styled from "styled-components";

const LoaderWrapper = styled.div`
  width: 50.4px;
   height: 44.8px;
   --c: linear-gradient(#d0d0d0 0 0);
   background: var(--c) 0% 100%, var(--c) 50% 100%, var(--c) 100% 100%;
   background-size: 10.1px 100%;
   background-repeat: no-repeat;
   animation: bars-mbi2jdmd 1.3s infinite linear;

   @keyframes bars-mbi2jdmd {
   20% {
      background-size: 10.1px 10%, 10.1px 100%, 10.1px 100%;
   }

   40% {
      background-size: 10.1px 80%, 10.1px 10%, 10.1px 100%;
   }

   60% {
      background-size: 10.1px 100%, 10.1px 80%, 10.1px 10%;
   }

   80% {
      background-size: 10.1px 100%, 10.1px 100%, 10.1px 80%;
   }
}
`;

const Loader = () => {
  return <LoaderWrapper className="bars"></LoaderWrapper>;
};

export default Loader;
