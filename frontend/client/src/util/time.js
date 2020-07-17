export const getOneHourAhead = () => {
  // this function generates a string of time one hour ahead of the current time
  // ex: "1:29 AM Pacific Daylight Time"
  // declaring new Date() here instead of passing in the code generation time stamp as they should be within 60 seconds of each other and second precision here is not necessary
  const now = new Date()
  const ahead = new Date(now.setHours(now.getHours() + 1))
  let hours = ahead.getHours()
  let amPM = 'AM'

  if (hours > 12) {
    hours = hours - 12
    amPM = 'PM'
  }

  hours = hours.toString()
  let mins = ahead.getMinutes().toString()

  if (mins.length === 1) {
    mins = '0' + mins
  }
  const timezone = /\((.*)\)/.exec(ahead.toString())[1]

  return hours + ':' + mins + ' ' + amPM + ' ' + timezone
}

// getFourteenDaysAgo generates a string formatted date fourteen days ago from present day
// ex: "2020-07-02"
export const getFourteenDaysAgo = () => {
  var ourDate = new Date()

  //Change date picker minimum to be 14 days in the past.
  var pastDate = ourDate.getDate() - 14
  ourDate.setDate(pastDate)

  return getDay(ourDate)
}

// getDay generates a string formatted date
// ex: "2020-07-16"
export const getDay = (now = new Date()) => {
  const year = now.getFullYear().toString()
  let month = (now.getMonth() + 1).toString()

  if (month.length === 1) {
    month = '0' + month
  }

  let day = now.getDate().toString()

  if (day.length === 1) {
    day = '0' + day
  }

  return year + '-' + month + '-' + day
}

export const moreThanFourteenDaysAgo = (strChosenDate) => {
  // source for this approach
  // https://stackoverflow.com/questions/54383799/check-if-date-string-is-greater-than-3-days

  // I cannot figure out why date1 defaults to July 1 for me here but in my browser console when I do it, it generates: Thu Jul 16 2020 18:26:04 GMT-0700 (Pacific Daylight Time)
  // maybe some weird setting on my computer that is reading a date wrong or something/?? idk I'm probably just making a dumb error somewhere

  let date1 = new Date()
  let date2 = new Date(strChosenDate)
  var isLess = +date2 > date1.setDate(date1.getDate() - 14)
  return isLess
}

// is this date in the future?
export const dateInFuture = (strChosenDate) => {
  let date1 = new Date()
  let date2 = new Date(strChosenDate)
  var isGreater = +date2 > date1.setDate(date1.getDate() + 1)
  return isGreater
}
