import styled from "styled-components";

export const UploadPageWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

export const UploadCard = styled.div`
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-light);

  @media (max-width: 768px) {
    box-shadow: none;
    border: none;
    padding: 0;
    background: transparent;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 8px;
    text-align: center;
    color: var(--text-primary);
  }

  .subtitle {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 32px;
    text-align: center;
    line-height: 1.5;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .dropdown-wrap {
    width: 100%;
  }

  .drop-zone {
    border: 2px dashed var(--border);
    border-radius: var(--radius);
    padding: 40px 24px;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--bg-body);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 160px;

    /* ... anteriores estilos de hover ... */
    &:hover, &.drag-over {
      border-color: var(--accent);
      background: var(--accent-light);
    }

    &.has-file {
      cursor: default;
      border-style: solid;
      padding: 24px;
      background: var(--bg-card);
      border-color: var(--border);
    }
  }

  /* ... anteriores estilos de drop-content y file-info ... */
  .drop-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--text-secondary);
    font-size: 0.9rem;
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
    gap: 16px;
    color: var(--text-primary);
    width: 100%;

    .file-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;

      .file-name {
        font-size: 0.9rem;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .file-size {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    }
    
    .remove-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 6px;
      border-radius: 4px;
      &:hover {
        background: var(--danger-light);
        color: var(--danger);
      }
    }
  }

  .submit-btn {
    margin-top: 8px;
    padding: 14px 24px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%; /* Botón full width */
    
    &:hover:not(:disabled) {
      background: #4f46e5;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }
`;

export const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9); // Fondo un poco más opaco para ocultar el form
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: var(--radius);
  gap: 16px;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  span {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 1.1rem;
    text-align: center;
  }
  
  .subtitle {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
  }
`;
