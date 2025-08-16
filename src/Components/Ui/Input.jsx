import React, { forwardRef } from "react";
import clsx from "clsx";

const sizeClasses = {
  default: "h-10 px-3 py-2",
  sm: "h-9 px-3 py-1",
  lg: "h-11 px-4 py-3",
};

const Input = forwardRef(
  ({ id, label, error, size = "default", className, ...props }, ref) => {
    return (
      <div className="space-y-2 my-2">
        {label && (
          <label
            htmlFor={id}
            className="block text-md font-medium text-gray-700 dark:text-white"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={clsx(
            "block w-full rounded-md bg-gray-100 placeholder:text-black dark:text-white dark:bg-gray-900 dark:placeholder:text-white border-gray-300 shadow-sm",
            "focus:border-primary focus:ring focus:ring-primary focus:outline-none focus:ring-opacity-50",
            "placeholder-gray-400",
            "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
            sizeClasses[size],
            className
          )}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;