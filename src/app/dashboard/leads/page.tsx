import { getLeads } from "@/app/actions/leads"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mail, Briefcase, Monitor } from "lucide-react"
import Link from "next/link"

export default async function LeadsPage() {
    const leads = await getLeads()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leads Corporativos</h1>
                    <p className="text-muted-foreground">Gerencie as solicitações vindas da página para empresas.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {leads.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            Nenhum lead recebido ainda.
                        </CardContent>
                    </Card>
                ) : (
                    leads.map((lead: any) => (
                        <Card key={lead.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/50 pb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            {lead.name}
                                            {lead.status === 'new' && <Badge>Novo</Badge>}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <Briefcase className="w-3 h-3" />
                                            {lead.company_name || "Sem Empresa"}
                                            <span className="text-slate-300 mx-1">|</span>
                                            <Monitor className="w-3 h-3" />
                                            {lead.device_count} Computadores
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" asChild>
                                            <Link href={`https://api.whatsapp.com/send?phone=55${lead.phone.replace(/\D/g, '')}`} target="_blank">
                                                <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                                                WhatsApp
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 grid md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Contato</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="w-3 h-3" /> {lead.email || "-"}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MessageCircle className="w-3 h-3" /> {lead.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm mt-2">
                                        <Badge variant="outline">{new Date(lead.created_at).toLocaleDateString('pt-BR')} às {new Date(lead.created_at).toLocaleTimeString('pt-BR')}</Badge>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Interesse / Mensagem</p>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {lead.service_interest?.map((interest: string) => (
                                            <Badge key={interest} variant="secondary" className="text-xs">{interest}</Badge>
                                        ))}
                                    </div>
                                    <p className="text-sm bg-muted/30 p-3 rounded-md italic">
                                        "{lead.message || "Sem mensagem"}"
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
