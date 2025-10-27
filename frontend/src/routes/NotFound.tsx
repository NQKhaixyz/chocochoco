import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center justify-center py-16">
      <Card className="w-full text-center">
        <CardHeader>
          <CardTitle>404 — Lost in the candy forest</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted">
            Trang bạn tìm không tồn tại. Quay lại home để tiếp tục commit cùng mèo nhé.
          </p>
          <Link to="/">
            <Button size="lg" leftIcon="cat">
              Về trang chính
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
