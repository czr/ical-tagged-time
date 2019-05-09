const moment = require('moment')
const { TaggedTime } = require('./index')

function okPromise (data) {
  return new Promise((resolve, reject) => { resolve(data) })
}

test('parseTimeTracking: no tags', async () => {
  const since = moment('2001-01-01')
  const iCalPromise = okPromise(iCalNoTags())
  const tt = new TaggedTime(iCalPromise, since)
  const result = await tt.parseTimeTracking()
  const expected = {}
  expect(result).toEqual(expected)
})

test('parseTimeTracking: one event', async () => {
  const since = moment('2001-01-01')
  const iCalPromise = okPromise(iCal())
  const tt = new TaggedTime(iCalPromise, since)
  const result = await tt.parseTimeTracking()
  const expected = {
    'music': {
      '2018-12-06': 'PT1H',
    },
  }
  expect(result).toEqual(expected)
})

test('parseTimeTracking: two tags, one event', async () => {
  const since = moment('2001-01-01')
  const iCalPromise = okPromise(iCalTwoTagsOneEvent())
  const tt = new TaggedTime(iCalPromise, since)
  const result = await tt.parseTimeTracking()
  const expected = {
    'music': {
      '2018-12-06': 'PT1H',
    },
    'soundtrack': {
      '2018-12-06': 'PT1H',
    },
  }
  expect(result).toEqual(expected)
})

test('parseTimeTracking: two tags, two events', async () => {
  const since = moment('2001-01-01')
  const iCalPromise = okPromise(iCalTwoTagsTwoEvents())
  const tt = new TaggedTime(iCalPromise, since)
  const result = await tt.parseTimeTracking()
  const expected = {
    'music': {
      '2018-12-06': 'PT1H',
    },
    'soundtrack': {
      '2018-12-07': 'PT1H',
    },
  }
  expect(result).toEqual(expected)
})

test('parseTimeTracking: two events, date filtered', async () => {
  const since = moment('2010-01-01')
  const iCalPromise = okPromise(iCalTwoEventsDateFiltered())
  const tt = new TaggedTime(iCalPromise, since)
  const result = await tt.parseTimeTracking()
  const expected = {
    'music': {
      '2018-12-06': 'PT1H',
    },
  }
  expect(result).toEqual(expected)
})

test('parseTimeTracking: case-insensitive', async () => {
  const since = moment('2001-01-01')
  const iCalPromise = okPromise(iCalMixedCaseTag())
  const tt = new TaggedTime(iCalPromise, since)
  const result = await tt.parseTimeTracking()
  const expected = {
    'music': {
      '2018-12-06': 'PT1H',
    },
  }
  expect(result).toEqual(expected)
})

test('taggedEvents: two tags, two events', async () => {
  const since = moment('2001-01-01')
  const iCalPromise = okPromise(iCalTwoTagsTwoEvents())
  const tt = new TaggedTime(iCalPromise, since)
  const result = await tt.taggedEvents()

  expect(result).toEqual({
    music: [
      {
        startDate: new Date('2018-12-06T15:00:00Z'),
        endDate: new Date('2018-12-06T16:00:00Z'),
        summary: 'Nosferatu #music',
      },
    ],
    soundtrack: [
      {
        startDate: new Date('2018-12-07T15:00:00Z'),
        endDate: new Date('2018-12-07T16:00:00Z'),
        summary: 'Nosferatu #soundtrack',
      },
    ],
  })
})

function iCal () {
  return `
BEGIN:VCALENDAR
PRODID:-//Dummy//Unit Test//iCal
VERSION:2.0

BEGIN:VTIMEZONE
TZID:Europe/London

BEGIN:DAYLIGHT
TZOFFSETFROM:+0000
TZOFFSETTO:+0100
TZNAME:BST
DTSTART:19700329T010000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT

BEGIN:STANDARD
TZOFFSETFROM:+0100
TZOFFSETTO:+0000
TZNAME:GMT
DTSTART:19701025T020000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD

END:VTIMEZONE

BEGIN:VEVENT
DTSTART:20181206T150000Z
DTEND:20181206T160000Z
UID:1@test.com
SUMMARY:Nosferatu #music
END:VEVENT

END:VCALENDAR
`
}

function iCalNoTags () {
  return `
BEGIN:VCALENDAR
PRODID:-//Dummy//Unit Test//iCal
VERSION:2.0

BEGIN:VTIMEZONE
TZID:Europe/London

BEGIN:DAYLIGHT
TZOFFSETFROM:+0000
TZOFFSETTO:+0100
TZNAME:BST
DTSTART:19700329T010000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT

BEGIN:STANDARD
TZOFFSETFROM:+0100
TZOFFSETTO:+0000
TZNAME:GMT
DTSTART:19701025T020000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD

END:VTIMEZONE

BEGIN:VEVENT
DTSTART:20181206T150000Z
DTEND:20181206T160000Z
UID:1@test.com
SUMMARY:Nosferatu
END:VEVENT

END:VCALENDAR
`
}

function iCalTwoTagsOneEvent () {
  return `
BEGIN:VCALENDAR
PRODID:-//Dummy//Unit Test//iCal
VERSION:2.0

BEGIN:VTIMEZONE
TZID:Europe/London

BEGIN:DAYLIGHT
TZOFFSETFROM:+0000
TZOFFSETTO:+0100
TZNAME:BST
DTSTART:19700329T010000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT

BEGIN:STANDARD
TZOFFSETFROM:+0100
TZOFFSETTO:+0000
TZNAME:GMT
DTSTART:19701025T020000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD

END:VTIMEZONE

BEGIN:VEVENT
DTSTART:20181206T150000Z
DTEND:20181206T160000Z
UID:1@test.com
SUMMARY:Nosferatu #music #soundtrack
END:VEVENT

END:VCALENDAR
`
}

function iCalTwoTagsTwoEvents () {
  return `
BEGIN:VCALENDAR
PRODID:-//Dummy//Unit Test//iCal
VERSION:2.0

BEGIN:VTIMEZONE
TZID:Europe/London

BEGIN:DAYLIGHT
TZOFFSETFROM:+0000
TZOFFSETTO:+0100
TZNAME:BST
DTSTART:19700329T010000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT

BEGIN:STANDARD
TZOFFSETFROM:+0100
TZOFFSETTO:+0000
TZNAME:GMT
DTSTART:19701025T020000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD

END:VTIMEZONE

BEGIN:VEVENT
DTSTART:20181206T150000Z
DTEND:20181206T160000Z
UID:1@test.com
SUMMARY:Nosferatu #music
END:VEVENT

BEGIN:VEVENT
DTSTART:20181207T150000Z
DTEND:20181207T160000Z
UID:2@test.com
SUMMARY:Nosferatu #soundtrack
END:VEVENT

END:VCALENDAR
`
}

function iCalTwoEventsDateFiltered () {
  return `
BEGIN:VCALENDAR
PRODID:-//Dummy//Unit Test//iCal
VERSION:2.0

BEGIN:VTIMEZONE
TZID:Europe/London

BEGIN:DAYLIGHT
TZOFFSETFROM:+0000
TZOFFSETTO:+0100
TZNAME:BST
DTSTART:19700329T010000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT

BEGIN:STANDARD
TZOFFSETFROM:+0100
TZOFFSETTO:+0000
TZNAME:GMT
DTSTART:19701025T020000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD

END:VTIMEZONE

BEGIN:VEVENT
DTSTART:20081206T140000Z
DTEND:20081206T160000Z
UID:1@test.com
SUMMARY:Nosferatu #music
END:VEVENT

BEGIN:VEVENT
DTSTART:20181206T150000Z
DTEND:20181206T160000Z
UID:2@test.com
SUMMARY:Nosferatu #music
END:VEVENT

END:VCALENDAR
`
}

function iCalMixedCaseTag () {
  return `
BEGIN:VCALENDAR
PRODID:-//Dummy//Unit Test//iCal
VERSION:2.0

BEGIN:VTIMEZONE
TZID:Europe/London

BEGIN:DAYLIGHT
TZOFFSETFROM:+0000
TZOFFSETTO:+0100
TZNAME:BST
DTSTART:19700329T010000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT

BEGIN:STANDARD
TZOFFSETFROM:+0100
TZOFFSETTO:+0000
TZNAME:GMT
DTSTART:19701025T020000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD

END:VTIMEZONE

BEGIN:VEVENT
DTSTART:20181206T150000Z
DTEND:20181206T160000Z
UID:1@test.com
SUMMARY:Nosferatu #Music
END:VEVENT

END:VCALENDAR
`
}
