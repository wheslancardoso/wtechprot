'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface FollowUp {
    id: string
    order_id: string
    customer_id: string | null
    type: 'post_delivery' | 'warranty_check' | 'warranty_expiring' | 'manual'
    status: 'pending' | 'completed' | 'skipped'
    scheduled_for: string
    completed_at: string | null
    skipped_at: string | null
    notes: string | null
    created_at: string
    order: {
        display_id: string
        warranty_end_date: string | null
        equipment: {
            brand: string | null
            model: string | null
        } | null
        customer: {
            name: string
            phone: string | null
        } | null
    } | null
}

export interface FollowUpStats {
    activeWarranties: number
    pendingToday: number
    expiringIn7Days: number
    completedThisWeek: number
}

// Get follow-ups with filters
export async function getFollowUps(filter: 'pending' | 'completed' | 'all' = 'pending'): Promise<FollowUp[]> {
    const supabase = await createAdminClient()

    let query = supabase
        .from('follow_ups')
        .select(`
            id,
            order_id,
            customer_id,
            type,
            status,
            scheduled_for,
            completed_at,
            skipped_at,
            notes,
            created_at,
            order:orders(
                display_id,
                warranty_end_date,
                equipment:equipment(brand, model),
                customer:customers(name, phone)
            )
        `)
        .order('scheduled_for', { ascending: true })

    if (filter === 'pending') {
        query = query.eq('status', 'pending')
    } else if (filter === 'completed') {
        query = query.in('status', ['completed', 'skipped'])
    }

    const { data, error } = await query.limit(100)

    if (error) {
        console.error('Error fetching follow-ups:', JSON.stringify(error, null, 2))
        return []
    }

    return (data as unknown as FollowUp[]) || []
}

// Get active warranties
export async function getActiveWarranties() {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
        .from('orders')
        .select(`
            id,
            display_id,
            warranty_start_date,
            warranty_end_date,
            finished_at,
            equipment:equipment(brand, model),
            customer:customers(name, phone)
        `)
        .eq('status', 'finished')
        .not('warranty_end_date', 'is', null)
        .gte('warranty_end_date', new Date().toISOString())
        .order('warranty_end_date', { ascending: true })
        .limit(100)

    if (error) {
        console.error('Error fetching warranties:', JSON.stringify(error, null, 2))
        return []
    }

    return data || []
}

// Get stats
export async function getFollowUpStats(): Promise<FollowUpStats> {
    const supabase = await createAdminClient()
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Active warranties
    const { count: activeWarranties } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'finished')
        .gte('warranty_end_date', now.toISOString())

    // Pending today or overdue
    const { count: pendingToday } = await supabase
        .from('follow_ups')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lte('scheduled_for', today)

    // Warranties expiring in 7 days
    const { count: expiringIn7Days } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'finished')
        .gte('warranty_end_date', now.toISOString())
        .lte('warranty_end_date', in7Days)

    // Completed this week
    const { count: completedThisWeek } = await supabase
        .from('follow_ups')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_at', weekAgo)

    return {
        activeWarranties: activeWarranties || 0,
        pendingToday: pendingToday || 0,
        expiringIn7Days: expiringIn7Days || 0,
        completedThisWeek: completedThisWeek || 0
    }
}

// Complete a follow-up
export async function completeFollowUp(id: string, notes?: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createAdminClient()

    const { error } = await supabase
        .from('follow_ups')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            notes: notes || null,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        console.error('Error completing follow-up:', error)
        return { success: false, error: 'Erro ao marcar follow-up.' }
    }

    revalidatePath('/dashboard/follow-ups')
    return { success: true }
}

// Skip a follow-up
export async function skipFollowUp(id: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createAdminClient()

    const { error } = await supabase
        .from('follow_ups')
        .update({
            status: 'skipped',
            skipped_at: new Date().toISOString(),
            notes: reason || null,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        console.error('Error skipping follow-up:', error)
        return { success: false, error: 'Erro ao pular follow-up.' }
    }

    revalidatePath('/dashboard/follow-ups')
    return { success: true }
}

// Create manual follow-up
export async function createFollowUp(
    orderId: string,
    scheduledFor: string,
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createAdminClient()

    // Get customer_id from order
    const { data: order } = await supabase
        .from('orders')
        .select('customer_id')
        .eq('id', orderId)
        .single()

    const { error } = await supabase
        .from('follow_ups')
        .insert({
            order_id: orderId,
            customer_id: order?.customer_id,
            type: 'manual',
            status: 'pending',
            scheduled_for: scheduledFor,
            notes: notes || null
        })

    if (error) {
        console.error('Error creating follow-up:', error)
        return { success: false, error: 'Erro ao criar lembrete.' }
    }

    revalidatePath('/dashboard/follow-ups')
    return { success: true }
}
