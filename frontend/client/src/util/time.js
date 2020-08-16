// Takes a javascript date object and converts it to a string in the form of yyyy-mm-dd
export const toDashSeperatedYYYYMMDDString = (date) => {
  return date.toJSON().substring(0, 10)
}

// Returns string of the browser's current default timezone
// ex: "Mountain Daylight Time"
export const getDefaultTimezoneString = () => {
  return /\((.*)\)/.exec(new Date().toString())[1]
}

// Generates a string formatted to be displayed to the user one hour ahead of the current time
// ex: "1:29 AM Pacific Daylight Time"
export const getOneHourAheadDisplayString = () => {
  // declaring new Date() here instead of passing in the code generation time stamp as they should be within 60 seconds of each other and second precision here is not necessary

  const now = new Date()
  const ahead = new Date(now.setHours(now.getHours() + 1))
  let hours = ahead.getHours()
  let amPM = 'AM'

  if (12 < hours && hours < 24) {
    hours = hours - 12
    amPM = 'PM'
  } else if (hours === 0) {
    hours = 12
  } else if (hours === 12) {
    hours = 12
    amPM = 'PM'
  }

  hours = hours.toString()
  let mins = ahead.getMinutes().toString()

  if (mins.length === 1) {
    mins = '0' + mins
  }
  const timezone = getDefaultTimezoneString()
  return hours + ':' + mins + ' ' + amPM + ' ' + timezone
}

// getFourteenDaysAgo generates a string formatted date fourteen days ago from present day
// ex: "2020-07-02"
export const getFourteenDaysAgoString = () => {
  var ourDate = new Date()

  //Change date picker minimum to be 14 days in the past.
  var pastDate = ourDate.getDate() - 13
  ourDate.setDate(pastDate)

  return toDashSeperatedYYYYMMDDString(ourDate)
}

export const getFourteenDaysAgoDate = () => {
  var ourDate = new Date()

  //Change date picker minimum to be 14 days in the past.
  var pastDate = ourDate.getDate() - 13
  ourDate.setDate(pastDate)
  return ourDate
}

// gets today's date as a string formatted as yyyy-mm-dd
export const getTodayString = () => {
  return toDashSeperatedYYYYMMDDString(new Date())
}

// Converts a local yyyy-mm-dd date string to zero UTC offset yyyy-mm-dd date string
export const localStringToZeroUTCOffsetString = (localDateString) => {
  const localDate = new Date(localDateString)
  // toISOString returns date string with zero UTC offset
  return localDate.toISOString().substring(0, 10)
}
