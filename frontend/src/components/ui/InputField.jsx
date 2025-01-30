import { FaExclamationCircle } from "react-icons/fa";

const InputField = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  error,
  ...props
}) => (
  <div className="mb-4">
    <label className="input-title">{label}</label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      )}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input-field ${props.className || ""}`}
        {...props}
      />
    </div>
    {error && (
      <div className="text-red-500 text-sm mt-1 flex items-center gap-2">
        <FaExclamationCircle />
        {error}
      </div>
    )}
  </div>
);

export default InputField;
