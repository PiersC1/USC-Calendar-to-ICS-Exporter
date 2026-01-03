# USC Web Registration Schedule Exporter

A simple Chrome Extension that scrapes your class schedule from the USC Web Registration portal and exports it as an `.ics` file. This file can be imported into Google Calendar, Apple Calendar, Outlook, and others.

## Features

* **One-Click Export:** Instantly parses the "myCalendar" view on Web Registration.
* **Custom Date Ranges:** You define the semester start and end dates.
* **Smart Parsing:** Automatically detects class names, types (Lecture/Lab), professors, and times.
* **Privacy First:** All processing happens locally in your browser. No data is sent to external servers.

## Installation

Since this is a custom tool, you will install it as an "Unpacked Extension" in Chrome:

1.  Clone or download this repository to your computer.
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Toggle **Developer mode** in the top right corner.
4.  Click the **Load unpacked** button.
5.  Select the folder where you saved these files.
6.  The extension icon (the SC logo, though a bit misshapen) should appear in your toolbar.

## Usage

1.  Log in to [USC Web Registration](https://webreg.usc.edu).
2.  Navigate to the **myCalendar** tab so your schedule is visible on the screen.
3.  Click the extension icon in your Chrome toolbar.
4.  Enter the **First Day of Classes** and **Last Day of Classes** for the current semester.
5.  Click **Download Schedule**.
6.  Open the downloaded `.ics` file to add the events to your preferred calendar app.

## File Structure

* `manifest.json` - Configuration file required by Chrome.
* `popup.html` - The user interface for entering dates.
* `popup.js` - Logic for the popup and initiating the scrape.

## Disclaimer

This tool is not officially affiliated with the University of Southern California. It is a utility script intended to simplify personal calendar management. Use at your own risk.