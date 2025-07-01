import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Column {
  id: string;
  name: string;
  type: string;
  board_id: string;
  order: number | null;
  created_at: string;
  options?: string[] | null;
  is_readonly?: boolean | null;
}

interface CellEditorProps {
  column: Column;
  value: string | number | null;
  onValueChange: (value: string | number | null) => void;
  onBlur: () => void;
  isEditing: boolean;
  onClick: () => void;
}

const CellEditor: React.FC<CellEditorProps> = ({
  column,
  value,
  onValueChange,
  onBlur,
  isEditing,
  onClick,
}) => {
  const renderDisplayValue = () => {
    if ((column.type === 'status' || column.type === 'priority') && column.options) {
      const statusColors: { [key: string]: string } = {
        'Not started': 'bg-gray-100 text-gray-800',
        'Working on it': 'bg-yellow-100 text-yellow-800',
        'Stuck': 'bg-red-100 text-red-800',
        'Done': 'bg-green-100 text-green-800',
        'Low': 'bg-blue-100 text-blue-800',
        'Medium': 'bg-orange-100 text-orange-800',
        'High': 'bg-red-100 text-red-800',
      };
      
      return (
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusColors[String(value)] || 'bg-gray-100 text-gray-800')}>
          {value || `Select ${column.type}`}
        </span>
      );
    }
    
    if (column.type === 'date') {
      return value ? format(new Date(String(value)), 'MMM dd, yyyy') : 'Select date';
    }
    
    if (column.type === 'number' || column.type === 'budget') {
      return value ? `${parseFloat(String(value)).toLocaleString()}` : 'Enter number';
    }
    
    if (column.type === 'timestamp') {
      return value ? format(new Date(String(value)), 'MMM dd, yyyy HH:mm') : format(new Date(), 'MMM dd, yyyy HH:mm');
    }
    
    if (column.type === 'notes') {
      const displayText = String(value || 'Click to add notes');
      return (
        <div className="whitespace-pre-wrap max-h-20 overflow-hidden">
          {displayText.length > 50 ? `${displayText.substring(0, 50)}...` : displayText}
        </div>
      );
    }
    
    return value || 'Click to edit';
  };

  if (!isEditing || column.is_readonly || column.type === 'timestamp') {
    return (
      <div
        className="min-h-[2rem] p-2 cursor-pointer hover:bg-gray-50 rounded border-transparent border w-full"
        onClick={column.is_readonly || column.type === 'timestamp' ? undefined : onClick}
      >
        {renderDisplayValue()}
      </div>
    );
  }

  if ((column.type === 'status' || column.type === 'priority') && column.options) {
    return (
      <Select value={value || ''} onValueChange={onValueChange} onOpenChange={(open) => !open && onBlur()}>
        <SelectTrigger className="border-blue-500">
          <SelectValue placeholder={`Select ${column.type}`} />
        </SelectTrigger>
        <SelectContent>
          {column.options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (column.type === 'date') {
    const dateValue = value ? new Date(value) : undefined;
    
    return (
      <Popover onOpenChange={(open) => !open && onBlur()}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal border-blue-500",
              !dateValue && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue ? format(dateValue, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={(date) => {
              onValueChange(date ? date.toISOString().split('T')[0] : '');
              onBlur();
            }}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    );
  }

  if (column.type === 'notes') {
    return (
      <Textarea
        value={String(value || '')}
        onChange={(e) => onValueChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onBlur();
          }
        }}
        className="min-h-[2rem] border-blue-500 resize-none"
        autoFocus
        placeholder="Add notes..."
      />
    );
  }

  if (column.type === 'number' || column.type === 'budget') {
    return (
      <Input
        type="number"
        value={value || ''}
        onChange={(e) => onValueChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onBlur();
          }
        }}
        className="border-blue-500"
        autoFocus
        placeholder="0"
        step="any"
      />
    );
  }

  if (column.type === 'file') {
    return (
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => onValueChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onBlur();
          }
        }}
        className="border-blue-500"
        autoFocus
        placeholder="File URL or name"
      />
    );
  }

  return (
    <Input
      type="text"
      value={String(value || '')}
      onChange={(e) => onValueChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onBlur();
        }
      }}
      className="border-blue-500"
      autoFocus
      placeholder="Enter text..."
    />
  );
};

export default CellEditor;
