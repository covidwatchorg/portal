export const getOneHourAhead = () => {
  // this function generates a string of time one hour ahead of the current time
  // ex: "1:29 AM Pacific Daylight Time"
  // declaring new Date() here instead of passing in the code generation time stamp as they should be within 60 seconds of each other and second precision here is not necessary
  const now = new Date()
  const ahead = new Date(now.setHours(now.getHours() + 1))
  let hours = ahead.getHours()
  let amPM = 'AM'

  if (hours > 12) {
    hours = hours - 12;
    amPM = 'PM';
  }

  hours = hours.toString()
  let mins = ahead.getMinutes().toString()

  if (mins.length === 1) {
    mins = "0" + mins;
  }
  const timezone = /\((.*)\)/.exec(ahead.toString())[1]

  return hours + ':' + mins + ' ' + amPM + ' ' + timezone
}

// getFourteenDaysAgo generates a string formatted date fourteen days ago from present day
// ex: "2020-07-02"
export const getFourteenDaysAgo = () => {
  var ourDate = new Date();

  //Change date picker minimum to be 14 days in the past.
  var pastDate = ourDate.getDate() - 14;
  ourDate.setDate(pastDate);

  return getDay(ourDate)
}

// getDay generates a string formatted date 
// ex: "2020-07-16"
export const getDay = (now = new Date()) => {
  const year = now.getFullYear().toString()
  let month = (now.getMonth() + 1).toString()

  if (month.length === 1) {
    month = "0" + month;
  }

  let day = now.getDate().toString()

  if (day.length === 1) {
    day = "0" + day;
  }

  return year + "-" + month + "-" + day
}



