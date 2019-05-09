'use strict'

const ical = require('ical.js')
const moment = require('moment')

class TaggedTime {
  constructor (source, since) {
    this.source = source
    this.since = since
  }

  async parseTimeTracking () {
    var tagged = await this.taggedEvents()

    var taggedDayDurations = {}
    Object.keys(tagged).forEach(tag => {
      var events = tagged[tag]
      events.forEach(event => {
        var startTime = moment(event.startDate)
        var endTime = moment(event.endDate)

        var startDayStr = moment(event.startDate).startOf('day').format('YYYY-MM-DD')
        if (!taggedDayDurations[tag]) {
          taggedDayDurations[tag] = []
        }
        if (!taggedDayDurations[tag][startDayStr]) {
          taggedDayDurations[tag][startDayStr] = moment.duration(0)
        }

        taggedDayDurations[tag][startDayStr].add(
          moment.duration(endTime.diff(startTime))
        )
      })
    })

    var taggedDayStrings = {}
    Object.keys(taggedDayDurations).forEach(tag => {
      Object.keys(taggedDayDurations[tag]).forEach(date => {
        if (!taggedDayStrings[tag]) {
          taggedDayStrings[tag] = {}
        }
        taggedDayStrings[tag][date] = taggedDayDurations[tag][date].toISOString()
      })
    })

    return (taggedDayStrings)
  }

  async taggedEvents () {
    const iCalStr = await this.source
    const since = this.since

    var jCalData = ical.parse(iCalStr)
    var comp = new ical.Component(jCalData)
    var vevents = comp.getAllSubcomponents('vevent')

    var weekEvents = vevents.map(vevent => {
      // ICAL.Event objects use their own ICAL.Time object for times, which is
      // somewhat confusing. Better to expose just a regular JS Date, which can
      // then be easily converted to moment if necessary.
      var iCalEvent = new ical.Event(vevent)
      return {
        startDate: iCalEvent.startDate.toJSDate(),
        endDate: iCalEvent.endDate.toJSDate(),
        summary: iCalEvent.summary,
      }
    }).filter(event => {
      var startTime = moment(event.startDate)
      return startTime.isSameOrAfter(since)
    })

    var tagged = {}
    weekEvents.forEach(event => {
      var tags = event.summary.match(/#[A-Za-z0-9_]*/g)
      if (tags) {
        tags.forEach(tag => {
          tag = tag.replace(/#/, '').toLowerCase()
          if (!tagged[tag]) {
            tagged[tag] = []
          }
          tagged[tag].push(event)
        })
      }
    })
    return tagged
  }
}

module.exports = { TaggedTime }
