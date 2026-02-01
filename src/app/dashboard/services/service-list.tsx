'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Pencil, Trash2, Plus, Search } from 'lucide-react'
import type { ServiceCatalogItem } from '@/types/service-catalog'
import { deleteService } from './actions'
import ServiceModal from './service-modal'

interface ServiceListProps {
    initialServices: ServiceCatalogItem[]
}

export default function ServiceList({ initialServices }: ServiceListProps) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingService, setEditingService] = useState<ServiceCatalogItem | null>(null)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    // Filter services locally
    const filteredServices = initialServices.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleEdit = (service: ServiceCatalogItem) => {
        setEditingService(service)
        setIsModalOpen(true)
    }

    const handleCreate = () => {
        setEditingService(null)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este serviço?')) return

        setIsDeleting(id)
        try {
            await deleteService(id)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Erro ao excluir serviço')
        } finally {
            setIsDeleting(null)
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar serviços..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button onClick={handleCreate} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Novo Serviço
                </Button>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Serviço</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Faixa de Preço</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredServices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Nenhum serviço encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredServices.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell className="font-medium">
                                        <div>{service.name}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                                            {service.description}
                                        </div>
                                    </TableCell>
                                    <TableCell>{service.category}</TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium">
                                            {formatCurrency(Number(service.price_min))} - {formatCurrency(Number(service.price_max))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={service.active ? 'default' : 'secondary'}>
                                            {service.active ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <ServiceActions service={service} onEdit={handleEdit} onDelete={handleDelete} isDeleting={isDeleting} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {filteredServices.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">Nenhum serviço encontrado.</div>
                )}
                {filteredServices.map((service) => (
                    <Card key={service.id}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-medium leading-none">
                                    {service.name}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">{service.category}</p>
                            </div>
                            <ServiceActions service={service} onEdit={handleEdit} onDelete={handleDelete} isDeleting={isDeleting} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground mb-4 line-clamp-3">
                                {service.description}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-bold">
                                    {formatCurrency(Number(service.price_min))} - {formatCurrency(Number(service.price_max))}
                                </div>
                                <Badge variant={service.active ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                                    {service.active ? 'Ativo' : 'Inativo'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <ServiceModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                serviceToEdit={editingService}
            />
        </div>
    )
}


function ServiceActions({ service, onEdit, onDelete, isDeleting }: {
    service: ServiceCatalogItem,
    onEdit: (s: ServiceCatalogItem) => void,
    onDelete: (id: string) => void,
    isDeleting: string | null
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(service)}>
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => onDelete(service.id)}
                    disabled={isDeleting === service.id}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting === service.id ? 'Excluindo...' : 'Excluir'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
