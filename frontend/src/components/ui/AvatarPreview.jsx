import React from "react";

const AvatarPreview = ({ url, isValid }) => {
  if (!url || !isValid) return null;

  return (
    <img
      src={url}
      alt="Avatar Preview"
      className="mt-2 h-12 w-12 rounded-full border border-[var(--color-border)] object-cover"
    />
  );
};

export default AvatarPreview;
