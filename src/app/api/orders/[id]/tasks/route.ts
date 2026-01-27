import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { ExecutionTask } from '@/lib/execution-tasks-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createAdminClient()

        const { data, error } = await supabase
            .from('orders')
            .select('execution_tasks')
            .eq('id', id)
            .single()

        if (error) {
            console.error('API Error fetching tasks:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const tasks = (data?.execution_tasks || []) as ExecutionTask[]
        return NextResponse.json(
            { tasks },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            }
        )
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
