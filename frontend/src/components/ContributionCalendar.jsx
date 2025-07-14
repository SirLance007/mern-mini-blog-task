import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Map activity level to theme color
const getColor = (level = 0, hasPosts = false) => {
  // If user posted on this day, show orange regardless of activity level
  if (hasPosts) {
    return '#ff6b35'; // Bright orange for posting days
  }
  
  switch (level) {
    case 1: return 'var(--primary)';
    case 2: return 'var(--chart-2)';
    case 3: return 'var(--chart-4)';
    case 4: return 'var(--chart-5)';
    default: return 'var(--card-foreground)';
  }
};

// Add this helper function near the top:
const getCellColorClass = (posts) => {
  if (posts > 0) return 'bg-orange-500'; // Orange for post days
  return 'bg-gray-100'; // Default for no posts
};

// Get the start date for year, month, or week view
function getStartDate(view, today) {
  if (view === 'year') {
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - (dayOfWeek + 364));
    start.setHours(0, 0, 0, 0);
    return start;
  } else if (view === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    return start;
  } else if (view === 'week') {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
  }
}

// Create a map of all days in the year with post information
const createYearDayMap = (calendarData) => {
  const yearMap = new Map();
  
  // Initialize all days of the year (366 for leap year)
  const startDate = new Date(new Date().getFullYear(), 0, 1); // January 1st
  for (let i = 0; i < 366; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    yearMap.set(dateStr, { 
      date: date,
      dateStr: dateStr,
      posts: 0,
      likes: 0,
      comments: 0,
      activity: 0,
      level: 0,
      hasPosts: false
    });
  }
  
  // Fill in the actual data from calendarData
  if (calendarData && Array.isArray(calendarData)) {
    calendarData.forEach((day, index) => {
      if (yearMap.has(day.date)) {
        const existing = yearMap.get(day.date);
        const posts = day.posts || 0;
        const hasPosts = posts > 0;
        
        yearMap.set(day.date, {
          ...existing,
          posts: posts,
          likes: day.likes || 0,
          comments: day.comments || 0,
          activity: day.activity || 0,
          level: day.level || 0,
          hasPosts: hasPosts
        });
      }
    });
  }
  
  return yearMap;
};

const ContributionCalendar = ({ data, view = 'year', selectedDate = new Date() }) => {
  // Create the year day map
  const yearDayMap = useMemo(() => {
    const map = createYearDayMap(data?.calendarData);
    
    return map;
  }, [data]);

  const today = new Date();
  const startDate = getStartDate(view, selectedDate);
  let weeks = [];
  let monthLabels = [];

  if (view === 'year') {
    // Build 52 weeks x 7 days grid
    for (let w = 0; w < 52; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w * 7 + d);
        const dateStr = date.toISOString().split('T')[0];
        
        // Get day data from our year map
        const dayData = yearDayMap.get(dateStr) || {
          date: date,
          dateStr: dateStr,
          posts: 0,
          likes: 0,
          comments: 0,
          activity: 0,
          level: 0,
          hasPosts: false
        };
        
        week.push({
          date,
          dateStr,
          activity: dayData.activity,
          level: dayData.level,
          posts: dayData.posts,
          likes: dayData.likes,
          comments: dayData.comments,
          hasPosts: dayData.hasPosts
        });
      }
      weeks.push(week);
    }
    // Month labels (show at first week of each month)
    let lastMonth = null;
    for (let w = 0; w < weeks.length; w++) {
      const firstDay = weeks[w][0].date;
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ week: w, label: MONTHS[month] });
        lastMonth = month;
      }
    }
  } else if (view === 'month') {
    // Build 6 weeks x 7 days grid for the month
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let dayCounter = 1 - firstDayOfWeek;
    for (let w = 0; w < 6; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(year, month, dayCounter);
        const dateStr = date.toISOString().split('T')[0];
        
        // Get day data from our year map
        const dayData = yearDayMap.get(dateStr) || {
          date: date,
          dateStr: dateStr,
          posts: 0,
          likes: 0,
          comments: 0,
          activity: 0,
          level: 0,
          hasPosts: false
        };
        
        week.push({
          date,
          dateStr,
          activity: dayData.activity,
          level: dayData.level,
          posts: dayData.posts,
          likes: dayData.likes,
          comments: dayData.comments,
          hasPosts: dayData.hasPosts,
          inMonth: date.getMonth() === month
        });
        dayCounter++;
      }
      weeks.push(week);
    }
    monthLabels = [{ week: 0, label: MONTHS[month] }];
  } else if (view === 'week') {
    // Build 1 week x 7 days grid
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + d);
      const dateStr = date.toISOString().split('T')[0];
      
      // Get day data from our year map
      const dayData = yearDayMap.get(dateStr) || {
        date: date,
        dateStr: dateStr,
        posts: 0,
        likes: 0,
        comments: 0,
        activity: 0,
        level: 0,
        hasPosts: false
      };
      
      week.push({
        date,
        dateStr,
        activity: dayData.activity,
        level: dayData.level,
        posts: dayData.posts,
        likes: dayData.likes,
        comments: dayData.comments,
        hasPosts: dayData.hasPosts
      });
    }
    weeks = [week];
    monthLabels = [{ week: 0, label: MONTHS[startDate.getMonth()] }];
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="w-full max-w-5xl mx-auto p-2 sm:p-4 md:p-6 rounded-2xl shadow-2xl border border-[var(--border)] bg-[var(--card)] backdrop-blur-lg"
      style={{ minHeight: 220 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex items-center gap-2 text-base sm:text-xl font-semibold text-[var(--primary)]">
          <span>{data?.totalContributions || 0}</span>
          <span className="text-[var(--card-foreground)] font-normal">posts in the past year</span>
          <span className="ml-1 text-xs" title="How is this calculated?">🛈</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-[var(--muted-foreground)]">
          <span>Total active days: <span className="text-[var(--primary)] font-semibold">{data?.calendarData?.filter(d => d.activity > 0).length || 0}</span></span>
          <span>Max streak: <span className="text-[var(--primary)] font-semibold">{data?.longestStreak || 0}</span></span>
          {/* View filter dropdown */}
          <span className="ml-2">
            <select
              className="px-2 py-1 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)] shadow hover:bg-[var(--primary)] hover:text-white transition-all"
              value={view}
              onChange={e => data?.onViewChange?.(e.target.value)}
            >
              <option value="year">Year</option>
              <option value="month">Month</option>
              <option value="week">Week</option>
            </select>
          </span>
        </div>
      </div>
      {/* Calendar grid */}
      <div className="flex flex-row items-start overflow-x-auto scrollbar-hide pb-2 w-full max-w-full touch-pan-x">
        {/* Day labels (vertical) */}
        <div className="flex flex-col justify-end mr-1 sm:mr-2">
          {DAYS.map((d, i) => (
            <div key={d} className={`h-6 sm:h-5 text-xs text-[var(--muted-foreground)] ${i % 2 === 0 ? '' : 'opacity-60'}`}>{d[0]}</div>
          ))}
        </div>
        {/* Weeks grid with gap */}
        <div className="flex-1 min-w-[320px] sm:min-w-[420px] md:min-w-[600px] lg:min-w-[800px]">
          <div className="flex gap-1">
            {/* Month labels */}
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col items-center gap-1">
                {/* Month label */}
                {monthLabels.find(m => m.week === wIdx) ? (
                  <div className="mb-1 text-xs text-[var(--muted-foreground)] font-medium">{monthLabels.find(m => m.week === wIdx).label}</div>
                ) : (
                  <div className="mb-1 h-4" />
                )}
                {/* Days with gap */}
                {week.map((day, dIdx) => {
                  const isToday = day.date.toDateString() === today.toDateString();
                  const hasPosts = day.hasPosts;
                  const backgroundColor = getColor(day.level, hasPosts);
                  return (
                    <motion.div
                      key={dIdx}
                      className={`w-7 h-7 sm:w-5 sm:h-5 rounded-[6px] mb-0.5 cursor-pointer border border-transparent relative group transition-all flex items-center justify-center ${getCellColorClass(day.posts)}`}
                      style={{
                        ...(day.posts > 0 ? { zIndex: 99999 } : {}),
                        backgroundColor: hasPosts ? '#ff6b35' : backgroundColor,
                        boxShadow: isToday ? '0 0 0 2px var(--primary)' : hasPosts ? '0 0 0 4px #ff6b35, 0 0 20px rgba(255, 107, 53, 0.8)' : undefined,
                        borderColor: isToday ? 'var(--primary)' : hasPosts ? '#ff6b35' : 'transparent',
                        opacity: day.level === 0 ? 0.25 : 1,
                        transition: 'background 0.2s, box-shadow 0.2s',
                        position: 'relative',
                        transform: hasPosts ? 'scale(1.1)' : 'scale(1)',
                      }}
                      data-date={day.dateStr}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: hasPosts ? 1.1 : 1, opacity: 1 }}
                      transition={{ delay: (wIdx * 7 + dIdx) * 0.005 }}
                    >
                      {/* Bright orange overlay for post days */}
                      {hasPosts && (
                        <span 
                          className="absolute inset-0 rounded-[6px] opacity-100" 
                          style={{ 
                            backgroundColor: '#ff6b35', 
                            zIndex: 99999,
                            boxShadow: '0 0 10px rgba(255, 107, 53, 0.8)'
                          }}
                        />
                      )}
                      {/* Green dot for post days */}
                      {hasPosts && (
                        <span 
                          className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-green-400 border-2 border-white shadow-lg" 
                          style={{ zIndex: 999999 }}
                        />
                      )}
                      {/* Tooltip */}
                      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block">
                        <div className="px-3 py-2 rounded-lg shadow-lg border border-[var(--border)] bg-[var(--popover)] text-xs text-[var(--popover-foreground)]">
                          <div className="font-semibold text-[var(--primary)]">{day.activity} contributions</div>
                          <div>{day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div className="mt-1 text-[var(--muted-foreground)]">📝 {day.posts} • ❤️ {day.likes} • 💬 {day.comments}</div>
                          {hasPosts && <div className="mt-1 text-orange-500 font-bold">📝 POSTED - ORANGE CELL</div>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContributionCalendar; 