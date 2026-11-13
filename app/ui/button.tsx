import type { ComponentProps } from "react";

export function Button({ className = "", variant = "secondary", type = "button", ...props }: ComponentProps<"button"> & { variant?: "primary" | "secondary" | "ghost" }) {
  return <button type={type} className={`button button-${variant} ${className}`} {...props} />;
}
