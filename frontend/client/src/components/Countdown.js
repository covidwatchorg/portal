import React, { useState, useEffect } from 'react'
import Clock from '../../assets/clock.svg'

const Countdown = (props) => {
  const [timeLeft, setTimeLeft] = useState(60)

  useEffect(() => {
    timeLeft > 0 &&
      setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 60000)
  }, [timeLeft])

  return (
    <div id="share-urgently">
      <img src={Clock}></img>
      <div>Share the code ASAP. &nbsp;</div>
      {timeLeft > 0 ? (
        <span>
          It will expire in {timeLeft} min at {props.expirationTime}
        </span>
      ) : (
        <span>Code expired after 60 minutes - generate new code.</span>
      )}
    </div>
  )
}

export default Countdown
