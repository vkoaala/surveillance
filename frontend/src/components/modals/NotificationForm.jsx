import { useReducer, useCallback } from "react";
import {
  FaLink,
  FaUser,
  FaCamera,
  FaChevronDown,
  FaTags,
} from "react-icons/fa";
import InputField from "@/components/ui/InputField";
import AvatarPreview from "@/components/ui/AvatarPreview";

const validateWebhookUrl = (url) =>
  /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(url);
const validateAvatarUrl = (url) =>
  url === "" || /\.(jpg|jpeg|png|gif|webp)$/.test(url);

const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_TESTING":
      return { ...state, testing: action.testing };
    default:
      return state;
  }
};

const NotificationForm = ({ initialSettings = {}, onSave, onTest }) => {
  const [state, dispatch] = useReducer(formReducer, {
    webhookUrl: initialSettings.webhookUrl || "",
    discordName: initialSettings.discordName || "",
    discordAvatar: initialSettings.discordAvatar || "",
    mentionType: initialSettings.pingType || "None",
    errors: {},
    loading: false,
    testing: false,
  });

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      dispatch({ type: "SET_FIELD", field: name, value });
      dispatch({
        type: "SET_ERRORS",
        errors: { ...state.errors, [name]: null },
      });
    },
    [state.errors],
  );

  const validateForm = useCallback(() => {
    const errors = {};
    if (!validateWebhookUrl(state.webhookUrl)) {
      errors.webhookUrl = "Invalid Discord webhook URL format.";
    }
    if (state.discordAvatar && !validateAvatarUrl(state.discordAvatar)) {
      errors.discordAvatar = "Invalid image URL.";
    }
    dispatch({ type: "SET_ERRORS", errors });
    return Object.keys(errors).length === 0;
  }, [state.webhookUrl, state.discordAvatar]);

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;
      dispatch({ type: "SET_LOADING", loading: true });
      try {
        await onSave({
          webhookUrl: state.webhookUrl,
          discordName: state.discordName,
          discordAvatar: state.discordAvatar,
          pingType: state.mentionType,
        });
      } finally {
        dispatch({ type: "SET_LOADING", loading: false });
      }
    },
    [
      state.webhookUrl,
      state.discordName,
      state.discordAvatar,
      state.mentionType,
      onSave,
      validateForm,
    ],
  );

  const handleTest = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateWebhookUrl(state.webhookUrl)) {
        onTest(false, "Set a valid webhook URL first.");
        return;
      }
      dispatch({ type: "SET_TESTING", testing: true });
      try {
        await onTest(true, "");
      } finally {
        dispatch({ type: "SET_TESTING", testing: false });
      }
    },
    [state.webhookUrl, onTest],
  );
  return (
    <form onSubmit={handleSave} className="space-y-6">
      <InputField
        label="Webhook URL"
        icon={FaLink}
        name="webhookUrl"
        value={state.webhookUrl}
        onChange={handleInputChange}
        placeholder="Enter Discord Webhook URL"
        error={state.errors.webhookUrl}
      />
      <InputField
        label="Bot Name"
        icon={FaUser}
        name="discordName"
        value={state.discordName}
        onChange={handleInputChange}
        placeholder="Enter bot name"
      />
      <InputField
        label="Avatar URL"
        icon={FaCamera}
        name="discordAvatar"
        value={state.discordAvatar}
        onChange={handleInputChange}
        placeholder="Enter avatar URL (optional)"
        error={state.errors.discordAvatar}
      />
      <AvatarPreview
        url={state.discordAvatar}
        isValid={validateAvatarUrl(state.discordAvatar)}
      />

      <div className="mt-2">
        <label
          htmlFor="mentionType"
          className="block text-sm font-medium text-[var(--color-text)] mb-1"
        >
          Notification Ping
        </label>
        <div className="relative">
          <FaTags className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <select
            id="mentionType"
            name="mentionType"
            value={state.mentionType}
            onChange={handleInputChange}
            className="w-full h-12 pl-10 pr-8 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none appearance-none transition-all duration-200"
          >
            <option value="None">None</option>
            <option value="@everyone">@everyone</option>
            <option value="@here">@here</option>
          </select>
          <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none" />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button
          type="button"
          onClick={handleTest}
          disabled={state.testing}
          className="px-6 py-2.5 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition-all duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
        >
          {state.testing ? "Testing..." : "Test Notification"}
        </button>
        <button
          type="submit"
          disabled={state.loading}
          className="px-6 py-2.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium transition-all duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50"
        >
          {state.loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
};

export default NotificationForm;
