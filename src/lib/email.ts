import { Resend } from 'resend';

// Verifica a chave do Resend no momento da instância
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_builds');

// O e-mail Remetente autorizado no painel do Resend
// Ex: Se o domínio wfixtech.com.br for validado, usarremos agendamentos@wfixtech.com.br
const SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL || 'agendamentos@wfixtech.com.br';

// O seu e-mail pessoal/profissional que receberá os alertas
const RECEIVER_EMAIL = process.env.ALERTS_RECEIVER_EMAIL || 'wfixtech.contato@gmail.com';

interface ScheduleAlertParams {
    customerName: string;
    customerPhone: string;
    scheduledDate: string;
    scheduledTime: string;
    serviceNotes?: string | null;
}

/**
 * Dispara um e-mail de alerta interno quando um novo agendamento for confirmado pelo cliente.
 */
export async function sendScheduleConfirmationAlert({
    customerName,
    customerPhone,
    scheduledDate,
    scheduledTime,
    serviceNotes
}: ScheduleAlertParams) {
    // Caso não exista a Key de produção, podemos logar e abortar
    if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ Alerta de Agenda: API_KEY do Resend não configurada. E-mail não enviado.');
        return { success: false, error: 'Chave do Resend não encontrada.' };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: `WFIX Tech Agenda <${SENDER_EMAIL}>`,
            to: RECEIVER_EMAIL,
            subject: `🚨 Novo Agendamento: ${customerName} - ${scheduledDate}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-w-md; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #059669; color: white; padding: 16px; text-align: center;">
                        <h2 style="margin: 0; font-size: 20px;">Novo Agendamento Confirmado! 🎉</h2>
                    </div>
                    
                    <div style="padding: 24px;">
                        <p style="font-size: 16px; margin-bottom: 20px;">
                            Um cliente acabou de confirmar um horário na sua agenda.
                        </p>
                        
                        <div style="background-color: #f3f4f6; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
                            <p style="margin: 0 0 10px 0;"><strong>👤 Cliente:</strong> ${customerName}</p>
                            <p style="margin: 0 0 10px 0;"><strong>📱 WhatsApp:</strong> ${customerPhone}</p>
                            <p style="margin: 0 0 10px 0;"><strong>📅 Data:</strong> ${scheduledDate}</p>
                            <p style="margin: 0 0 10px 0;"><strong>⏰ Horário:</strong> ${scheduledTime}</p>
                            ${serviceNotes ? `<p style="margin: 0; border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 10px;"><strong>📝 Observação:</strong> ${serviceNotes}</p>` : ''}
                        </div>
                        
                        <a href="https://wfixtech.com.br/dashboard/agenda" style="display: block; width: 100%; text-align: center; background-color: #10b981; color: white; text-decoration: none; padding: 12px 0; border-radius: 6px; font-weight: bold;">
                            Ver Painel da Agenda
                        </a>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error('Resend Error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err) {
        console.error('Email Dispatch Error:', err);
        return { success: false, error: 'Erro interno ao despachar e-mail.' };
    }
}
