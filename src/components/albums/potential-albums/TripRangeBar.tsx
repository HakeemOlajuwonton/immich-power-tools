import { usePhotoSelectionContext } from "@/contexts/PhotoSelectionContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { addDays, format, parseISO } from "date-fns";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";

const shift = (date: string, days: number) => format(addDays(parseISO(date), days), "yyyy-MM-dd");

export const tripAlbumName = (startDate: string, cityName?: string | null) =>
  `${startDate.replace(/-/g, "")} - ${cityName ?? "Trip"}`;

/**
 * Shown above the asset grid in trip (date-range) mode. Lets the user widen or
 * narrow a detected trip, and turn the "only the trip's city" filter on/off,
 * without editing the URL. Keeps the suggested album name in step.
 */
export default function TripRangeBar() {
  const router = useRouter();
  const { config, updateContext } = usePhotoSelectionContext();
  const { startDate, endDate, tripCity, tripCityName } = config;

  if (!startDate || !endDate) return null;

  const apply = (nextStart: string, nextEnd: string) => {
    if (!nextStart || !nextEnd) return;
    // Keep the range valid: if the ends cross, collapse to the edited day.
    if (nextStart > nextEnd) {
      if (nextStart !== startDate) nextEnd = nextStart;
      else nextStart = nextEnd;
    }
    updateContext({
      config: {
        startDate: nextStart,
        endDate: nextEnd,
        suggestedAlbumName: tripAlbumName(nextStart, tripCityName),
      },
    });
    router.replace(
      { pathname: router.pathname, query: { startDate: nextStart, endDate: nextEnd } },
      undefined,
      { shallow: true }
    );
  };

  const dateControl = (
    label: string,
    value: string,
    onChange: (v: string) => void
  ) => (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground w-9">{label}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        title={`${label} one day earlier`}
        onClick={() => onChange(shift(value, -1))}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <Input
        type="date"
        className="h-8 w-[150px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        title={`${label} one day later`}
        onClick={() => onChange(shift(value, 1))}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 border-b bg-background sticky top-0 z-10">
      {dateControl("Start", startDate, (v) => apply(v, endDate))}
      {dateControl("End", endDate, (v) => apply(startDate, v))}
      {tripCityName ? (
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <Checkbox
            checked={!!tripCity}
            onCheckedChange={(checked) =>
              updateContext({ config: { tripCity: checked ? tripCityName : null } })
            }
          />
          Only {tripCityName} photos
        </label>
      ) : null}
    </div>
  );
}
