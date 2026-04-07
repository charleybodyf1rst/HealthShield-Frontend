'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eraser, Check, RotateCcw, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignaturePadProps {
  onSignatureChange: (signatureData: string | null) => void;
  width?: number;
  height?: number;
  penColor?: string;
  backgroundColor?: string;
  disabled?: boolean;
  label?: string;
}

export function SignaturePad({
  onSignatureChange,
  width = 400,
  height = 200,
  penColor = '#000000',
  backgroundColor = '#ffffff',
  disabled = false,
  label = 'Sign Below',
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up high DPI canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Set drawing styles
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear with background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    setContext(ctx);
  }, [width, height, penColor, backgroundColor]);

  const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || !context) return;

    e.preventDefault();
    const { x, y } = getCoordinates(e);

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
    setIsEmpty(false);
  }, [context, disabled, getCoordinates]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled || !context) return;

    e.preventDefault();
    const { x, y } = getCoordinates(e);

    context.lineTo(x, y);
    context.stroke();
  }, [context, disabled, getCoordinates, isDrawing]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing || !context) return;

    context.closePath();
    setIsDrawing(false);

    // Get signature data and pass to parent
    const canvas = canvasRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL('image/png');
      onSignatureChange(signatureData);
    }
  }, [context, isDrawing, onSignatureChange]);

  const clearSignature = useCallback(() => {
    if (!context || disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
    setIsEmpty(true);
    onSignatureChange(null);
  }, [context, backgroundColor, width, height, disabled, onSignatureChange]);

  return (
    <Card className={cn(disabled && 'opacity-60')}>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <PenTool className="w-4 h-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg overflow-hidden',
            disabled ? 'border-slate-200 cursor-not-allowed' : 'border-slate-300 cursor-crosshair',
            !isEmpty && 'border-solid border-emerald-300'
          )}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="touch-none"
          />

          {isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-slate-400 text-sm">Draw your signature here</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {!isEmpty && (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Signature captured</span>
              </>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSignature}
            disabled={disabled || isEmpty}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
