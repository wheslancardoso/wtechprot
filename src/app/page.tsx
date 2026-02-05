import { BusinessLanding } from "@/components/landing/business-landing"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "WFIX Tech | Consultoria e Gestão de TI para Empresas",
  description: "Especizalistas em gestão de ciclo de vida de ativos, infraestrutura de redes e suporte técnico corporativo para PMEs.",
}

export default function Home() {
  return <BusinessLanding />
}
