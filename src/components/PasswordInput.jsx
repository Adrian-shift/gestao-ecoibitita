import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>
        {label} <span>*</span>
      </label>

      <div className="password">
        <input
          id={id}
          type={mostrar ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={8}
          required
        />

        <button
          type="button"
          aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setMostrar((valor) => !valor)}
        >
          {mostrar ? <EyeOff /> : <Eye />}
        </button>
      </div>
    </div>
  );
}
