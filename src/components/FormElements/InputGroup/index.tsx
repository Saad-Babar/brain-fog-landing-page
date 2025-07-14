import { cn } from "@/lib/utils";
import { type HTMLInputTypeAttribute, useId } from "react";

type InputGroupProps = {
  className?: string;
  label: string;
  placeholder: string;
  type: HTMLInputTypeAttribute;
  fileStyleVariant?: "style1" | "style2";
  required?: boolean;
  disabled?: boolean;
  active?: boolean;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  name?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  height?: "sm" | "default";
  defaultValue?: string;
};

export default function InputGroup({ label, placeholder, type, value, handleChange, className = "", ...props }: PropsType) {
  const id = useId();
  const isUrdu = /[\u0600-\u06FF]/.test(label);
  
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={`text-lg font-medium text-dark dark:text-white ${isUrdu ? 'urdu-text' : ''}`}
      >
        {label}
      </label>

      <div className="relative mt-3 [&_svg]:pointer-events-none [&_svg]:absolute [&_svg]:left-5.5 [&_svg]:top-5.5">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className={cn(
            "w-full rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition focus:border-primary disabled:cursor-default disabled:bg-gray-2 data-[active=true]:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary dark:disabled:bg-dark dark:data-[active=true]:border-primary",
            type === "file"
              ? getFileStyles(props.fileStyleVariant!)
              : "px-5.5 py-4 text-lg text-dark placeholder:text-dark-6 dark:text-white",
            props.iconPosition === "left" && "pl-12.5",
            props.height === "sm" && "py-3",
            isUrdu ? 'urdu-text' : '',
          )}
          required={props.required}
          disabled={props.disabled}
          data-active={props.active}
          defaultValue={props.defaultValue}
          {...props}
        />

        {props.icon}
      </div>
    </div>
  );
}

function getFileStyles(variant: "style1" | "style2") {
  switch (variant) {
    case "style1":
      return `file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-[#E2E8F0] file:px-6.5 file:py-[13px] file:text-body-sm file:font-medium file:text-dark-5 file:hover:bg-primary file:hover:bg-opacity-10 dark:file:border-dark-3 dark:file:bg-white/30 dark:file:text-white`;
    default:
      return `file:mr-4 file:rounded file:border-[0.5px] file:border-stroke file:bg-stroke file:px-2.5 file:py-1 file:text-body-xs file:font-medium file:text-dark-5 file:focus:border-primary dark:file:border-dark-3 dark:file:bg-white/30 dark:file:text-white px-3 py-[9px]`;
  }
}
