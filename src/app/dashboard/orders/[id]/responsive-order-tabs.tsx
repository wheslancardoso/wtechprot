'use client'

import * as React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ResponsiveOrderTabsProps {
    defaultValue?: string
    children: React.ReactNode
}

export function ResponsiveOrderTabs({
    defaultValue = 'overview',
    children
}: ResponsiveOrderTabsProps) {
    const [activeTab, setActiveTab] = React.useState(defaultValue)

    // Map tab values to labels for the Select display
    const tabLabels: Record<string, string> = {
        overview: 'Visão Geral',
        technical: 'Técnico',
        execution: 'Execução',
        telemetry: 'Hardware & Telemetria',
        evidence: 'Anexos & Evidências',
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            {/* Mobile Navigation (Select) */}
            <div className="md:hidden w-full">
                <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma seção" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="overview">Visão Geral</SelectItem>
                        <SelectItem value="technical">Técnico</SelectItem>
                        <SelectItem value="execution">Execução</SelectItem>
                        <SelectItem value="telemetry">Hardware & Telemetria</SelectItem>
                        <SelectItem value="evidence">Anexos & Evidências</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Desktop Navigation (TabsList) */}
            <div className="hidden md:block w-full overflow-x-auto">
                <TabsList className="inline-flex w-max min-w-full bg-muted/50 p-1 border justify-start">
                    <TabsTrigger value="overview" className="px-4">Visão Geral</TabsTrigger>
                    <TabsTrigger value="technical" className="px-4">Técnico</TabsTrigger>
                    <TabsTrigger value="execution" className="px-4">Execução</TabsTrigger>
                    <TabsTrigger value="telemetry" className="px-4">Hardware</TabsTrigger>
                    <TabsTrigger value="evidence" className="px-4">Anexos</TabsTrigger>
                </TabsList>
            </div>

            {/* Content Slot */}
            {children}
        </Tabs>
    )
}
