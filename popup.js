document.getElementById('exportBtn').addEventListener('click', async () => {
  const startDateInput = document.getElementById('startDate').value;
  const endDateInput = document.getElementById('endDate').value;
  const statusDiv = document.getElementById('status');

  if (!startDateInput || !endDateInput) {
    statusDiv.textContent = "Please select both start and end dates.";
    return;
  }

  statusDiv.textContent = "Scanning schedule...";

  // Get the current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Inject script to scrape data
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: scrapeScheduleFromPage // We define the function below to inject
  }, (results) => {
    if (chrome.runtime.lastError || !results || !results[0]) {
      statusDiv.textContent = "Error: Could not read page. Make sure you are on the schedule tab.";
      return;
    }

    const classes = results[0].result;
    if (classes.length === 0) {
      statusDiv.textContent = "No classes found. Ensure the calendar is visible.";
      return;
    }

    const icsContent = generateICS(classes, startDateInput, endDateInput);
    downloadICS(icsContent);
    statusDiv.textContent = `Success! Exported ${classes.length} classes.`;
  });
});

// This function mirrors the logic in content.js but is defined here 
// so it can be passed to executeScript easily without external file loading issues.
function scrapeScheduleFromPage() {
  const events = document.querySelectorAll('.k-event');
  const classData = [];
  const seenIds = new Set();

  events.forEach(evt => {
    const ariaLabel = evt.getAttribute('aria-label');
    if (!ariaLabel) return;

    // Regex to match "on Monday," and "at 11:00 AM to 11:50 AM"
    const dayMatch = ariaLabel.match(/on\s(\w+),/);
    const timeMatch = ariaLabel.match(/at\s(\d{1,2}:\d{2}\s[AP]M)\sto\s(\d{1,2}:\d{2}\s[AP]M)/);
    const infoPart = ariaLabel.split(' on ')[0];

    if (dayMatch && timeMatch && infoPart) {
      const uniqueKey = infoPart + dayMatch[1] + timeMatch[1];
      if (!seenIds.has(uniqueKey)) {
        seenIds.add(uniqueKey);
        classData.push({
          title: infoPart,
          dayOfWeek: dayMatch[1],
          startTime: timeMatch[1],
          endTime: timeMatch[2]
        });
      }
    }
  });
  return classData;
}

// --- ICS Generation Logic ---

function generateICS(classes, semStart, semEnd) {
  let ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//USC Schedule//EN\r\n";
  const semEndDateFormatted = semEnd.replace(/-/g, '') + 'T235959'; // Format YYYYMMDD

  classes.forEach(cls => {
    // 1. Calculate the first occurrence of this class relative to Semester Start
    const firstDate = getFirstOccurrence(semStart, cls.dayOfWeek);
    
    // 2. Combine Date and Time
    const dtStart = formatDateTime(firstDate, cls.startTime);
    const dtEnd = formatDateTime(firstDate, cls.endTime);

    // 3. Create Event Block
    ics += "BEGIN:VEVENT\r\n";
    ics += `SUMMARY:${cls.title}\r\n`;
    ics += `DTSTART:${dtStart}\r\n`;
    ics += `DTEND:${dtEnd}\r\n`;
    // RRULE: Repeat Weekly until Semester End
    ics += `RRULE:FREQ=WEEKLY;UNTIL=${semEndDateFormatted}Z\r\n`; 
    ics += "END:VEVENT\r\n";
  });

  ics += "END:VCALENDAR";
  return ics;
}

function getFirstOccurrence(startDateStr, targetDayName) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDayIndex = days.indexOf(targetDayName);
  const start = new Date(startDateStr + 'T00:00:00'); // Append time to avoid UTC shift issues
  
  const currentDayIndex = start.getDay();
  let daysToAdd = targetDayIndex - currentDayIndex;
  
  if (daysToAdd < 0) {
    daysToAdd += 7;
  }
  
  const resultDate = new Date(start);
  resultDate.setDate(start.getDate() + daysToAdd);
  return resultDate;
}

function formatDateTime(dateObj, timeStr) {
  // Convert "11:00 AM" to 24h format HHMMSS
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
  
  // Pad single digits
  hours = hours.toString().padStart(2, '0');
  
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}00`;
}

function downloadICS(content) {
  const blob = new Blob([content], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'USC_Schedule.ics';
  a.click();
  URL.revokeObjectURL(url);
}