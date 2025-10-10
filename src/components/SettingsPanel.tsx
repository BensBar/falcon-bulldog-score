import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Bell, Football } from '@phosphor-icons/react'
import { type AlertSettings } from '@/hooks/useGameMonitor'

interface SettingsPanelProps {
  settings: AlertSettings
  onSettingsChange: (settings: AlertSettings) => void
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const handleToggle = (key: keyof AlertSettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key]
    })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={24} weight="fill" className="text-primary" />
        <h2 className="text-xl font-semibold">Alert Settings</h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        Choose which game events trigger audio and visual alerts
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="touchdown" className="text-base font-medium cursor-pointer">
              Touchdowns
            </Label>
            <p className="text-sm text-muted-foreground">6 points scored</p>
          </div>
          <Switch
            id="touchdown"
            checked={settings.touchdown}
            onCheckedChange={() => handleToggle('touchdown')}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="fieldGoal" className="text-base font-medium cursor-pointer">
              Field Goals
            </Label>
            <p className="text-sm text-muted-foreground">3 points scored</p>
          </div>
          <Switch
            id="fieldGoal"
            checked={settings.fieldGoal}
            onCheckedChange={() => handleToggle('fieldGoal')}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="firstDown" className="text-base font-medium cursor-pointer">
              First Downs
            </Label>
            <p className="text-sm text-muted-foreground">New set of downs</p>
          </div>
          <Switch
            id="firstDown"
            checked={settings.firstDown}
            onCheckedChange={() => handleToggle('firstDown')}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="safety" className="text-base font-medium cursor-pointer">
              Safeties
            </Label>
            <p className="text-sm text-muted-foreground">2 points scored</p>
          </div>
          <Switch
            id="safety"
            checked={settings.safety}
            onCheckedChange={() => handleToggle('safety')}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="opponentThirdLong" className="text-base font-medium cursor-pointer">
              Opponent 3rd & Long
            </Label>
            <p className="text-sm text-muted-foreground">Defense in control</p>
          </div>
          <Switch
            id="opponentThirdLong"
            checked={settings.opponentThirdLong}
            onCheckedChange={() => handleToggle('opponentThirdLong')}
          />
        </div>
      </div>
    </Card>
  )
}
