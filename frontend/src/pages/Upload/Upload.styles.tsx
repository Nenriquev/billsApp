import styled from "styled-components";

export const UploadPageWrapper = styled.div`
  padding: 24px 32px;
  max-width: 560px;

  h1 {
    font-size: 1.6rem;
    margin-bottom: 4px;
  }

  .subtitle {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 28px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-top: 8px;
  }

  .dropdown-wrap {
    width: 100%;
  }

  .drop-zone {
    border: 2px dashed var(--border);
    border-radius: var(--radius);
    padding: 32px 20px;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--bg-card);
    margin-top: 4px;

    &:hover, &.drag-over {
      border-color: var(--accent);
      background: var(--accent-light);
    }

    &.has-file {
      cursor: default;
      border-style: solid;
      padding: 16px 20px;
    }
  }

  .drop-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 0.88rem;
    text-align: center;

    strong { color: var(--accent); }

    .formats {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text-primary);

    .file-details {
      flex: 1;
      display: flex;
      flex-direction: column;

      .file-name {
        font-size: 0.88rem;
        font-weight: 500;
      }

      .file-size {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    }

    .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      color: var(--text-muted);
      transition: 0.2s;

      &:hover {
        background: var(--danger-light);
        color: var(--danger);
      }
    }
  }

  .submit-btn {
    margin-top: 16px;
    padding: 12px 24px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: #4f46e5;
      box-shadow: var(--shadow-md);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;
