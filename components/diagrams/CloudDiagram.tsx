'use client';

import { useEffect, useRef } from 'react';
import { useDiagramStore, useThemeStore } from '@/stores';
import { parseCloudSyntax, cloudToDot } from '@/lib/utils';
import { graphviz } from 'd3-graphviz';

export function CloudDiagram() {
  const { cloudInput, setCloudError } = useDiagramStore();
  const { getCurrentColors } = useThemeStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const graphvizRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !cloudInput.trim()) {
      return;
    }

    try {
      // Parse the cloud syntax
      const diagram = parseCloudSyntax(cloudInput);

      // Get theme colors
      const colors = getCurrentColors();

      // Convert to DOT format
      const dot = cloudToDot(diagram, {
        border: colors.border,
        primary: colors.primary,
        text: colors.text,
        background: colors.background,
      });

      // Initialize graphviz if not already done
      if (!graphvizRef.current) {
        graphvizRef.current = graphviz(containerRef.current, {
          useWorker: false,
          zoom: true,
        });
      }

      // Render the diagram
      graphvizRef.current
        .renderDot(dot)
        .on('end', () => {
          setCloudError(null);
        });
    } catch (error) {
      console.error('Cloud diagram render error:', error);
      setCloudError(error instanceof Error ? error.message : 'Failed to render diagram');
    }
  }, [cloudInput, getCurrentColors, setCloudError]);

  if (!cloudInput.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p className="text-sm mb-2">Enter cloud architecture syntax to see diagram</p>
          <div className="text-xs text-left bg-gray-100 p-3 rounded mt-4 font-mono max-w-md">
            <div className="font-semibold mb-2 text-gray-700">Example syntax:</div>
            <div className="text-gray-600">
              web: aws-ec2 "Web"
              <br />
              api: aws-lambda "API"
              <br />
              <br />
              web -&gt; api "HTTP"
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-6 bg-white">
      <div ref={containerRef} className="cloud-diagram-container" />
    </div>
  );
}
