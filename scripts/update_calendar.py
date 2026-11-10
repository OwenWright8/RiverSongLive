#!/usr/bin/env python3
"""Copy Riversong's booked nights from the public Google Calendar into data/booked.json.

Run by .github/workflows/update-calendar.yml every hour. Uses only the Python standard library.
Only dates are saved. Event titles and descriptions (which may contain guest names) are never read.

An all-day event from Nov 12 to Nov 15 (Google stores the end as the day after the last day)
marks the nights of Nov 12, 13 and 14 as booked. Nov 15 stays open for a new check-in.
"""
import json
import os
import sys
import urllib.request
from datetime import date, datetime, timedelta, timezone

CALENDAR_ID = "fa92ef585308d38598ec9247db6c36286b2b988dec54ab9884c0242b826e9d92@group.calendar.google.com"
FEED = "https://calendar.google.com/calendar/ical/" + CALENDAR_ID.replace("@", "%40") + "/public/basic.ics"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "booked.json")
EASTERN = timezone(timedelta(hours=-5))  # close enough for turning the rare timed event into a date


def unfold(text):
    """Join iCalendar continuation lines (lines that start with a space)."""
    lines = []
    for raw in text.splitlines():
        if raw.startswith((" ", "\t")) and lines:
            lines[-1] += raw[1:]
        else:
            lines.append(raw)
    return lines


def parse_when(prop, value):
    """Return (date, is_all_day) for a DTSTART/DTEND property."""
    if "VALUE=DATE" in prop and "VALUE=DATE-TIME" not in prop:
        return datetime.strptime(value[:8], "%Y%m%d").date(), True
    if value.endswith("Z"):
        dt = datetime.strptime(value, "%Y%m%dT%H%M%SZ").replace(tzinfo=timezone.utc).astimezone(EASTERN)
    else:
        dt = datetime.strptime(value[:15], "%Y%m%dT%H%M%S")
    return dt, False


def booked_nights(ics_text):
    nights = set()
    event = None
    for line in unfold(ics_text):
        if line == "BEGIN:VEVENT":
            event = {}
        elif line == "END:VEVENT" and event is not None:
            start, end, cancelled = event.get("start"), event.get("end"), event.get("cancelled")
            event = None
            if not start or cancelled:
                continue
            (s, all_day) = start
            e = end[0] if end else None
            if all_day:
                last = (e - timedelta(days=1)) if e else s
            else:
                # Timed events: only count ones that last at least a day (short ones are reminders).
                if not e or (e - s) < timedelta(hours=20):
                    continue
                s, last = s.date(), (e - timedelta(seconds=1)).date()
            d = s
            while d <= last:
                nights.add(d)
                d += timedelta(days=1)
        elif event is not None and ":" in line:
            prop, value = line.split(":", 1)
            name = prop.split(";", 1)[0]
            if name == "DTSTART":
                event["start"] = parse_when(prop, value.strip())
            elif name == "DTEND":
                event["end"] = parse_when(prop, value.strip())
            elif name == "STATUS" and value.strip() == "CANCELLED":
                event["cancelled"] = True
    return nights


def main():
    with urllib.request.urlopen(FEED, timeout=30) as r:
        ics = r.read().decode("utf-8", "replace")
    if "BEGIN:VCALENDAR" not in ics:
        sys.exit("Feed did not look like a calendar; leaving data/booked.json unchanged.")
    cutoff = date.today() - timedelta(days=62)
    nights = sorted(d.isoformat() for d in booked_nights(ics) if d >= cutoff)
    new = {"nights": nights}

    try:
        with open(OUT) as f:
            old = json.load(f)
    except (OSError, ValueError):
        old = {}
    if old.get("nights") == nights:
        print("No change in booked dates.")
        return
    new["updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(new, f, indent=1)
        f.write("\n")
    print("Saved %d booked nights." % len(nights))


if __name__ == "__main__":
    main()
