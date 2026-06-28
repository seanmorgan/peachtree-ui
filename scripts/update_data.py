#!/usr/bin/env python3
"""
Scrape specified Peachtree Road Race weather year(s) from Weather Underground
and update/create records in peachtree-start-conditions.csv.

Examples:
  python3 update_peachtree_start_conditions.py --year 2025

  python3 update_peachtree_start_conditions.py --year 2021

  python3 update_peachtree_start_conditions.py --start-year 1982 --end-year 2025

  python3 update_peachtree_start_conditions.py --year 2026 \
    --csv peachtree-start-conditions.csv

Install:
  python -m pip install playwright pandas
  python -m playwright install chromium
"""

import argparse
import re
import time
from datetime import datetime
from pathlib import Path

import pandas as pd
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError


STATION = "KFTY"
BASE_URL = "https://www.wunderground.com/history/daily/us/ga/atlanta/{station}/date/{date}"

DEFAULT_CSV = "public/peachtree-start-conditions.csv"
DEFAULT_TARGET_TIME = "7:00 AM"

PAGE_WAIT_SECONDS = 4
BETWEEN_REQUESTS_SECONDS = 2

RACE_DATES_BY_YEAR = {
    2021: ["2021-07-03", "2021-07-04"],
}

EXPECTED_COLUMNS = [
    "Time",
    "Temperature",
    "Dew Point",
    "Humidity",
    "Wind",
    "Wind Speed",
    "Wind Gust",
    "Pressure",
    "Precip.",
    "Condition",
]

OUTPUT_COLUMNS = [
    "year",
    "subYear",
    "date",
    "time",
    "targetTime",
    "minutesFromTarget",
    "tempF",
    "dewPointF",
    "humidityPct",
    "heatIndexF",
    "runnerStressScore",
    "wind",
    "windSpeedMph",
    "windGustMph",
    "pressureIn",
    "precipIn",
    "condition",
    "sourceUrl",
]


def race_dates_for_year(year: int):
    return RACE_DATES_BY_YEAR.get(year, [f"{year}-07-04"])


def clean_cell(value: str) -> str:
    value = re.sub(r"\s+", " ", value or "").strip()
    value = value.replace("\u00a0", " ")
    return value


def parse_number(value):
    if pd.isna(value):
        return None
    match = re.search(r"-?\d+(?:\.\d+)?", str(value).replace(",", ""))
    return float(match.group(0)) if match else None


def parse_time_to_minutes(value):
    if pd.isna(value):
        return None

    if hasattr(value, "hour") and hasattr(value, "minute"):
        return int(value.hour) * 60 + int(value.minute)

    text = str(value).strip().replace("\xa0", " ")
    text = re.sub(r"\s+", " ", text)

    for fmt in ("%I:%M %p", "%H:%M"):
        try:
            parsed = pd.to_datetime(text, format=fmt)
            return int(parsed.hour) * 60 + int(parsed.minute)
        except Exception:
            pass

    parsed = pd.to_datetime(text, errors="coerce")
    if pd.isna(parsed):
        return None

    return int(parsed.hour) * 60 + int(parsed.minute)


def minutes_to_hhmm(minutes):
    if minutes is None or pd.isna(minutes):
        return ""

    minutes = int(minutes)
    hour = minutes // 60
    minute = minutes % 60
    suffix = "AM" if hour < 12 else "PM"
    display_hour = hour % 12 or 12

    return f"{display_hour}:{minute:02d} {suffix}"


def heat_index_f(temp_f, rh):
    if temp_f is None or rh is None or pd.isna(temp_f) or pd.isna(rh):
        return None

    temp_f = float(temp_f)
    rh = float(rh)

    if temp_f < 80:
        return round(temp_f, 1)

    hi = (
        -42.379
        + 2.04901523 * temp_f
        + 10.14333127 * rh
        - 0.22475541 * temp_f * rh
        - 0.00683783 * temp_f * temp_f
        - 0.05481717 * rh * rh
        + 0.00122874 * temp_f * temp_f * rh
        + 0.00085282 * temp_f * rh * rh
        - 0.00000199 * temp_f * temp_f * rh * rh
    )

    return round(hi, 1)


def scrape_race_date(page, year: int, race_date: str):
    url = BASE_URL.format(station=STATION, date=race_date)
    print(f"Scraping {year} / {race_date}: {url}")

    page.goto(url, wait_until="domcontentloaded", timeout=60000)
    time.sleep(PAGE_WAIT_SECONDS)

    tables = page.locator("table").all()
    rows = []

    for table in tables:
        text = clean_cell(table.inner_text(timeout=5000))

        if not all(x in text for x in ["Time", "Temperature", "Dew Point"]):
            continue

        trs = table.locator("tr").all()

        for tr in trs:
            cells = [
                clean_cell(c.inner_text(timeout=3000))
                for c in tr.locator("th,td").all()
            ]

            if len(cells) >= 8 and re.match(r"^\d{1,2}:\d{2}\s*[AP]M$", cells[0], re.I):
                rows.append(cells)

    records = []

    for cells in rows:
        cells = cells[:10] + [""] * max(0, 10 - len(cells))
        rec = dict(zip(EXPECTED_COLUMNS, cells[:10]))
        rec["Year"] = year
        rec["Date"] = race_date
        rec["Source URL"] = url
        records.append(rec)

    if not records:
        print(f"  WARNING: no rows found for {race_date}")
    else:
        print(f"  {len(records)} rows")

    return records


def records_to_start_conditions(records, target_time):
    if not records:
        return pd.DataFrame(columns=OUTPUT_COLUMNS)

    target_minutes = parse_time_to_minutes(target_time)

    if target_minutes is None:
        raise ValueError(f"Could not parse target time: {target_time}")

    df = pd.DataFrame(records)

    work = pd.DataFrame()
    work["year"] = df["Year"].astype(int)
    work["date"] = df["Date"].astype(str)
    work["rawTime"] = df["Time"]
    work["minutesAfterMidnight"] = df["Time"].apply(parse_time_to_minutes)
    work["minutesFromTarget"] = (work["minutesAfterMidnight"] - target_minutes).abs()

    work["tempF"] = df["Temperature"].apply(parse_number)
    work["dewPointF"] = df["Dew Point"].apply(parse_number)
    work["humidityPct"] = df["Humidity"].apply(parse_number)
    work["wind"] = df["Wind"].astype(str).str.strip()
    work["windSpeedMph"] = df["Wind Speed"].apply(parse_number)
    work["windGustMph"] = df["Wind Gust"].apply(parse_number)
    work["pressureIn"] = df["Pressure"].apply(parse_number)
    work["precipIn"] = df["Precip."].apply(parse_number)
    work["condition"] = df["Condition"].astype(str).str.strip()
    work["sourceUrl"] = df["Source URL"].astype(str).str.strip()

    valid = work[
        work["minutesAfterMidnight"].notna()
        & work["tempF"].between(30, 110)
        & work["dewPointF"].between(0, 90)
        & work["humidityPct"].between(1, 100)
    ].copy()

    if valid.empty:
        return pd.DataFrame(columns=OUTPUT_COLUMNS)

    start = (
        valid.sort_values(["year", "date", "minutesFromTarget", "minutesAfterMidnight"])
        .groupby(["year", "date"], as_index=False)
        .first()
        .sort_values(["year", "date"])
    )

    start["subYear"] = ""
    start["time"] = start["minutesAfterMidnight"].apply(minutes_to_hhmm)
    start["targetTime"] = minutes_to_hhmm(target_minutes)
    start["heatIndexF"] = [
        heat_index_f(t, rh) for t, rh in zip(start["tempF"], start["humidityPct"])
    ]
    start["runnerStressScore"] = (
        start["tempF"].astype(float) + start["dewPointF"].astype(float) * 1.5
    ).round(1)

    return start[OUTPUT_COLUMNS]


def assign_sub_years(df):
    df = df.copy()
    df["subYear"] = ""

    for year, group in df.groupby("year"):
        dates = sorted(group["date"].dropna().unique())

        if len(dates) <= 1:
            continue

        labels = {
            date: f"{int(year)}{chr(ord('a') + index)}"
            for index, date in enumerate(dates)
        }

        mask = df["year"].eq(year)
        df.loc[mask, "subYear"] = df.loc[mask, "date"].map(labels)

    return df


def upsert_csv(new_rows: pd.DataFrame, csv_path: Path):
    if csv_path.exists():
        existing = pd.read_csv(csv_path)
    else:
        existing = pd.DataFrame(columns=OUTPUT_COLUMNS)

    for col in OUTPUT_COLUMNS:
        if col not in existing.columns:
            existing[col] = ""

    existing = existing[OUTPUT_COLUMNS].copy()

    if new_rows.empty:
        print("No new valid rows to update.")
        return existing

    existing["year"] = existing["year"].astype(int)
    existing["date"] = existing["date"].astype(str)

    new_rows["year"] = new_rows["year"].astype(int)
    new_rows["date"] = new_rows["date"].astype(str)

    existing_key = existing["year"].astype(str) + "|" + existing["date"]
    new_key = new_rows["year"].astype(str) + "|" + new_rows["date"]

    updated = existing.loc[~existing_key.isin(set(new_key))].copy()
    updated = pd.concat([updated, new_rows], ignore_index=True)

    updated = updated.sort_values(["year", "date"]).reset_index(drop=True)
    updated = assign_sub_years(updated)

    updated[OUTPUT_COLUMNS].to_csv(csv_path, index=False)

    return updated


def parse_args():
    parser = argparse.ArgumentParser(
        description="Scrape Wunderground race-start weather and upsert peachtree-start-conditions.csv."
    )

    parser.add_argument(
        "--year",
        type=int,
        help="Scrape a single year, e.g. --year 2025. For 2021, scrapes 7/3 and 7/4.",
    )
    parser.add_argument(
        "--start-year",
        type=int,
        help="First year to scrape when --year is not supplied.",
    )
    parser.add_argument(
        "--end-year",
        type=int,
        help="Last year to scrape when --year is not supplied.",
    )
    parser.add_argument(
        "--csv",
        default=DEFAULT_CSV,
        help=f"Master CSV path. Default: {DEFAULT_CSV}",
    )
    parser.add_argument(
        "--target-time",
        default=DEFAULT_TARGET_TIME,
        help=f'Race start proxy time. Default: "{DEFAULT_TARGET_TIME}".',
    )

    return parser.parse_args()


def main():
    args = parse_args()

    if args.year is not None:
        years = [args.year]
    else:
        if args.start_year is None or args.end_year is None:
            raise ValueError("Use either --year or both --start-year and --end-year.")

        if args.start_year > args.end_year:
            raise ValueError("--start-year must be <= --end-year.")

        years = list(range(args.start_year, args.end_year + 1))

    csv_path = Path(args.csv)

    print(
        f"Years to scrape: {years[0]}-{years[-1]}"
        if len(years) > 1
        else f"Year to scrape: {years[0]}"
    )
    print(f"CSV: {csv_path}")
    print(f"Target time: {args.target_time}")

    all_records = []
    failures = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        context = browser.new_context(
            viewport={"width": 1400, "height": 1000},
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36"
            ),
        )

        page = context.new_page()

        for year in years:
            for race_date in race_dates_for_year(year):
                try:
                    records = scrape_race_date(page, year, race_date)

                    if records:
                        all_records.extend(records)
                    else:
                        failures.append(race_date)

                except PlaywrightTimeoutError:
                    print(f"  TIMEOUT: {race_date}")
                    failures.append(race_date)

                except Exception as e:
                    print(f"  ERROR {race_date}: {e}")
                    failures.append(race_date)

                time.sleep(BETWEEN_REQUESTS_SECONDS)

        browser.close()

    new_rows = records_to_start_conditions(all_records, args.target_time)

    updated = upsert_csv(new_rows, csv_path)

    print(f"\nWrote: {csv_path}")
    print(f"Scraped race dates: {len(new_rows)}")
    print(f"Total CSV rows: {len(updated)}")

    if failures:
        print(f"Failures: {failures}")


if __name__ == "__main__":
    main()
