'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    getSettings,
    updateStoreInfo,
    updateFinancialSettings,
    updateLogo,
    getSecurityLogs,
    type TenantSettings,
} from './actions'
import { createClient } from '@/lib/supabase/client'
import { useSettings } from '@/components/settings-provider'

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

// Icons
import {
    Settings,
    Store,
    CreditCard,
    Shield,
    Save,
    Loader2,
    CheckCircle,
    AlertCircle,
    Upload,
    Image as ImageIcon,
} from 'lucide-react'

// ==================================================
// Schemas
// ==================================================
const storeSchema = z.object({
    trade_name: z.string().min(2, 'Nome obrigatório'),
    legal_document: z.string().optional(),
    os_prefix: z.string().min(2, 'Mínimo 2 caracteres').max(3, 'Máximo 3 caracteres').regex(/^[A-Z0-9]+$/, 'Apenas letras maiúsculas e números').optional(),
    phone: z.string().optional(),
    email: z.string().email('E-mail inválido').or(z.literal('')).optional(),
    address_street: z.string().optional(),
    address_number: z.string().optional(),
    address_neighborhood: z.string().optional(),
    address_city: z.string().optional(),
    address_state: z.string().optional(),
    address_zip: z.string().optional(),
})

const financialSchema = z.object({
    pix_key: z.string().optional(),
    pix_key_type: z.enum(['cpf', 'cnpj', 'email', 'phone', 'random']).optional(),
    mei_limit_annual: z.number().min(0),
})

// ==================================================
// MEI Presets
// ==================================================
const MEI_PRESETS = [
    { value: 81000, label: 'MEI Atual (R$ 81.000)', description: 'Limite vigente' },
    { value: 140000, label: 'Super MEI - PLP 108 (R$ 140.000)', description: 'Proposta em tramitação' },
    { value: 150000, label: 'Super MEI - PLP 60 (R$ 150.000)', description: 'Proposta em tramitação' },
]

// ==================================================
// Component
// ==================================================
export default function SettingsPage() {
    const [settings, setSettings] = useState<TenantSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [logs, setLogs] = useState<Array<{
        id: string
        order_id: string
        previous_status: string | null
        new_status: string
        formatted_date: string
    }>>([])
    const [uploadingLogo, setUploadingLogo] = useState(false)

    const supabase = createClient()
    const { refresh } = useSettings()

    // Store Form
    const storeForm = useForm({
        resolver: zodResolver(storeSchema),
        defaultValues: {
            trade_name: '',
            legal_document: '',
            os_prefix: 'WT',
            phone: '',
            email: '',
            address_street: '',
            address_number: '',
            address_neighborhood: '',
            address_city: '',
            address_state: '',
            address_zip: '',
        },
    })

    // Financial Form
    const financialForm = useForm({
        resolver: zodResolver(financialSchema),
        defaultValues: {
            pix_key: '',
            pix_key_type: undefined as 'cpf' | 'cnpj' | 'email' | 'phone' | 'random' | undefined,
            mei_limit_annual: 81000,
        },
    })

    // Load settings
    useEffect(() => {
        async function loadSettings() {
            setLoading(true)
            const result = await getSettings()

            if (result.success && result.data) {
                setSettings(result.data)

                // Populate store form
                storeForm.reset({
                    trade_name: result.data.trade_name,
                    legal_document: result.data.legal_document || '',
                    os_prefix: result.data.os_prefix || 'WT',
                    phone: result.data.phone || '',
                    email: result.data.email || '',
                    address_street: result.data.address?.street || '',
                    address_number: result.data.address?.number || '',
                    address_neighborhood: result.data.address?.neighborhood || '',
                    address_city: result.data.address?.city || '',
                    address_state: result.data.address?.state || '',
                    address_zip: result.data.address?.zip || '',
                })

                // Populate financial form
                financialForm.reset({
                    pix_key: result.data.pix_key || '',
                    pix_key_type: result.data.pix_key_type || undefined,
                    mei_limit_annual: result.data.mei_limit_annual,
                })
            }

            // Load logs
            const logsResult = await getSecurityLogs()
            if (logsResult.success) {
                setLogs(logsResult.data || [])
            }

            setLoading(false)
        }

        loadSettings()
    }, [])

    // Save store info
    async function onSaveStore(data: z.infer<typeof storeSchema>) {
        setFeedback(null)
        const result = await updateStoreInfo({
            trade_name: data.trade_name,
            legal_document: data.legal_document,
            os_prefix: data.os_prefix,
            phone: data.phone,
            email: data.email,
            address: {
                street: data.address_street,
                number: data.address_number,
                neighborhood: data.address_neighborhood,
                city: data.address_city,
                state: data.address_state,
                zip: data.address_zip,
            },
        })

        setFeedback({
            type: result.success ? 'success' : 'error',
            message: result.message,
        })

        if (result.success) {
            await refresh()
        }
    }

    // Save financial
    async function onSaveFinancial(data: z.infer<typeof financialSchema>) {
        setFeedback(null)
        const result = await updateFinancialSettings({
            pix_key: data.pix_key,
            pix_key_type: data.pix_key_type,
            mei_limit_annual: data.mei_limit_annual,
        })

        setFeedback({
            type: result.success ? 'success' : 'error',
            message: result.message,
        })
    }

    // Upload logo
    async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingLogo(true)
        setFeedback(null)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `logo-${Date.now()}.${fileExt}`

            const { data, error } = await supabase.storage
                .from('company-assets')
                .upload(fileName, file, { upsert: true })

            if (error) throw error

            const { data: urlData } = supabase.storage
                .from('company-assets')
                .getPublicUrl(data.path)

            const result = await updateLogo(urlData.publicUrl)

            if (result.success) {
                setSettings(prev => prev ? { ...prev, logo_url: urlData.publicUrl } : null)
                setFeedback({ type: 'success', message: 'Logo atualizada!' })
            } else {
                throw new Error(result.message)
            }
        } catch (error) {
            setFeedback({
                type: 'error',
                message: `Erro no upload: ${error instanceof Error ? error.message : 'Desconhecido'}`,
            })
        } finally {
            setUploadingLogo(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Settings className="h-8 w-8" />
                    Configurações
                </h1>
                <p className="text-muted-foreground mt-1">
                    Personalize sua loja e configure parâmetros fiscais
                </p>
            </div>

            {/* Feedback */}
            {feedback && (
                <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
                    {feedback.type === 'success' ? (
                        <CheckCircle className="h-4 w-4" />
                    ) : (
                        <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>{feedback.message}</AlertDescription>
                </Alert>
            )}

            {/* Tabs */}
            <Tabs defaultValue="store" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="store" className="gap-2">
                        <Store className="h-4 w-4" />
                        Minha Loja
                    </TabsTrigger>
                    <TabsTrigger value="financial" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        Financeiro & Pix
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Shield className="h-4 w-4" />
                        Segurança
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Minha Loja */}
                <TabsContent value="store">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Logo */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Logo</CardTitle>
                                <CardDescription>
                                    Sua marca nos documentos e PDFs
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                                    {settings?.logo_url ? (
                                        <img
                                            src={settings.logo_url}
                                            alt="Logo"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <ImageIcon className="h-16 w-16 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="logo" className="cursor-pointer">
                                        <div className="flex items-center gap-2 justify-center p-3 border-2 border-dashed rounded-lg hover:bg-muted/50 transition">
                                            {uploadingLogo ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Upload className="h-4 w-4" />
                                            )}
                                            {uploadingLogo ? 'Enviando...' : 'Enviar Logo'}
                                        </div>
                                    </Label>
                                    <Input
                                        id="logo"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoUpload}
                                        disabled={uploadingLogo}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Form */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Dados da Loja</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={storeForm.handleSubmit(onSaveStore)} className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="trade_name">Nome Fantasia *</Label>
                                            <Input
                                                id="trade_name"
                                                {...storeForm.register('trade_name')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="legal_document">CNPJ/CPF</Label>
                                            <Input
                                                id="legal_document"
                                                {...storeForm.register('legal_document')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="os_prefix">Prefixo da OS (Ex: WT)</Label>
                                            <Input
                                                id="os_prefix"
                                                {...storeForm.register('os_prefix')}
                                                maxLength={3}
                                                placeholder="WT"
                                                className="uppercase"
                                                onChange={(e) => {
                                                    e.target.value = e.target.value.toUpperCase()
                                                    storeForm.setValue('os_prefix', e.target.value)
                                                }}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Prefixo único (Ex: 2026<b>WT</b>-001).
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Telefone/WhatsApp</Label>
                                            <Input
                                                id="phone"
                                                {...storeForm.register('phone')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">E-mail</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                {...storeForm.register('email')}
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 mt-4">
                                        <h4 className="font-medium mb-3">Endereço</h4>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="md:col-span-2 space-y-2">
                                                <Label htmlFor="address_street">Rua</Label>
                                                <Input {...storeForm.register('address_street')} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="address_number">Número</Label>
                                                <Input {...storeForm.register('address_number')} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="address_neighborhood">Bairro</Label>
                                                <Input {...storeForm.register('address_neighborhood')} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="address_city">Cidade</Label>
                                                <Input {...storeForm.register('address_city')} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="address_state">Estado</Label>
                                                <Input {...storeForm.register('address_state')} />
                                            </div>
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={storeForm.formState.isSubmitting}>
                                        {storeForm.formState.isSubmitting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        Salvar
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab: Financeiro & Pix */}
                <TabsContent value="financial">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configurações Financeiras</CardTitle>
                            <CardDescription>
                                Configure sua chave Pix e limite MEI
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={financialForm.handleSubmit(onSaveFinancial)} className="space-y-6">
                                {/* Pix */}
                                <div className="border-b pb-6">
                                    <h4 className="font-medium mb-4">Chave Pix</h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="pix_key_type">Tipo de Chave</Label>
                                            <Select
                                                value={financialForm.watch('pix_key_type')}
                                                onValueChange={(v) => financialForm.setValue('pix_key_type', v as 'cpf' | 'cnpj' | 'email' | 'phone' | 'random')}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cpf">CPF</SelectItem>
                                                    <SelectItem value="cnpj">CNPJ</SelectItem>
                                                    <SelectItem value="email">E-mail</SelectItem>
                                                    <SelectItem value="phone">Telefone</SelectItem>
                                                    <SelectItem value="random">Chave Aleatória</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="pix_key">Chave Pix</Label>
                                            <Input
                                                id="pix_key"
                                                {...financialForm.register('pix_key')}
                                                placeholder="Sua chave Pix"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* MEI Limit */}
                                <div>
                                    <h4 className="font-medium mb-4">Limite MEI Anual</h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Defina o teto de faturamento para alertas no dashboard financeiro.
                                        Prepare-se para o &quot;Super MEI&quot; que pode ser aprovado em 2026.
                                    </p>
                                    <div className="grid gap-3 md:grid-cols-3">
                                        {MEI_PRESETS.map((preset) => (
                                            <button
                                                key={preset.value}
                                                type="button"
                                                onClick={() => financialForm.setValue('mei_limit_annual', preset.value)}
                                                className={`p-4 border rounded-lg text-left transition hover:border-primary ${financialForm.watch('mei_limit_annual') === preset.value
                                                    ? 'border-primary bg-primary/10'
                                                    : ''
                                                    }`}
                                            >
                                                <p className="font-medium">{preset.label}</p>
                                                <p className="text-sm text-muted-foreground">{preset.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex items-center gap-2">
                                        <Label htmlFor="custom_limit">Ou valor personalizado:</Label>
                                        <Input
                                            id="custom_limit"
                                            type="number"
                                            className="w-40"
                                            value={financialForm.watch('mei_limit_annual')}
                                            onChange={(e) => financialForm.setValue('mei_limit_annual', Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={financialForm.formState.isSubmitting}>
                                    {financialForm.formState.isSubmitting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Salvar Configurações
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Segurança */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Logs de Atividade</CardTitle>
                            <CardDescription>
                                Últimas ações registradas no sistema (LGPD)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {logs.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    Nenhum log registrado ainda.
                                    <br />
                                    <span className="text-sm">
                                        (Execute a migration order_logs no Supabase)
                                    </span>
                                </p>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Data/Hora</TableHead>
                                                <TableHead>OS</TableHead>
                                                <TableHead>Ação</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {logs.map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="text-sm">
                                                        {log.formatted_date}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">
                                                        {log.order_id.substring(0, 8)}...
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-muted-foreground">
                                                            {log.previous_status || '—'}
                                                        </span>
                                                        {' → '}
                                                        <span className="font-medium">{log.new_status}</span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
