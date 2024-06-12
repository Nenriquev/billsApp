import styled from "styled-components";

export const HomeWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f6f6f6fb;
  display: flex;
  flex-direction: column;
  gap: 30px;


  .main {
    display: flex;
    width: 100%;
    gap: 70px;
    padding: 0 70px;
  }


  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 50%;
    height: 400px;
    background-color: white;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #dddddd;
    box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.15);
    padding: 10px 0;

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .head{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 30px;

      h2 {
        margin: 0;
      }
    }

    
  }
`;
