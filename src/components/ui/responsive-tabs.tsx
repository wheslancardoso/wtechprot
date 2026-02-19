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
import { cn } from '@/lib/utils'

interface TabItem {
    value: string
    label: React.ReactNode
}

interface ResponsiveTabsProps {
    defaultValue: string
    items: TabItem[]
    children: React.ReactNode
    className?: string
}

export function ResponsiveTabs({
    defaultValue,
    items,
    children,
    className
}: ResponsiveTabsProps) {
    const [activeTab, setActiveTab] = React.useState(defaultValue)

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className={cn("w-full space-y-6", className)}>
            {/* Mobile Navigation (Select) */}
            <div className="md:hidden w-full">
                <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma seção" />
                    </SelectTrigger>
                    <SelectContent>
                        {items.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Desktop Navigation (TabsList) */}
            <div className="hidden md:block w-full overflow-x-auto">
                <TabsList className="inline-flex w-max min-w-full bg-muted/50 p-1 border justify-start">
                    {items.map((item) => (
                        <TabsTrigger key={item.value} value={item.value} className="px-4">
                            {item.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>

            {/* Content Slot */}
            {children}
        </Tabs>
    )
}
