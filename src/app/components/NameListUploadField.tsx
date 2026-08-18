import { useRef } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Upload } from 'lucide-react';

interface NameListUploadFieldProps {
  label: string;
  id: string;
  rawText: string;
  onRawTextChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Shared "paste or upload a roster" control: a labeled textarea plus a
// button that reads a .csv/.txt file into the same field. Controlled by the
// caller (rawText/onRawTextChange) so each dialog owns parsing/preview and
// can reset the field however fits its own save flow.
export function NameListUploadField({ label, id, rawText, onRawTextChange, placeholder, disabled }: NameListUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    onRawTextChange(text);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={disabled} className="gap-2">
          <Upload className="w-3.5 h-3.5" />
          Upload File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <Textarea
        id={id}
        value={rawText}
        onChange={(e) => onRawTextChange(e.target.value)}
        placeholder={placeholder ?? 'Emma Thompson\nLiam Chen\nSophia Martinez'}
        rows={6}
        disabled={disabled}
      />
    </div>
  );
}
