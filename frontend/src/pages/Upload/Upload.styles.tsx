import styled from "styled-components";

export const UploadPageWrapper = styled.div`
  width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent),
              radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.05), transparent);
`;

// Step Indicator Components
export const StepProgressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
  margin: 0 auto 48px;
  position: relative;
`;

export const StepItem = styled.div<{ $active?: boolean; $completed?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 2;
  position: relative;

  .circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${props => props.$completed ? 'var(--accent)' : props.$active ? 'var(--bg-card)' : 'var(--bg-body)'};
    border: 2px solid ${props => (props.$active || props.$completed) ? 'var(--accent)' : 'var(--border)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$completed ? 'white' : props.$active ? 'var(--accent)' : 'var(--text-muted)'};
    font-weight: 700;
    font-size: 0.9rem;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${props => props.$active ? '0 0 0 4px var(--accent-light)' : 'none'};
  }

  span {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${props => props.$active ? 'var(--text-primary)' : 'var(--text-muted)'};
    transition: color 0.3s;
    white-space: nowrap;
  }
`;

export const StepLine = styled.div<{ $completed?: boolean }>`
  position: absolute;
  top: 18px;
  left: 0;
  height: 2px;
  background: var(--border-light);
  width: 100%;
  z-index: 1;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.$completed ? '100%' : '0%'};
    background: var(--accent);
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

export const UploadCard = styled.div<{ $isReview?: boolean }>`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.08), 
              0 0 0 1px rgba(255,255,255,0.4) inset;
  padding: ${props => props.$isReview ? "0" : "48px"};
  width: 100%;
  max-width: ${props => props.$isReview ? "1100px" : "540px"};
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  @media (max-width: 768px) {
    box-shadow: none;
    border: none;
    padding: 20px;
    max-width: 100%;
    background: transparent;
    backdrop-filter: none;
  }

  .card-header {
    padding: ${props => props.$isReview ? "32px 32px 16px" : "0"};
    text-align: center;
  }

  h1 {
    font-size: 1.8rem;
    margin-bottom: 12px;
    font-weight: 800;
    background: linear-gradient(135deg, var(--text-primary), #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  h2 {
    font-size: 1.4rem;
    margin-bottom: 0;
    font-weight: 700;
  }

  .subtitle {
    color: var(--text-secondary);
    font-size: 0.95rem;
    margin-bottom: 40px;
    line-height: 1.6;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    text-align: left;
  }

  .field-label {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-left: 4px;
  }

  .dropdown-wrap {
    width: 100%;
  }

  .drop-zone {
    border: 2px dashed var(--border);
    border-radius: var(--radius-lg);
    padding: 48px 24px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(248, 250, 252, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    position: relative;
    overflow: hidden;

    &:hover, &.drag-over {
      border-color: var(--accent);
      background: var(--accent-light);
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -10px rgba(99, 102, 241, 0.2);
    }

    &.has-file {
      cursor: default;
      border-style: solid;
      padding: 32px;
      background: white;
      border-color: var(--accent-light);
    }
  }

  .drop-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    color: var(--text-secondary);
    font-size: 0.95rem;
    text-align: center;

    strong { 
      color: var(--accent); 
      font-weight: 700;
    }

    .formats {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 20px;
    color: var(--text-primary);
    width: 100%;

    .file-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow: hidden;

      .file-name {
        font-size: 1rem;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .file-size {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
    }
    
    .remove-btn {
      background: var(--bg-body);
      border: 1px solid var(--border-light);
      color: var(--text-muted);
      cursor: pointer;
      padding: 10px;
      border-radius: 50%;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: var(--danger-light);
        color: var(--danger);
        border-color: var(--danger-light);
        transform: scale(1.1);
      }
    }
  }

  .submit-btn {
    margin-top: 16px;
    padding: 16px 32px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    
    &:hover:not(:disabled) {
      background: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(99, 102, 241, 0.5);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }
`;

export const ReviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 80vh;
  max-height: 850px;
  animation: slideUp 0.5s ease-out;

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 0 32px 32px;
    
    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { 
      background: var(--border); 
      border-radius: 10px; 
    }
  }

  .review-sticky-header {
    padding: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    z-index: 10;
    border-bottom: 1px solid var(--border-light);

    .header-info {
      h2 { margin: 0; font-size: 1.4rem; }
      .stats {
        margin-top: 4px;
        font-size: 0.9rem;
        color: var(--text-secondary);
        strong { color: var(--accent); }
      }
    }
  }

  .review-footer {
    padding: 24px 32px;
    background: var(--bg-body);
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 -10px 20px -10px rgba(0,0,0,0.05);

    button {
      padding: 12px 28px;
      border-radius: var(--radius);
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-secondary {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border);
      &:hover { 
        background: white;
        border-color: var(--text-muted);
        color: var(--text-primary);
      }
    }

    .btn-primary {
      background: var(--accent);
      color: white;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
      &:hover { 
        background: #4f46e5;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
      }
      &:active { transform: translateY(0); }
      &:disabled { 
        opacity: 0.5; 
        cursor: not-allowed; 
        transform: none;
        box-shadow: none;
      }
    }

    .actions {
      display: flex;
      gap: 16px;
    }
  }
`;

export const SuggestionBlock = styled.div`
  background: white;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  transition: transform 0.2s;

  &:hover {
    border-color: var(--accent-light);
  }

  .block-header {
    padding: 20px 24px;
    background: linear-gradient(to bottom, #fcfcfd, #f8fafc);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-light);

    .title-group {
      display: flex;
      align-items: center;
      gap: 12px;
      
      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 8px;

        svg {
          color: var(--accent);
          opacity: 0.8;
        }
      }
      
      .badge {
        font-size: 0.75rem;
        padding: 4px 10px;
        border-radius: 20px;
        background: var(--accent-light);
        color: var(--accent);
        font-weight: 700;
        letter-spacing: 0.5px;
      }
    }

    .desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-style: italic;
    }
  }
`;

export const TransactionTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 16px 24px;
    text-align: left;
    border-bottom: 1px solid #f1f5f9;
  }

  th {
    background: #f8fafc;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-muted);
  }

  tr:hover td {
    background: #fcfcfd;
  }

  .concept {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;
  }

  .date { 
    color: var(--text-secondary); 
    font-size: 0.85rem;
    font-family: inherit;
  }

  .amount { 
    font-weight: 700; 
    text-align: right; 
    font-size: 0.95rem;
    color: var(--text-primary);
  }
  
  .actions {
    width: 60px;
    text-align: center;
    
    button {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.2s;
      
      &:hover {
        background: var(--danger-light);
        color: var(--danger);
        transform: rotate(15deg);
      }
    }
  }
`;

export const SuccessState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 0;
  animation: celebrate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes celebrate {
    0% { transform: scale(0.5); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }

  .icon-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--success);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32px;
    box-shadow: 0 10px 25px rgba(22, 163, 74, 0.3);
    border: 4px solid white;
  }

  h2 { font-size: 2rem; margin-bottom: 16px; font-weight: 800; }
  p { font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 40px; max-width: 320px; }
  
  .finish-btn {
    padding: 16px 48px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);

    &:hover { 
      background: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
    }
  }
`;

export const LoadingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 60px 0;

  span {
    font-weight: 700;
    color: var(--text-primary);
    font-size: 1.4rem;
    text-align: center;
  }
  
  .subtitle {
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0;
    text-align: center;
    max-width: 250px;
  }
`;

export const AIBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-light);
  color: var(--accent);
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 700;
  border: 1px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  animation: pulse-border 2s infinite;

  svg {
    filter: drop-shadow(0 0 4px rgba(99, 102, 241, 0.4));
  }

  @keyframes pulse-border {
    0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.2); }
    70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
    100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
  }
`;
