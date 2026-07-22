(function () {
  const form = document.querySelector('form');
  const resultCards = document.querySelectorAll(
    '#compound-summary, #stack-summary, #injection-plan, #monthly-calendar, #vial-duration'
  );
  const compoundCardsContainer = document.getElementById('compound-cards');
  const compoundSummaryList = document.getElementById('compound-summary-list');
  const injectionPlanCards = document.getElementById('injection-plan-cards');
  const monthlyCalendarCards = document.getElementById('monthly-calendar-cards');
  const vialDurationCards = document.getElementById('vial-duration-cards');
  const calendarModal = document.getElementById('calendar-modal');
  const calendarModalBackdrop = document.getElementById('calendar-modal-backdrop');
  const calendarModalClose = document.getElementById('calendar-modal-close');
  const calendarModalTitle = document.getElementById('calendar-modal-title');
  const calendarModalDate = document.getElementById('calendar-modal-date');
  const calendarModalBody = document.getElementById('calendar-modal-body');
  const calendarModalCompleted = document.getElementById('calendar-modal-completed');
  const calendarModalStatusLabel = document.getElementById('calendar-modal-status-label');
  const calendarTooltip = document.getElementById('calendar-tooltip');
  const addCompoundButton = document.getElementById('add-compound');
  const frequencySelect = document.getElementById('injection-frequency');
  const startDateInput = document.getElementById('start-date');
  const cycleNameSelect = document.getElementById('cycle-name');
  const cycleLengthSelect = document.getElementById('cycle-length');
  const protocolGoalSelect = document.getElementById('protocol-goal');
  const cycleNameCustomField = document.getElementById('cycle-name-custom-field');
  const cycleLengthCustomField = document.getElementById('cycle-length-custom-field');
  const goalCustomField = document.getElementById('goal-custom-field');
  const athleteSummaryFields = {
    athleteName: document.getElementById('summary-athlete-name'),
    coachName: document.getElementById('summary-coach-name'),
    goal: document.getElementById('summary-goal'),
    cycleLength: document.getElementById('summary-cycle-length'),
    startDate: document.getElementById('summary-start-date'),
    expectedFinish: document.getElementById('summary-expected-finish'),
  };

  const ROTATION_SITES = [
    'Left Ventroglute',
    'Right Ventroglute',
    'Left Glute',
    'Right Glute',
    'Left Delt',
    'Right Delt',
    'Left Quad',
    'Right Quad',
  ];

  const DAY_IDS_BY_JS_DAY = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  const CALENDAR_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const completedInjections = {};
  let activeModalDateKey = null;
  let calendarPlanData = null;
  let calendarViewYear = null;
  let calendarViewMonth = null;

  const MAX_COMPOUNDS = 10;
  let compoundCount = 1;

  const REMOVE_BUTTON_STYLE =
    'width: 100%; padding: 0.75rem 1rem; font-family: inherit; font-size: 0.875rem; font-weight: 600; color: #ffffff; background: #c0392b; border: none; border-radius: 10px; cursor: pointer;';

  const DAYS = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
  ];

  const DEFAULT_DAYS_BY_FREQUENCY = {
    weekly: ['monday'],
    'twice-weekly': ['monday', 'thursday'],
    'three-times-weekly': ['monday', 'wednesday', 'friday'],
    eod: ['monday', 'wednesday', 'friday', 'sunday'],
    daily: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  };

  const INJECTIONS_PER_WEEK = {
    daily: 7,
    eod: 3.5,
    'twice-weekly': 2,
    'three-times-weekly': 3,
    weekly: 1,
  };

  const SYRINGE_CONFIG = {
    '40-iu': {
      label: '40 IU Insulin Syringe',
      multiplier: 40,
      capacityMl: 1,
      usesIuScale: true,
    },
    '100-iu': {
      label: '100 IU Insulin Syringe',
      multiplier: 100,
      capacityMl: 1,
      usesIuScale: true,
    },
    '3-ml': {
      label: '3 ml Syringe',
      multiplier: 1,
      capacityMl: 3,
      usesIuScale: false,
    },
    '5-ml': {
      label: '5 ml Syringe',
      multiplier: 1,
      capacityMl: 5,
      usesIuScale: false,
    },
  };

  const SYRINGE_TOO_SMALL_WARNING =
    'Selected syringe is too small for this injection volume.';

  const resultFields = {
    totalWeeklyDose: document.getElementById('result-total-weekly-dose'),
    totalWeeklyOil: document.getElementById('result-total-weekly-oil'),
    injectionFrequency: document.getElementById('result-injection-frequency'),
    totalOilPerInjection: document.getElementById('result-total-oil-per-injection'),
  };

  function formatDisplayDate(date) {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function parseInputDate(value) {
    if (!value) {
      return null;
    }

    const parts = value.split('-');
    return new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );
  }

  function getCalendarReferenceDate() {
    if (calendarViewYear !== null && calendarViewMonth !== null) {
      return new Date(calendarViewYear, calendarViewMonth, 1);
    }

    const startDate = parseInputDate(startDateInput.value);
    return startDate || new Date();
  }

  function monthToIndex(year, month) {
    return year * 12 + month;
  }

  function setCalendarViewMonth(year, month) {
    calendarViewYear = year;
    calendarViewMonth = month;
  }

  function resetCalendarViewToCycleStart() {
    const bounds = getCycleBounds();

    if (bounds.startDate) {
      setCalendarViewMonth(bounds.startDate.getFullYear(), bounds.startDate.getMonth());
      return;
    }

    const today = new Date();
    setCalendarViewMonth(today.getFullYear(), today.getMonth());
  }

  function getCycleMonthRange() {
    const bounds = getCycleBounds();

    if (!bounds.startDate) {
      return null;
    }

    const startMonth = {
      year: bounds.startDate.getFullYear(),
      month: bounds.startDate.getMonth(),
    };

    let endMonth = startMonth;

    if (bounds.endDate) {
      endMonth = {
        year: bounds.endDate.getFullYear(),
        month: bounds.endDate.getMonth(),
      };
    }

    return {
      startMonth: startMonth,
      endMonth: endMonth,
      hasCycleEnd: Boolean(bounds.endDate),
    };
  }

  function syncCalendarViewToCycle() {
    const range = getCycleMonthRange();

    if (!range) {
      return;
    }

    if (calendarViewYear === null || calendarViewMonth === null) {
      resetCalendarViewToCycleStart();
      return;
    }

    const currentIndex = monthToIndex(calendarViewYear, calendarViewMonth);
    const startIndex = monthToIndex(range.startMonth.year, range.startMonth.month);

    if (currentIndex < startIndex) {
      resetCalendarViewToCycleStart();
      return;
    }

    if (range.hasCycleEnd) {
      const endIndex = monthToIndex(range.endMonth.year, range.endMonth.month);

      if (currentIndex > endIndex) {
        setCalendarViewMonth(range.endMonth.year, range.endMonth.month);
      }
    }
  }

  function canNavigateCalendarMonth(direction) {
    const range = getCycleMonthRange();

    if (!range || calendarViewYear === null || calendarViewMonth === null) {
      return false;
    }

    const currentIndex = monthToIndex(calendarViewYear, calendarViewMonth);
    const startIndex = monthToIndex(range.startMonth.year, range.startMonth.month);

    if (direction < 0) {
      return currentIndex > startIndex;
    }

    if (!range.hasCycleEnd) {
      return true;
    }

    const endIndex = monthToIndex(range.endMonth.year, range.endMonth.month);
    return currentIndex < endIndex;
  }

  function navigateCalendarMonth(direction) {
    if (!canNavigateCalendarMonth(direction)) {
      return;
    }

    let nextMonth = calendarViewMonth + direction;
    let nextYear = calendarViewYear;

    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }

    setCalendarViewMonth(nextYear, nextMonth);

    if (calendarPlanData) {
      renderMonthlyCalendar(calendarPlanData);
    }
  }

  function getCalendarRangeEnd(cycleBounds) {
    if (cycleBounds.endDate) {
      return cycleBounds.endDate;
    }

    return new Date(calendarViewYear, calendarViewMonth + 1, 0);
  }

  function getSelectedOptionText(selectElement) {
    return selectElement.options[selectElement.selectedIndex].text;
  }

  function getCycleNameLabel() {
    if (cycleNameSelect.value === 'custom') {
      const customName = document.getElementById('cycle-name-custom').value.trim();
      return customName || 'Custom';
    }

    return getSelectedOptionText(cycleNameSelect);
  }

  function getCycleWeeks() {
    if (cycleLengthSelect.value === 'custom') {
      const customWeeks = parseInt(document.getElementById('cycle-length-custom').value, 10);
      return customWeeks > 0 ? customWeeks : 0;
    }

    return parseInt(cycleLengthSelect.value, 10);
  }

  function calculateExpectedFinishDate(startDate, weeks) {
    const finishDate = new Date(startDate);
    finishDate.setDate(finishDate.getDate() + weeks * 7);
    return finishDate;
  }

  function getCycleBounds() {
    const startDate = parseInputDate(startDateInput.value);
    const cycleWeeks = getCycleWeeks();
    let endDate = null;

    if (startDate && cycleWeeks > 0) {
      endDate = calculateExpectedFinishDate(startDate, cycleWeeks);
    }

    return {
      startDate: startDate,
      endDate: endDate,
    };
  }

  function normalizeDate(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function getCycleInjectionDates(selectedDayIds, cycleStart, cycleEnd) {
    if (!cycleStart || !cycleEnd || !selectedDayIds.length) {
      return [];
    }

    const start = normalizeDate(cycleStart);
    const end = normalizeDate(cycleEnd);

    if (start > end) {
      return [];
    }

    const dates = [];
    let cursor = new Date(start);

    while (cursor <= end) {
      if (selectedDayIds.indexOf(getDayIdFromDate(cursor)) !== -1) {
        dates.push(new Date(cursor));
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return dates;
  }

  function buildInjectionDateKeySet(injectionDates) {
    const dateKeys = {};

    injectionDates.forEach(function (date) {
      dateKeys[formatDateKey(date)] = true;
    });

    return dateKeys;
  }

  function toggleAthleteCustomFields() {
    cycleNameCustomField.hidden = cycleNameSelect.value !== 'custom';
    cycleLengthCustomField.hidden = cycleLengthSelect.value !== 'custom';
    goalCustomField.hidden = protocolGoalSelect.value !== 'custom';
  }

  function updateAthleteSummary() {
    const athleteName = document.getElementById('athlete-name').value.trim();
    const coachName = document.getElementById('coach-name').value.trim() || 'TeamMF';
    const startDate = parseInputDate(startDateInput.value);
    const cycleWeeks = getCycleWeeks();

    athleteSummaryFields.athleteName.textContent = athleteName || '\u2014';
    athleteSummaryFields.coachName.textContent = coachName;
    athleteSummaryFields.goal.textContent = getCycleNameLabel();

    if (cycleWeeks > 0) {
      athleteSummaryFields.cycleLength.textContent = cycleWeeks + ' Weeks';
    } else {
      athleteSummaryFields.cycleLength.textContent = '\u2014';
    }

    if (startDate) {
      athleteSummaryFields.startDate.textContent = formatDisplayDate(startDate);

      if (cycleWeeks > 0) {
        athleteSummaryFields.expectedFinish.textContent = formatDisplayDate(
          calculateExpectedFinishDate(startDate, cycleWeeks)
        );
      } else {
        athleteSummaryFields.expectedFinish.textContent = '\u2014';
      }
    } else {
      athleteSummaryFields.startDate.textContent = '\u2014';
      athleteSummaryFields.expectedFinish.textContent = '\u2014';
    }
  }

  function refreshCalendarIfReady() {
    if (calendarPlanData) {
      syncCalendarViewToCycle();
      renderMonthlyCalendar(calendarPlanData);
      document.getElementById('monthly-calendar').hidden = false;
    }
  }

  function initializeAthleteProtocol() {
    startDateInput.value = formatDateKey(new Date());
    toggleAthleteCustomFields();
    updateAthleteSummary();
  }

  function formatValue(value) {
    return Number(value.toFixed(2)).toFixed(2);
  }

  function setResult(field, value) {
    resultFields[field].textContent = formatValue(value);
  }

  function getSyringeReading(totalMl, syringe) {
    return syringe.usesIuScale ? totalMl * syringe.multiplier : totalMl;
  }

  function formatIuDisplay(value) {
    return formatValue(value) + ' IU';
  }

  function formatMlDisplay(value) {
    return formatValue(value) + ' ml';
  }

  function formatSelectedSyringeDisplay(totalMl, syringe) {
    const reading = getSyringeReading(totalMl, syringe);
    return syringe.usesIuScale ? formatIuDisplay(reading) : formatMlDisplay(reading);
  }

  function getRecommendedInjectionSites(totalOil) {
    if (totalOil <= 1) {
      return ['Delts', 'Ventroglute'];
    }

    if (totalOil <= 2) {
      return ['Ventroglute', 'Glutes'];
    }

    return ['Glutes only'];
  }

  function getSplitRecommendation(totalOil) {
    if (totalOil > 3) {
      return 'Recommend splitting into two injections.';
    }

    return '';
  }

  function getDayIdFromDate(date) {
    return DAY_IDS_BY_JS_DAY[date.getDay()];
  }

  function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function formatModalDate(date) {
    const day = date.getDate();
    const monthName = date.toLocaleString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    return day + ' ' + monthName + ' ' + year;
  }

  function getSyringeShortLabel(syringe) {
    return syringe.label.replace(' Insulin Syringe', ' Insulin').replace(' Syringe', '');
  }

  function buildCalendarPlan(compounds, selectedDays, syringeSize) {
    const syringe = SYRINGE_CONFIG[syringeSize];
    const injectionDayCount = selectedDays.length;
    const byDayId = {};
    const selectedDayIds = [];

    selectedDays.forEach(function (day) {
      selectedDayIds.push(day.id);
      let totalOilForInjection = 0;
      const compoundEntries = compounds.map(function (compound) {
        const mlPerInjection = compound.weeklyVolume / injectionDayCount;
        totalOilForInjection += mlPerInjection;

        return {
          compound: compound,
          mlPerInjection: mlPerInjection,
        };
      });

      byDayId[day.id] = {
        dayLabel: day.label,
        compoundEntries: compoundEntries,
        totalOilForInjection: totalOilForInjection,
      };
    });

    return {
      syringe: syringe,
      byDayId: byDayId,
      selectedDayIds: selectedDayIds,
    };
  }

  function buildSiteRotationMap(injectionDates) {
    const siteByDateKey = {};

    injectionDates.forEach(function (date, index) {
      siteByDateKey[formatDateKey(date)] = ROTATION_SITES[index % ROTATION_SITES.length];
    });

    return siteByDateKey;
  }

  function isInjectionCompleted(dateKey) {
    return completedInjections[dateKey] === true;
  }

  function updateCalendarDayCell(dateKey) {
    const cell = monthlyCalendarCards.querySelector('[data-date-key="' + dateKey + '"]');

    if (!cell) {
      return;
    }

    if (isInjectionCompleted(dateKey)) {
      cell.classList.add('calendar-day--completed');
      cell.classList.remove('calendar-day--injection');
    } else {
      cell.classList.remove('calendar-day--completed');
      cell.classList.add('calendar-day--injection');
    }
  }

  function hideCalendarTooltip() {
    calendarTooltip.classList.remove('visible');
    calendarTooltip.hidden = true;
  }

  function showCalendarTooltip(cell, plan) {
    const compoundLines = plan.compoundEntries
      .map(function (entry) {
        return entry.compound.name;
      })
      .join('<br>');

    calendarTooltip.innerHTML =
      '<p class="calendar-tooltip-title">' +
      plan.dayLabel +
      '</p>' +
      '<p>' +
      compoundLines +
      '</p>' +
      '<p class="calendar-tooltip-total">Total Oil<br>' +
      formatMlDisplay(plan.totalOilForInjection) +
      '</p>';

    calendarTooltip.hidden = false;
    calendarTooltip.style.visibility = 'hidden';
    calendarTooltip.classList.add('visible');

    const rect = cell.getBoundingClientRect();
    const tooltipRect = calendarTooltip.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    let top = rect.top - tooltipRect.height - 10;

    if (left < 8) {
      left = 8;
    }

    if (left + tooltipRect.width > window.innerWidth - 8) {
      left = window.innerWidth - tooltipRect.width - 8;
    }

    if (top < 8) {
      top = rect.bottom + 10;
    }

    calendarTooltip.style.left = left + 'px';
    calendarTooltip.style.top = top + 'px';
    calendarTooltip.style.visibility = 'visible';
  }

  function openCalendarModal(date, plan, site) {
    hideCalendarTooltip();
    activeModalDateKey = formatDateKey(date);
    calendarModalTitle.textContent = plan.dayLabel;
    calendarModalDate.textContent = formatModalDate(date);
    calendarModalBody.innerHTML = '';

    const compoundsTitle = document.createElement('p');
    compoundsTitle.className = 'protocol-section-title';
    compoundsTitle.textContent = 'Compounds';
    calendarModalBody.appendChild(compoundsTitle);

    plan.compoundEntries.forEach(function (entry, index) {
      const block = document.createElement('div');
      block.className = 'calendar-modal-compound';

      const name = document.createElement('p');
      name.className = 'calendar-modal-compound-name';
      name.textContent = '\u2713 ' + entry.compound.name;
      block.appendChild(name);

      const volume = document.createElement('p');
      volume.className = 'calendar-modal-compound-volume';
      volume.textContent = formatMlDisplay(entry.mlPerInjection);
      block.appendChild(volume);

      calendarModalBody.appendChild(block);

      if (index < plan.compoundEntries.length - 1) {
        const divider = document.createElement('hr');
        divider.className = 'protocol-divider';
        calendarModalBody.appendChild(divider);
      }
    });

    const totalDivider = document.createElement('hr');
    totalDivider.className = 'protocol-divider';
    calendarModalBody.appendChild(totalDivider);

    appendModalSection(calendarModalBody, 'Total Oil', formatMlDisplay(plan.totalOilForInjection));

    const syringeDivider = document.createElement('hr');
    syringeDivider.className = 'protocol-divider';
    calendarModalBody.appendChild(syringeDivider);

    const syringeSection = document.createElement('div');
    syringeSection.className = 'protocol-section';
    const syringeTitle = document.createElement('p');
    syringeTitle.className = 'protocol-section-title';
    syringeTitle.textContent = 'Selected Syringe';
    syringeSection.appendChild(syringeTitle);
    const syringeName = document.createElement('p');
    syringeName.className = 'protocol-syringe-name';
    syringeName.textContent = getSyringeShortLabel(calendarPlanData.syringe);
    syringeSection.appendChild(syringeName);
    const drawToLabel = document.createElement('p');
    drawToLabel.className = 'protocol-draw-label';
    drawToLabel.textContent = 'Draw To';
    syringeSection.appendChild(drawToLabel);
    const drawToValue = document.createElement('p');
    drawToValue.className = 'protocol-draw-value';
    drawToValue.textContent = formatSelectedSyringeDisplay(
      plan.totalOilForInjection,
      calendarPlanData.syringe
    );
    syringeSection.appendChild(drawToValue);
    if (plan.totalOilForInjection > calendarPlanData.syringe.capacityMl) {
      const warning = document.createElement('p');
      warning.className = 'protocol-warning';
      warning.textContent = SYRINGE_TOO_SMALL_WARNING;
      syringeSection.appendChild(warning);
    }
    calendarModalBody.appendChild(syringeSection);

    const siteDivider = document.createElement('hr');
    siteDivider.className = 'protocol-divider';
    calendarModalBody.appendChild(siteDivider);

    appendModalSection(calendarModalBody, 'Recommended Site', site);

    const completed = isInjectionCompleted(activeModalDateKey);
    calendarModalCompleted.checked = completed;
    calendarModalStatusLabel.textContent = completed ? 'Completed' : 'Pending';

    calendarModal.hidden = false;
  }

  function appendModalSection(container, title, value) {
    const section = document.createElement('div');
    section.className = 'protocol-section';
    const heading = document.createElement('p');
    heading.className = 'protocol-section-title';
    heading.textContent = title;
    section.appendChild(heading);
    const text = document.createElement('p');
    text.textContent = value;
    section.appendChild(text);
    container.appendChild(section);
  }

  function closeCalendarModal() {
    calendarModal.hidden = true;
    activeModalDateKey = null;
  }

  function renderMonthlyCalendar(planData, resetView) {
    calendarPlanData = planData;
    monthlyCalendarCards.innerHTML = '';

    if (resetView) {
      resetCalendarViewToCycleStart();
    } else {
      syncCalendarViewToCycle();
    }

    if (calendarViewYear === null || calendarViewMonth === null) {
      resetCalendarViewToCycleStart();
    }

    const today = new Date();
    const year = calendarViewYear;
    const month = calendarViewMonth;
    const monthName = new Date(year, month, 1).toLocaleString('en-GB', {
      month: 'long',
      year: 'numeric',
    });
    const cycleBounds = getCycleBounds();
    const rangeEnd = getCalendarRangeEnd(cycleBounds);
    const cycleInjectionDates = getCycleInjectionDates(
      planData.selectedDayIds,
      cycleBounds.startDate,
      rangeEnd
    );
    const injectionDateKeys = buildInjectionDateKeySet(cycleInjectionDates);
    const siteByDateKey = buildSiteRotationMap(cycleInjectionDates);
    const todayKey = formatDateKey(today);

    const navigation = document.createElement('div');
    navigation.className = 'calendar-navigation';

    const previousButton = document.createElement('button');
    previousButton.type = 'button';
    previousButton.className = 'calendar-nav-button';
    previousButton.textContent = 'Previous Month';
    previousButton.disabled = !canNavigateCalendarMonth(-1);
    previousButton.addEventListener('click', function () {
      navigateCalendarMonth(-1);
    });

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'calendar-nav-button';
    nextButton.textContent = 'Next Month';
    nextButton.disabled = !canNavigateCalendarMonth(1);
    nextButton.addEventListener('click', function () {
      navigateCalendarMonth(1);
    });

    navigation.appendChild(previousButton);
    navigation.appendChild(nextButton);
    monthlyCalendarCards.appendChild(navigation);

    const title = document.createElement('h3');
    title.className = 'calendar-month-title';
    title.textContent = monthName;
    monthlyCalendarCards.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    CALENDAR_WEEKDAYS.forEach(function (weekday) {
      const header = document.createElement('div');
      header.className = 'calendar-weekday';
      header.textContent = weekday;
      grid.appendChild(header);
    });

    const firstOfMonth = new Date(year, month, 1);
    let startOffset = firstOfMonth.getDay() - 1;

    if (startOffset < 0) {
      startOffset = 6;
    }

    for (let i = 0; i < startOffset; i += 1) {
      const empty = document.createElement('div');
      empty.className = 'calendar-day calendar-day--empty';
      empty.setAttribute('aria-hidden', 'true');
      grid.appendChild(empty);
    }

    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= lastDay; day += 1) {
      const date = new Date(year, month, day);
      const dateKey = formatDateKey(date);
      const dayId = getDayIdFromDate(date);
      const isInjectionDay = injectionDateKeys[dateKey] === true;
      const cell = document.createElement(isInjectionDay ? 'button' : 'div');

      if (isInjectionDay) {
        cell.type = 'button';
      }

      cell.className = 'calendar-day';
      cell.dataset.dateKey = dateKey;

      if (dateKey === todayKey) {
        cell.classList.add('calendar-day--today');
      }

      const dayNumber = document.createElement('span');
      dayNumber.className = 'calendar-day-number';
      dayNumber.textContent = String(day);
      cell.appendChild(dayNumber);

      if (isInjectionDay) {
        const plan = planData.byDayId[dayId];
        const site = siteByDateKey[dateKey];

        if (isInjectionCompleted(dateKey)) {
          cell.classList.add('calendar-day--completed');
        } else {
          cell.classList.add('calendar-day--injection');
        }

        const icon = document.createElement('span');
        icon.className = 'calendar-day-icon';
        icon.textContent = '\uD83D\uDC89';
        icon.setAttribute('aria-hidden', 'true');
        cell.appendChild(icon);

        cell.addEventListener('click', function () {
          openCalendarModal(date, plan, site);
        });

        cell.addEventListener('mouseenter', function () {
          showCalendarTooltip(cell, plan);
        });

        cell.addEventListener('mouseleave', hideCalendarTooltip);

        cell.addEventListener('focus', function () {
          showCalendarTooltip(cell, plan);
        });

        cell.addEventListener('blur', hideCalendarTooltip);
      }

      grid.appendChild(cell);
    }

    monthlyCalendarCards.appendChild(grid);
  }

  function createDetailRow(label, value) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    return { dt: dt, dd: dd };
  }

  function buildProtocolDayCard(dayLabel, compoundEntries, totalOilForInjection, syringe) {
    const card = document.createElement('article');
    card.className = 'protocol-card';

    const title = document.createElement('h3');
    title.textContent = dayLabel.toUpperCase();
    card.appendChild(title);

    compoundEntries.forEach(function (entry, index) {
      const compoundBlock = document.createElement('div');
      compoundBlock.className = 'protocol-compound';

      const name = document.createElement('p');
      name.className = 'protocol-compound-name';
      name.textContent = entry.compound.name;
      compoundBlock.appendChild(name);

      const volume = document.createElement('p');
      volume.className = 'protocol-compound-volume';
      volume.textContent = formatMlDisplay(entry.mlPerInjection);
      compoundBlock.appendChild(volume);

      card.appendChild(compoundBlock);

      if (index < compoundEntries.length - 1) {
        const divider = document.createElement('hr');
        divider.className = 'protocol-divider';
        card.appendChild(divider);
      }
    });

    const summaryDivider = document.createElement('hr');
    summaryDivider.className = 'protocol-divider';
    card.appendChild(summaryDivider);

    const totalSection = document.createElement('div');
    totalSection.className = 'protocol-section';
    const totalTitle = document.createElement('p');
    totalTitle.className = 'protocol-section-title';
    totalTitle.textContent = 'Total Oil';
    totalSection.appendChild(totalTitle);
    const totalValue = document.createElement('p');
    totalValue.textContent = formatMlDisplay(totalOilForInjection);
    totalSection.appendChild(totalValue);
    card.appendChild(totalSection);

    const syringeSection = document.createElement('div');
    syringeSection.className = 'protocol-section';
    const syringeTitle = document.createElement('p');
    syringeTitle.className = 'protocol-section-title';
    syringeTitle.textContent = 'Selected Syringe Reading';
    syringeSection.appendChild(syringeTitle);
    const syringeName = document.createElement('p');
    syringeName.className = 'protocol-syringe-name';
    syringeName.textContent = syringe.label;
    syringeSection.appendChild(syringeName);
    const drawToLabel = document.createElement('p');
    drawToLabel.className = 'protocol-draw-label';
    drawToLabel.textContent = 'Draw to:';
    syringeSection.appendChild(drawToLabel);
    const drawToValue = document.createElement('p');
    drawToValue.className = 'protocol-draw-value';
    drawToValue.textContent = formatSelectedSyringeDisplay(totalOilForInjection, syringe);
    syringeSection.appendChild(drawToValue);
    if (totalOilForInjection > syringe.capacityMl) {
      const warning = document.createElement('p');
      warning.className = 'protocol-warning';
      warning.textContent = SYRINGE_TOO_SMALL_WARNING;
      syringeSection.appendChild(warning);
    }
    card.appendChild(syringeSection);

    const siteSection = document.createElement('div');
    siteSection.className = 'protocol-section';
    const siteTitle = document.createElement('p');
    siteTitle.className = 'protocol-section-title';
    siteTitle.textContent = 'Recommended Injection Site';
    siteSection.appendChild(siteTitle);
    const siteList = document.createElement('ul');
    siteList.className = 'protocol-sites';
    getRecommendedInjectionSites(totalOilForInjection).forEach(function (site) {
      const item = document.createElement('li');
      item.textContent = site;
      siteList.appendChild(item);
    });
    siteSection.appendChild(siteList);
    const splitRecommendation = getSplitRecommendation(totalOilForInjection);
    if (splitRecommendation) {
      const splitNote = document.createElement('p');
      splitNote.className = 'protocol-warning';
      splitNote.textContent = splitRecommendation;
      siteSection.appendChild(splitNote);
    }
    card.appendChild(siteSection);

    return card;
  }

  function buildVialDurationCard(compound) {
    const vialWeeks = compound.vialSize / compound.weeklyVolume;
    const vialDays = vialWeeks * 7;
    const card = document.createElement('article');
    card.className = 'protocol-card protocol-vial';

    const title = document.createElement('h3');
    title.textContent = compound.name;
    card.appendChild(title);

    const details = document.createElement('dl');
    const weeksRow = createDetailRow('Weeks per vial', formatValue(vialWeeks));
    const daysRow = createDetailRow('Days per vial', formatValue(vialDays));
    details.appendChild(weeksRow.dt);
    details.appendChild(weeksRow.dd);
    details.appendChild(daysRow.dt);
    details.appendChild(daysRow.dd);
    card.appendChild(details);

    return card;
  }

  function getCompoundCardCount() {
    return compoundCardsContainer.querySelectorAll('.compound-card').length;
  }

  function updateCompoundLabels() {
    compoundCardsContainer.querySelectorAll('.compound-card').forEach(function (card, index) {
      card.querySelector('legend').textContent = 'Compound ' + (index + 1);
    });
  }

  function styleRemoveButton(button) {
    button.style.cssText = REMOVE_BUTTON_STYLE;
  }

  function applyDefaultInjectionDays(frequency) {
    const defaults = DEFAULT_DAYS_BY_FREQUENCY[frequency];

    DAYS.forEach(function (day) {
      document.getElementById('day-' + day.id).checked = defaults.indexOf(day.id) !== -1;
    });
  }

  function getSelectedInjectionDays() {
    return DAYS.filter(function (day) {
      return document.getElementById('day-' + day.id).checked;
    });
  }

  function readCompoundFromCard(card) {
    const name = card.querySelector('input[type="text"]').value.trim();
    const numberInputs = card.querySelectorAll('input[type="number"]');
    const concentration = parseFloat(numberInputs[0].value);
    const weeklyDose = parseFloat(numberInputs[1].value);
    const vialSizeValue = numberInputs[2].value.trim();
    const vialSize = vialSizeValue === '' ? null : parseFloat(vialSizeValue);

    return {
      name: name,
      concentration: concentration,
      weeklyDose: weeklyDose,
      vialSize: vialSize,
    };
  }

  function getAllCompounds() {
    return Array.from(compoundCardsContainer.querySelectorAll('.compound-card')).map(
      readCompoundFromCard
    );
  }

  function appendDefinition(list, term, value) {
    const dt = document.createElement('dt');
    dt.textContent = term;
    const dd = document.createElement('dd');
    dd.textContent = value;
    list.appendChild(dt);
    list.appendChild(dd);
  }

  function renderCompoundSummary(compounds) {
    compoundSummaryList.innerHTML = '';

    let totalWeeklyOil = 0;

    compounds.forEach(function (compound, index) {
      totalWeeklyOil += compound.weeklyVolume;

      appendDefinition(compoundSummaryList, 'Compound Name', compound.name);
      appendDefinition(compoundSummaryList, 'Weekly Dose (mg)', formatValue(compound.weeklyDose));
      appendDefinition(
        compoundSummaryList,
        'Concentration (mg/ml)',
        formatValue(compound.concentration)
      );
      appendDefinition(
        compoundSummaryList,
        'Weekly Volume (ml)',
        formatValue(compound.weeklyVolume)
      );

      if (index < compounds.length - 1) {
        appendDefinition(compoundSummaryList, '----------------------------------', '');
      }
    });

    appendDefinition(
      compoundSummaryList,
      'TOTAL WEEKLY OIL (ml)',
      formatValue(totalWeeklyOil)
    );
  }

  function renderStackSummary(compounds, frequencyLabel, injectionsPerWeek) {
    const totalWeeklyDose = compounds.reduce(function (sum, compound) {
      return sum + compound.weeklyDose;
    }, 0);

    const totalWeeklyOil = compounds.reduce(function (sum, compound) {
      return sum + compound.weeklyVolume;
    }, 0);

    const totalOilPerInjection = totalWeeklyOil / injectionsPerWeek;

    resultFields.totalWeeklyDose.textContent = formatValue(totalWeeklyDose);
    resultFields.totalWeeklyOil.textContent = formatValue(totalWeeklyOil);
    resultFields.injectionFrequency.textContent = frequencyLabel;
    setResult('totalOilPerInjection', totalOilPerInjection);

    return totalOilPerInjection;
  }

  function renderInjectionPlan(compounds, selectedDays, syringeSize) {
    injectionPlanCards.innerHTML = '';

    const syringe = SYRINGE_CONFIG[syringeSize];
    const injectionDayCount = selectedDays.length;

    selectedDays.forEach(function (day) {
      let totalOilForInjection = 0;
      const compoundEntries = compounds.map(function (compound) {
        const mlPerInjection = compound.weeklyVolume / injectionDayCount;
        totalOilForInjection += mlPerInjection;

        return {
          compound: compound,
          mlPerInjection: mlPerInjection,
        };
      });

      injectionPlanCards.appendChild(
        buildProtocolDayCard(day.label, compoundEntries, totalOilForInjection, syringe)
      );
    });
  }

  function renderVialDuration(compounds) {
    vialDurationCards.innerHTML = '';

    const compoundsWithVial = compounds.filter(function (compound) {
      return compound.vialSize && compound.vialSize > 0;
    });

    if (compoundsWithVial.length === 0) {
      return;
    }

    compoundsWithVial.forEach(function (compound) {
      vialDurationCards.appendChild(buildVialDurationCard(compound));
    });
  }

  function createCompoundCard(index) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'compound-card';
    fieldset.innerHTML =
      '<legend>Compound ' + index + '</legend>' +
      '<p>' +
      '<label for="compound-name-' + index + '">Compound Name</label>' +
      '<input type="text" id="compound-name-' + index + '" name="compound-name-' + index + '" autocomplete="off">' +
      '</p>' +
      '<p>' +
      '<label for="concentration-' + index + '">Concentration (mg/ml)</label>' +
      '<input type="number" id="concentration-' + index + '" name="concentration-' + index + '" min="0" step="any">' +
      '</p>' +
      '<p>' +
      '<label for="weekly-dose-' + index + '">Weekly Dose (mg)</label>' +
      '<input type="number" id="weekly-dose-' + index + '" name="weekly-dose-' + index + '" min="0" step="any">' +
      '</p>' +
      '<p>' +
      '<label for="vial-size-' + index + '">Vial Size (ml)</label>' +
      '<input type="number" id="vial-size-' + index + '" name="vial-size-' + index + '" value="10" min="0" step="any">' +
      '</p>' +
      '<p>' +
      '<button type="button" class="remove-compound">Remove</button>' +
      '</p>';

    const removeButton = fieldset.querySelector('.remove-compound');
    styleRemoveButton(removeButton);
    removeButton.addEventListener('click', function () {
      removeCompoundCard(fieldset);
    });

    return fieldset;
  }

  function addCompoundCard() {
    if (getCompoundCardCount() >= MAX_COMPOUNDS) {
      alert('Maximum 10 compounds allowed.');
      return;
    }

    compoundCount += 1;
    compoundCardsContainer.appendChild(createCompoundCard(compoundCount));
    updateCompoundLabels();
  }

  function removeCompoundCard(card) {
    if (getCompoundCardCount() <= 1) {
      return;
    }

    card.remove();
    updateCompoundLabels();
  }

  addCompoundButton.addEventListener('click', addCompoundCard);

  compoundCardsContainer.querySelectorAll('.remove-compound').forEach(function (button) {
    button.addEventListener('click', function () {
      removeCompoundCard(button.closest('.compound-card'));
    });
  });

  frequencySelect.addEventListener('change', function () {
    applyDefaultInjectionDays(frequencySelect.value);
  });

  applyDefaultInjectionDays(frequencySelect.value);
  initializeAthleteProtocol();

  document.getElementById('athlete-protocol').addEventListener('input', updateAthleteSummary);
  document.getElementById('athlete-protocol').addEventListener('change', function (event) {
    toggleAthleteCustomFields();
    updateAthleteSummary();

    if (event.target.id === 'start-date') {
      resetCalendarViewToCycleStart();
    }

    if (
      event.target.id === 'start-date' ||
      event.target.id === 'cycle-length' ||
      event.target.id === 'cycle-length-custom'
    ) {
      refreshCalendarIfReady();
    }
  });

  calendarModalClose.addEventListener('click', closeCalendarModal);
  calendarModalBackdrop.addEventListener('click', closeCalendarModal);

  calendarModalCompleted.addEventListener('change', function () {
    if (!activeModalDateKey) {
      return;
    }

    completedInjections[activeModalDateKey] = calendarModalCompleted.checked;
    calendarModalStatusLabel.textContent = calendarModalCompleted.checked ? 'Completed' : 'Pending';
    updateCalendarDayCell(activeModalDateKey);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !calendarModal.hidden) {
      closeCalendarModal();
    }
  });

  window.addEventListener('scroll', hideCalendarTooltip, true);

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const compoundsInput = getAllCompounds();
    const syringeSize = document.getElementById('syringe-size').value;
    const frequency = frequencySelect.value;
    const frequencyLabel = frequencySelect.options[frequencySelect.selectedIndex].text;
    const selectedDays = getSelectedInjectionDays();

    const allCompoundsValid = compoundsInput.every(function (compound) {
      return compound.name && compound.concentration && compound.weeklyDose;
    });

    if (!allCompoundsValid) {
      alert(
        'Please complete all fields before calculating.\n\n' +
          'Make sure every compound has a name and all numeric values are greater than zero.'
      );
      return;
    }

    if (selectedDays.length === 0) {
      alert('Please select at least one injection day.');
      return;
    }

    const compounds = compoundsInput.map(function (compound) {
      return {
        name: compound.name,
        concentration: compound.concentration,
        weeklyDose: compound.weeklyDose,
        vialSize: compound.vialSize,
        weeklyVolume: compound.weeklyDose / compound.concentration,
      };
    });

    const injectionsPerWeek = selectedDays.length;

    renderCompoundSummary(compounds);
    const totalOilPerInjection = renderStackSummary(
      compounds,
      frequencyLabel,
      injectionsPerWeek
    );
    renderInjectionPlan(compounds, selectedDays, syringeSize);
    renderMonthlyCalendar(buildCalendarPlan(compounds, selectedDays, syringeSize), true);
    renderVialDuration(compounds);

    resultCards.forEach(function (card) {
      card.hidden = false;
    });

    document.getElementById('vial-duration').hidden = vialDurationCards.children.length === 0;
  });
})();
