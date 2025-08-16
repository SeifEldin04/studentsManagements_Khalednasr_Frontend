import React from "react";
import clsx from "clsx";

const variantClasses = {
  default: "bg-primary text-white hover:bg-secondary focus:outline-none",
  outline:
    "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
  link: "bg-transparent underline-offset-4 hover:underline text-primary hover:text-white",
};

const sizeClasses = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-11 px-8",
  icon: "h-10 w-10",
};

export function Button({
  children,
  variant = "default",
  size = "default",
  className,
  loading = false, // ⬅️ عرفه هنا
  ...props
}) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md text-md font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={loading || props.disabled} // ⬅️ لو في تحميل خليه disabled
      {...propsWithoutLoading(props)} // ⬅️ نشيل loading من props قبل تمريرها
    >
      {loading ? "Loading..." : children} {/* أو Spinner */}
    </button>
  );
}

function propsWithoutLoading(props) {
  const { loading, ...rest } = props;
  return rest;
}