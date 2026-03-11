import * as React from "react";
import { HexColorPicker, HexColorInput, RgbaColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

// Convert hex to rgba
const hexToRgba = (hex: string, alpha: number = 1): { r: number; g: number; b: number; a: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: alpha,
    };
  }
  return { r: 155, g: 135, b: 245, a: 1 };
};

// Convert rgba to hex
const rgbaToHex = (r: number, g: number, b: number): string => {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
};

// Parse any color format to get hex and alpha
const parseColor = (color: string): { hex: string; alpha: number } => {
  // Check if it's rgba format
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
    return { hex: rgbaToHex(r, g, b), alpha: a };
  }
  
  // Check if it's hex with alpha
  if (color.startsWith("#") && color.length === 9) {
    const hex = color.substring(0, 7);
    const alpha = parseInt(color.substring(7, 9), 16) / 255;
    return { hex, alpha };
  }
  
  // Regular hex or other
  if (color.startsWith("#")) {
    return { hex: color.substring(0, 7), alpha: 1 };
  }
  
  // Transparent
  if (color === "transparent") {
    return { hex: "#000000", alpha: 0 };
  }
  
  return { hex: "#9b87f5", alpha: 1 };
};

// Format output color
const formatColor = (hex: string, alpha: number): string => {
  if (alpha === 0) return "transparent";
  if (alpha === 1) return hex;
  const { r, g, b } = hexToRgba(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
};

// Recent colors storage
const RECENT_COLORS_KEY = "homepage-editor-recent-colors";
const MAX_RECENT_COLORS = 12;

const getRecentColors = (): string[] => {
  try {
    const stored = localStorage.getItem(RECENT_COLORS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentColor = (color: string): void => {
  try {
    const recent = getRecentColors().filter(c => c !== color);
    recent.unshift(color);
    localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_COLORS)));
  } catch {
    // Ignore storage errors
  }
};

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const { hex, alpha } = parseColor(value || "#9b87f5");
  const [currentHex, setCurrentHex] = React.useState(hex);
  const [currentAlpha, setCurrentAlpha] = React.useState(alpha);
  const [recentColors, setRecentColors] = React.useState<string[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  
  // RGB values for display
  const rgb = hexToRgba(currentHex);
  
  React.useEffect(() => {
    setRecentColors(getRecentColors());
  }, [isOpen]);
  
  React.useEffect(() => {
    const { hex: newHex, alpha: newAlpha } = parseColor(value || "#9b87f5");
    setCurrentHex(newHex);
    setCurrentAlpha(newAlpha);
  }, [value]);
  
  const handleHexChange = (newHex: string) => {
    setCurrentHex(newHex);
    const formatted = formatColor(newHex, currentAlpha);
    onChange(formatted);
  };
  
  const handleAlphaChange = (newAlpha: number[]) => {
    const alphaValue = newAlpha[0];
    setCurrentAlpha(alphaValue);
    const formatted = formatColor(currentHex, alphaValue);
    onChange(formatted);
  };
  
  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
    const numValue = Math.min(255, Math.max(0, parseInt(value) || 0));
    const newRgb = { ...rgb, [channel]: numValue };
    const newHex = rgbaToHex(newRgb.r, newRgb.g, newRgb.b);
    setCurrentHex(newHex);
    const formatted = formatColor(newHex, currentAlpha);
    onChange(formatted);
  };
  
  const handleClose = () => {
    const formatted = formatColor(currentHex, currentAlpha);
    saveRecentColor(formatted);
    setRecentColors(getRecentColors());
    setIsOpen(false);
  };
  
  const handleRecentColorClick = (color: string) => {
    const { hex: newHex, alpha: newAlpha } = parseColor(color);
    setCurrentHex(newHex);
    setCurrentAlpha(newAlpha);
    onChange(color);
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <Popover open={isOpen} onOpenChange={(open) => {
        if (!open) handleClose();
        else setIsOpen(true);
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-10"
          >
            <div 
              className="h-6 w-6 rounded border border-border shadow-sm"
              style={{ 
                backgroundColor: formatColor(currentHex, currentAlpha),
                backgroundImage: currentAlpha < 1 ? 
                  "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)" : 
                  undefined,
                backgroundSize: "8px 8px",
                backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px"
              }}
            >
              <div 
                className="h-full w-full rounded"
                style={{ backgroundColor: formatColor(currentHex, currentAlpha) }}
              />
            </div>
            <span className="text-sm font-mono truncate">
              {currentAlpha < 1 
                ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${currentAlpha.toFixed(2)})`
                : currentHex.toUpperCase()
              }
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            {/* Color Picker */}
            <div className="flex justify-center">
              <HexColorPicker 
                color={currentHex} 
                onChange={handleHexChange}
                style={{ width: "100%", height: "160px" }}
              />
            </div>
            
            {/* Opacity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Opacity</Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(currentAlpha * 100)}%
                </span>
              </div>
              <div 
                className="h-4 rounded relative"
                style={{
                  backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                  backgroundSize: "8px 8px",
                  backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px"
                }}
              >
                <div 
                  className="absolute inset-0 rounded"
                  style={{
                    background: `linear-gradient(to right, transparent, ${currentHex})`
                  }}
                />
                <Slider
                  value={[currentAlpha]}
                  onValueChange={handleAlphaChange}
                  min={0}
                  max={1}
                  step={0.01}
                  className="absolute inset-0"
                />
              </div>
            </div>
            
            {/* HEX Input */}
            <div className="space-y-2">
              <Label className="text-xs">HEX</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">#</span>
                <Input
                  value={currentHex.replace("#", "").toUpperCase()}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9a-fA-F]/g, "").substring(0, 6);
                    if (val.length === 6) {
                      handleHexChange(`#${val}`);
                    }
                  }}
                  className="font-mono h-8"
                  maxLength={6}
                />
              </div>
            </div>
            
            {/* RGB Inputs */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">R</Label>
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb.r}
                  onChange={(e) => handleRgbChange('r', e.target.value)}
                  className="h-8 text-center"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">G</Label>
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb.g}
                  onChange={(e) => handleRgbChange('g', e.target.value)}
                  className="h-8 text-center"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">B</Label>
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb.b}
                  onChange={(e) => handleRgbChange('b', e.target.value)}
                  className="h-8 text-center"
                />
              </div>
            </div>
            
            {/* Recent Colors */}
            {recentColors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">Recent Colors</Label>
                <div className="flex flex-wrap gap-1.5">
                  {recentColors.map((color, index) => {
                    const { hex: colorHex, alpha: colorAlpha } = parseColor(color);
                    return (
                      <button
                        key={index}
                        className="h-6 w-6 rounded border border-border shadow-sm hover:scale-110 transition-transform cursor-pointer"
                        style={{
                          backgroundImage: colorAlpha < 1 ? 
                            "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)" : 
                            undefined,
                          backgroundSize: "6px 6px",
                          backgroundPosition: "0 0, 0 3px, 3px -3px, -3px 0px"
                        }}
                        onClick={() => handleRecentColorClick(color)}
                      >
                        <div 
                          className="h-full w-full rounded"
                          style={{ backgroundColor: color }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Preview */}
            <div className="space-y-2">
              <Label className="text-xs">Preview</Label>
              <div 
                className="h-10 rounded border border-border"
                style={{
                  backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                  backgroundSize: "12px 12px",
                  backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px"
                }}
              >
                <div 
                  className="h-full w-full rounded"
                  style={{ backgroundColor: formatColor(currentHex, currentAlpha) }}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
