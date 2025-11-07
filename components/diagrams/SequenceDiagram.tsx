'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useDiagramStore, useThemeStore } from '@/stores';

export function SequenceDiagram() {
  const { sequenceInput, setSequenceError } = useDiagramStore();
  const { getCurrentColors } = useThemeStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Mermaid once
  useEffect(() => {
    const colors = getCurrentColors();

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        primaryColor: colors.primary,
        primaryTextColor: colors.text,
        primaryBorderColor: colors.border,
        lineColor: colors.secondary,
        secondaryColor: colors.secondary,
        tertiaryColor: colors.accent,
      },
      securityLevel: 'loose',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    });

    setIsInitialized(true);
  }, [getCurrentColors]);

  // Re-initialize when theme changes
  useEffect(() => {
    if (!isInitialized) return;

    const colors = getCurrentColors();
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        primaryColor: colors.primary,
        primaryTextColor: colors.text,
        primaryBorderColor: colors.border,
        lineColor: colors.secondary,
        secondaryColor: colors.secondary,
        tertiaryColor: colors.accent,
      },
      securityLevel: 'loose',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    });
  }, [getCurrentColors, isInitialized]);

  // Render diagram when input changes
  useEffect(() => {
    if (!isInitialized || !containerRef.current || !sequenceInput.trim()) {
      return;
    }

    const renderDiagram = async () => {
      try {
        // Clear previous content
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Generate unique ID for this render
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Render the diagram
        const { svg } = await mermaid.render(id, sequenceInput);

        // Insert the SVG
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          setSequenceError(null);
        }
      } catch (error) {
        console.error('Mermaid render error:', error);
        setSequenceError(error instanceof Error ? error.message : 'Invalid syntax');
      }
    };

    renderDiagram();
  }, [sequenceInput, isInitialized, setSequenceError]);

  if (!sequenceInput.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p className="text-sm">Enter Mermaid sequence diagram syntax to see preview</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-6">
      <div ref={containerRef} className="mermaid-container" />
    </div>
  );
}
