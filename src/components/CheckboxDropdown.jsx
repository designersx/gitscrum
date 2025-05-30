import { useState, useRef, useEffect } from "react";

export default function CheckboxDropdown({
  options,
  selectedOptions,
  onChange,
  label,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    if (selectedOptions.includes(option)) {
      onChange(selectedOptions.filter((o) => o !== option));
    } else {
      onChange([...selectedOptions, option]);
    }
  };

  return (
    <div className="relative inline-block w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left border rounded px-2 py-1"
      >
        {label}:{" "}
        {selectedOptions.length === 0
          ? "All"
          : selectedOptions.length === 1
          ? selectedOptions[0]
          : `${selectedOptions[0]} +${selectedOptions.length - 1} more`}
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-48 overflow-auto">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center px-3 py-1 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={() => toggleOption(option)}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
