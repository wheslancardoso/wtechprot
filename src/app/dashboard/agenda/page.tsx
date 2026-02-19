import { getSchedules, getScheduleSettings } from '@/app/actions/schedules/schedule-actions'
import { ScheduleDashboardClient } from './schedule-dashboard-client'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Agenda',
}

export default async function AgendaPage() {
    const [schedules, settings] = await Promise.all([
        getSchedules(),
        getScheduleSettings(),
    ])

    return (
        <ScheduleDashboardClient
            initialSchedules={schedules}
            initialSettings={settings}
        />
    )
}
