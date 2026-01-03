// This function will be executed by the popup
function scrapeSchedule() {
  const events = document.querySelectorAll('.k-event');
  const classData = [];

  // Helper to remove duplicates (Web Reg sometimes renders the same event twice)
  const seenIds = new Set();

  events.forEach(evt => {
    // We rely on the aria-label as it contains the most complete text data
    // Format usually: "COURSE (ID), Type, Prof on Day, Date at StartTime to EndTime"
    const ariaLabel = evt.getAttribute('aria-label');
    
    if (!ariaLabel) return;

    // Use Regex to parse the Aria Label
    // Looks for patterns like "on Monday," and "at 11:00 AM to 11:50 AM"
    const dayMatch = ariaLabel.match(/on\s(\w+),/);
    const timeMatch = ariaLabel.match(/at\s(\d{1,2}:\d{2}\s[AP]M)\sto\s(\d{1,2}:\d{2}\s[AP]M)/);
    
    // Extract info part (everything before " on ")
    const infoPart = ariaLabel.split(' on ')[0];

    if (dayMatch && timeMatch && infoPart) {
      const uniqueKey = infoPart + dayMatch[1] + timeMatch[1]; // Create a unique ID for deduping
      
      if (!seenIds.has(uniqueKey)) {
        seenIds.add(uniqueKey);
        classData.push({
          title: infoPart, // "GESM-120 (35319), Lecture, Van Cleve, James"
          dayOfWeek: dayMatch[1], // "Monday"
          startTime: timeMatch[1], // "11:00 AM"
          endTime: timeMatch[2]    // "11:50 AM"
        });
      }
    }
  });

  return classData;
}