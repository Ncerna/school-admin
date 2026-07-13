import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";

export interface AsyncSelectOption {
  value: string;
  label: string;
}

interface AsyncSelectFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  searchEndpoint: string;
}

/**
 * Async select field with search functionality.
 * Searches on Enter key press and displays results in a dropdown.
 * Expects API response: { data: { items: [...] } }
 */
export function AsyncSelectField({
  name,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  searchEndpoint,
}: AsyncSelectFieldProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<AsyncSelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSearch() {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    try {
      // API returns { data: { items: [...] } }
      const response = await apiClient.get<{ items: any[] }>(`${searchEndpoint}?search=${encodeURIComponent(searchTerm)}`);
      const students = response.items || [];
      // Map to show full name with DNI
      const mappedOptions: AsyncSelectOption[] = students.map((student: any) => ({
        value: String(student.id),
        label: `${student.firstName} ${student.lastName} - DNI: ${student.dni}`,
      }));
      setOptions(mappedOptions);
      setShowDropdown(true);
    } catch (err) {
      console.error("Error searching:", err);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  }

  return (
    <div className="grid gap-1.5" ref={containerRef}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <div className="relative">
        <Input
          id={name}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Escribir y presionar Enter para buscar..."}
          disabled={disabled}
        />
        {showDropdown && options.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  onChange(option.value);
                  setSearchTerm(option.label);
                  setShowDropdown(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}