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
  // Safety checks for column properties
  const columnType = column.type || 'text';
  const isReadonly = column.is_readonly === true;
  const isTimestamp = columnType === 'timestamp';
  const isClickable = !isReadonly && !isTimestamp;

  // Debug logging
  if (isEditing) {
    console.log('Cell in edit mode:', {
      columnType,
      isReadonly,
      isTimestamp,
      isClickable,
      value,
      hasOptions: !!column.options,
      options: column.options
    });
  }

  const renderDisplayValue = () => {
    // Add visual indicator if we're in display mode
    const displayContent = (() => {
      if ((columnType === 'status' || columnType === 'priority') && column.options) {
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
            {value || `Select ${columnType}`}
          </span>
        );
      }
      
      if (columnType === 'date') {
        return value ? format(new Date(String(value)), 'MMM dd, yyyy') : 'Select date';
      }
      
      if (columnType === 'number' || columnType === 'budget') {
        return value ? `${parseFloat(String(value)).toLocaleString()}` : 'Enter number';
      }
      
      if (columnType === 'timestamp') {
        return value ? format(new Date(String(value)), 'MMM dd, yyyy HH:mm') : format(new Date(), 'MMM dd, yyyy HH:mm');
      }
      
      if (columnType === 'notes') {
        const displayText = String(value || 'Click to add notes');
        return (
          <div className="whitespace-pre-wrap max-h-20 overflow-hidden">
            {displayText.length > 50 ? `${displayText.substring(0, 50)}...` : displayText}
          </div>
        );
      }
      
      return value || 'Click to edit';
    })();

    return (
      <div className="flex items-center justify-between">
        {displayContent}
        <span className="text-xs text-gray-400 ml-2">
          {isEditing ? '(EDIT MODE)' : '(DISPLAY)'}
        </span>
      </div>
    );
  };

  // TEMPORARILY FORCE EDIT MODE - Remove readonly check for testing
  if (!isEditing) {
    return (
      <div
        className={`min-h-[2rem] p-2 rounded border-transparent border w-full ${
          isClickable ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
        }`}
        onClick={isClickable ? onClick : undefined}
      >
        {renderDisplayValue()}
      </div>
    );
  }

  // We're in edit mode - show appropriate editor
  console.log('Rendering editor for column type:', columnType);

  // Status and priority columns - select dropdown with options
  if ((columnType === 'status' || columnType === 'priority') && column.options) {
    console.log('Rendering select dropdown');
    return (
      <div className="bg-yellow-100 border-2 border-yellow-400 rounded">
        <Select value={String(value || '')} onValueChange={onValueChange} onOpenChange={(open) => !open && onBlur()}>
          <SelectTrigger className="border-blue-500">
            <SelectValue placeholder={`Select ${columnType}`} />
          </SelectTrigger>
          <SelectContent>
            {column.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Date column - date picker
  if (columnType === 'date') {
    console.log('Rendering date picker');
    const dateValue = value ? new Date(String(value)) : undefined;
    
    return (
      <div className="bg-green-100 border-2 border-green-400 rounded">
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
      </div>
    );
  }

  // Number and budget columns - number input
  if (columnType === 'number' || columnType === 'budget') {
    console.log('Rendering number input');
    return (
      <div className="bg-blue-100 border-2 border-blue-400 rounded">
        <Input
          type="number"
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
          placeholder="0"
          step="any"
        />
      </div>
    );
  }

  // Notes column - textarea
  if (columnType === 'notes') {
    console.log('Rendering textarea');
    return (
      <div className="bg-purple-100 border-2 border-purple-400 rounded">
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
      </div>
    );
  }

  // Text column (default) - text input
  console.log('Rendering default text input');
  return (
    <div className="bg-red-100 border-2 border-red-400 rounded">
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
    </div>
  );
};

export default CellEditor;
