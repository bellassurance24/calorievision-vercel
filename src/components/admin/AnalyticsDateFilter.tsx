import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DateRange = {
  from: Date;
  to: Date;
};

export type QuickFilter = 
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "last90days"
  | "thisMonth"
  | "lastMonth"
  | "custom";

interface AnalyticsDateFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  activeFilter: QuickFilter;
  onFilterChange: (filter: QuickFilter) => void;
}

const quickFilters: { key: QuickFilter; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7days", label: "Last 7 Days" },
  { key: "last30days", label: "Last 30 Days" },
  { key: "last90days", label: "Last 90 Days" },
  { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
];

export const getDateRangeForFilter = (filter: QuickFilter): DateRange => {
  const now = new Date();
  
  switch (filter) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday":
      const yesterday = subDays(now, 1);
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
    case "last7days":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case "last30days":
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
    case "last90days":
      return { from: startOfDay(subDays(now, 89)), to: endOfDay(now) };
    case "thisMonth":
      return { from: startOfMonth(now), to: endOfDay(now) };
    case "lastMonth":
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    default:
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
  }
};

export const AnalyticsDateFilter = ({
  dateRange,
  onDateRangeChange,
  activeFilter,
  onFilterChange,
}: AnalyticsDateFilterProps) => {
  const [customFrom, setCustomFrom] = useState<Date | undefined>(dateRange.from);
  const [customTo, setCustomTo] = useState<Date | undefined>(dateRange.to);

  const handleQuickFilter = (filter: QuickFilter) => {
    onFilterChange(filter);
    onDateRangeChange(getDateRangeForFilter(filter));
  };

  const handleApplyCustom = () => {
    if (customFrom && customTo) {
      onFilterChange("custom");
      onDateRangeChange({ from: startOfDay(customFrom), to: endOfDay(customTo) });
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <Button
            key={filter.key}
            variant={activeFilter === filter.key ? "default" : "outline"}
            size="sm"
            onClick={() => handleQuickFilter(filter.key)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !customFrom && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {customFrom ? format(customFrom, "PPP") : "Start Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={customFrom}
              onSelect={setCustomFrom}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        
        <span className="text-muted-foreground">to</span>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !customTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {customTo ? format(customTo, "PPP") : "End Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={customTo}
              onSelect={setCustomTo}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        
        <Button onClick={handleApplyCustom} disabled={!customFrom || !customTo}>
          Apply Filter
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Showing data from {format(dateRange.from, "MMM d, yyyy")} to {format(dateRange.to, "MMM d, yyyy")}
      </p>
    </div>
  );
};
