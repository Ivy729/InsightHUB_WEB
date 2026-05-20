import React, { useId, useState } from 'react';
import '../styles/settings-password.css';

/**
 * Password input with show/hide toggle (Manager & Staff settings).
 */
const PasswordFieldWithToggle = ({
  label,
  value,
  onChange,
  autoComplete = 'current-password',
}) => {
  const [visible, setVisible] = useState(false);
  const inputId = useId();

  const toggleVisible = () => setVisible((prev) => !prev);

  return (
    <div>
      <label
        htmlFor={inputId}
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#1a2233',
          display: 'block',
          marginBottom: '6px',
        }}
      >
        {label}
      </label>
      <div className="settings-password-wrap">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
        <button
          type="button"
          className="settings-password-eye-btn"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          aria-pressed={visible}
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleVisible}
        >
          <i
            className={`bi ${visible ? 'bi-eye-slash' : 'bi-eye'}`}
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
};

export default PasswordFieldWithToggle;
