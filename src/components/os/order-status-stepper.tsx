"use client"

import { Check, Clock, Package, Play, Wrench, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

type OrderStatus = 'open' | 'analyzing' | 'waiting_approval' | 'waiting_parts' | 'in_progress' | 'ready' | 'finished' | 'canceled'

interface OrderStatusStepperProps {
    currentStatus: string
    className?: string
}

export function OrderStatusStepper({ currentStatus, className }: OrderStatusStepperProps) {
    const steps = [
        { id: 'open', label: 'Recebido', icon: Clock },
        { id: 'analyzing', label: 'Análise', icon: Play },
        { id: 'approval_stage', label: 'Aprovação', icon: CheckCircle2, match: ['waiting_approval'] },
        { id: 'execution_stage', label: 'Execução', icon: Wrench, match: ['waiting_parts', 'in_progress'] },
        { id: 'ready_stage', label: 'Pronto', icon: Package, match: ['ready', 'finished'] }
    ]

    // Determine current active step index
    const getStepIndex = (status: string) => {
        if (status === 'canceled') return -1

        // Direct match
        const directIndex = steps.findIndex(s => s.id === status)
        if (directIndex !== -1) return directIndex

        // Group match
        const groupIndex = steps.findIndex(s => s.match?.includes(status))
        if (groupIndex !== -1) return groupIndex

        return 0
    }

    const currentIndex = getStepIndex(currentStatus)
    const isCanceled = currentStatus === 'canceled'

    if (isCanceled) {
        return (
            <div className={cn("w-full bg-red-950/20 border border-red-900/50 rounded-lg p-4 text-center", className)}>
                <span className="text-red-500 font-bold flex items-center justify-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    Ordem de Serviço Cancelada
                </span>
            </div>
        )
    }

    return (
        <div className={cn("w-full py-4", className)}>
            <div className="relative flex items-center justify-between">
                {/* Connecting Line Background */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full -z-10" />

                {/* Active Line Progress */}
                <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full -z-10 transition-all duration-500"
                />

                {steps.map((step, index) => {
                    const isActive = index <= currentIndex
                    const isCurrent = index === currentIndex
                    const Icon = step.icon

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 relative group">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.1 : 1,
                                    backgroundColor: isActive ? "hsl(var(--primary))" : "hsl(var(--muted))",
                                    borderColor: isActive ? "hsl(var(--primary))" : "hsl(var(--border))"
                                }}
                                className={cn(
                                    "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 z-10",
                                    isActive ? "text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]" : "text-muted-foreground bg-slate-900"
                                )}
                            >
                                {isActive ? (
                                    <Icon className="w-4 h-4 md:w-5 md:h-5 " />
                                ) : (
                                    <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>
                                )}
                            </motion.div>

                            <span className={cn(
                                "absolute top-12 text-[10px] md:text-xs font-medium whitespace-nowrap transition-colors duration-300",
                                isActive ? "text-primary" : "text-muted-foreground",
                                isCurrent && "font-bold scale-105"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Status Context Helper (Mobile friendly text below steps) */}
            <div className="mt-8 text-center md:hidden">
                <span className="text-xs text-muted-foreground">
                    Status atual: <strong className="text-primary">{steps[currentIndex]?.label || 'Desconhecido'}</strong>
                </span>
            </div>
        </div>
    )
}
