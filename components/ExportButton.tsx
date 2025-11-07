'use client';

import { useState, useRef } from 'react';
import { Download, FileImage, FileType, FileText } from 'lucide-react';
import { exportDiagram, generateFilename, ExportFormat } from '@/lib/utils';
import { useDiagramStore } from '@/stores';

interface ExportButtonProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export function ExportButton({ containerRef }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { currentDiagramType } = useDiagramStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleExport = async (format: ExportFormat) => {
    if (!containerRef.current) {
      alert('No diagram to export');
      return;
    }

    setIsExporting(true);
    setIsOpen(false);

    try {
      const filename = generateFilename(currentDiagramType);
      await exportDiagram(containerRef.current, format, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions: Array<{ format: ExportFormat; label: string; icon: React.ReactNode }> = [
    { format: 'png', label: 'PNG Image', icon: <FileImage size={16} /> },
    { format: 'svg', label: 'SVG Vector', icon: <FileType size={16} /> },
    { format: 'pdf', label: 'PDF Document', icon: <FileText size={16} /> },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download size={14} />
        {isExporting ? 'Exporting...' : 'Export'}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              {exportOptions.map((option) => (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
