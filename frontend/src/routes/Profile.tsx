import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { useSolanaAccount } from '../hooks/useSolanaAccount'
import { clearProfile, loadProfile, saveProfile, type Profile } from '../lib/profile-store'
import * as demo from '../lib/demo-rounds'

function formatFood(lamports: bigint): string {
  // Demo formatter: treat lamports as 9 decimals
  const neg = lamports < 0n
  const v = neg ? -lamports : lamports
  const whole = v / 1_000_000_000n
  const frac = (v % 1_000_000_000n).toString().padStart(9, '0').slice(0, 3) // 3 dp
  return `${neg ? '-' : ''}${whole.toString()}.${frac} FOOD`
}

export default function ProfilePage() {
  const { address, publicKey, isConnected } = useSolanaAccount()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>(undefined)
  const [savedAt, setSavedAt] = useState<number | undefined>(undefined)
  const [status, setStatus] = useState<string>('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!address) return
    const p = loadProfile(address)
    if (p) {
      setName(p.name)
      setBio(p.bio)
      setAvatarDataUrl(p.avatarDataUrl)
      setSavedAt(p.updatedAt)
    } else {
      setName('')
      setBio('')
      setAvatarDataUrl(undefined)
      setSavedAt(undefined)
    }
  }, [address])

  const stats = useMemo(() => {
    if (!publicKey) return null
    return demo.getPlayerStats(publicKey)
  }, [publicKey])

  function onPickAvatar() {
    fileRef.current?.click()
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      setAvatarDataUrl(url)
    }
    reader.readAsDataURL(file)
  }

  function onRemoveAvatar() {
    setAvatarDataUrl(undefined)
    if (fileRef.current) fileRef.current.value = ''
  }

  function onSave() {
    if (!address) return
    const profile: Profile = {
      address,
      name,
      bio,
      avatarDataUrl,
      updatedAt: Date.now(),
    }
    saveProfile(profile)
    setSavedAt(profile.updatedAt)
    setStatus('Đã lưu hồ sơ')
    setTimeout(() => setStatus(''), 1500)
  }

  function onClear() {
    if (!address) return
    clearProfile(address)
    setName('')
    setBio('')
    setAvatarDataUrl(undefined)
    setSavedAt(undefined)
    setStatus('Đã xóa hồ sơ cục bộ')
    setTimeout(() => setStatus(''), 1500)
  }

  if (!isConnected) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Hồ sơ</CardTitle>
            <CardDescription>Kết nối ví để tạo và xem hồ sơ của bạn.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ của tôi</CardTitle>
          <CardDescription>Nhập tên, mô tả và ảnh đại diện. Lưu cục bộ.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-5 rounded-2xl border border-border bg-surface px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-border bg-surface-subtle">
                {avatarDataUrl ? (
                  <img src={avatarDataUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted">
                    <Icon name="user" className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" leftIcon="image" onClick={onPickAvatar}>
                  Tải ảnh
                </Button>
                <Button size="sm" variant="ghost" onClick={onRemoveAvatar} disabled={!avatarDataUrl}>
                  Xóa ảnh
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Tên hiển thị</span>
              <Input placeholder="Nhập tên…" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Mô tả bản thân</span>
              <Textarea placeholder="Giới thiệu ngắn…" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
            </div>
            <div className="flex gap-3">
              <Button size="lg" rightIcon="sparkles" onClick={onSave}>
                Lưu hồ sơ
              </Button>
              <Button size="lg" variant="outline" onClick={onClear}>
                Xóa hồ sơ
              </Button>
              {status ? <span className="self-center text-xs text-muted-strong">{status}</span> : null}
            </div>
            {savedAt ? (
              <p className="text-xs text-muted">Cập nhật: {new Date(savedAt).toLocaleString()}</p>
            ) : null}
          </div>

          <div className="space-y-4">
            <Card variant="solid">
              <CardHeader>
                <CardTitle>Tài sản của tôi</CardTitle>
                <CardDescription>Chỉ chủ tài khoản nhìn thấy.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-4 py-3">
                  <span>FOOD</span>
                  <span className="font-semibold text-fg">{stats ? formatFood(stats.totalPayoutLamports) : '—'}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-4 py-3">
                  <span>Mèo (thắng)</span>
                  <span className="font-semibold text-fg">{stats ? stats.wins : '—'}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Thống kê</CardTitle>
                <CardDescription>Hoạt động của bạn (demo).</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-muted">
                <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3">
                  <span>Rounds đã tham gia</span>
                  <span className="text-fg">{stats ? stats.roundsPlayed : '—'}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3">
                  <span>Đã reveal</span>
                  <span className="text-fg">{stats ? stats.revealed : '—'}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3">
                  <span>Đã claim</span>
                  <span className="text-fg">{stats ? stats.claimed : '—'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

