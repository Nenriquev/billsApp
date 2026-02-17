import styled from "styled-components";

export const ConfigurationWrapper = styled.div`
  .collapse {
    .title {
      cursor: pointer;
      display: flex;
      padding: 10px 0 10px 0;
      border-width: 1px;
      border-color: #dddddd;
      border-style: solid;
      border-radius: 5px 5px 0px 0px;
    }

    .content {
      overflow: hidden;

      .content-collapse {
        padding: 20px;
        border-width: 0px 1px 1px 1px;
        border-color: #dddddd;
        border-style: solid;
      }
    }
  }
`;
