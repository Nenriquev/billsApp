import styled from "styled-components";

export const HomeWrapper = styled.div`
  width: 100%;
  background-color: #f6f6f6fb;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-bottom: 50px;

  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 50px;
    padding: 0 50px;
  }

  .row {
    padding: 0 50px;
  }

  .navbar {
    padding: 10px 50px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .utils {
      display: flex;
      .drop {
        display: flex;
        margin-left: auto;
        width: 200px;
      }
    }
  }

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 400px;
    background-color: white;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #dddddd;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.15);
    padding: 10px 0;

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .head {
      position: absolute;
      top: 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 30px;
      width: 100%;

      .total {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
      }
    }

    .chart {
      position: absolute;
      bottom: 15px;
      width: 100%;
      height: calc(100% - 50px);
    }
  }
`;
