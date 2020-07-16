const getOneHourAhead = () => {
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
  const mins = ahead.getMinutes().toString()
  const timezone = /\((.*)\)/.exec(ahead.toString())[1]

  return hours + ':' + mins + ' ' + amPM + ' ' + timezone
}

export default getOneHourAhead
