import React, { useEffect } from 'react'
import { useSound } from '../context/sound'
import Lottie from 'lottie-react'
import winAnim from '../assets/anim/win.json'
import loseAnim from '../assets/anim/lose.json'

export default function WinLoseAnimation({ result }: { result: 'win' | 'lose' }) {
  const { playPurr } = useSound()

  useEffect(() => {
    if (result === 'win') playPurr()
  }, [result, playPurr])

  const data = result === 'win' ? (winAnim as any) : (loseAnim as any)
  return (
    <div className={`rounded-xl2 p-3 ${result === 'win' ? 'bg-win/40' : 'bg-lose/40'} animate-pop`}>
      <Lottie animationData={data} loop={false} style={{ height: 96 }} />
    </div>
  )
}
