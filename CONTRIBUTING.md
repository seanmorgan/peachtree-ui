# Contributing

First off, thank you for your interest in improving the Peachtree Road Race Weather Archive!

Whether you've found a typo, spotted an incorrect weather record, or have an idea for a new feature, contributions are welcome.

## Ways to Contribute

Some great ways to help include:

* Reporting incorrect or missing weather data
* Fixing bugs
* Improving accessibility
* Improving documentation
* Adding tests
* Suggesting new features or visualizations
* Cleaning up code or refactoring where appropriate

If you're unsure whether something belongs, feel free to open an issue first.

## Reporting Data Issues

Historical weather data is sourced from Weather Underground using the automated collection script in this repository.

If you believe a particular year's weather is incorrect, please include:

* The year (or race date)
* What appears to be incorrect
* A reference or source if available

## Development

Clone the repository:

```bash
git clone https://github.com/seanmorgan/peachtree-ui.git
cd peachtree-ui
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
python -m playwright install chromium
```

To update a single year:

```bash
python scripts/update_data.py --year 2025
```

To update a range of years:

```bash
python scripts/update_data.py --start-year 1982 --end-year 2025
```

## Pull Requests

Please try to keep pull requests focused on a single change.

Before submitting:

* Ensure the project builds successfully.
* Verify generated weather data is accurate.
* Update documentation if needed.
* Keep commit messages descriptive.

## Code Style

This project intentionally favors:

* Readable code over clever code
* Small, focused functions
* Clear variable names
* Minimal dependencies whenever practical

## Questions or Ideas

Feature ideas and discussions are always welcome. If you're not sure how to implement something, opening an issue is a great place to start.

Thanks for helping preserve the history of one of Atlanta's most iconic running events!
