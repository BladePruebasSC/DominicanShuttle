import type { Booking, ContactMessage } from "@shared/schema";

export interface NotificationService {
  sendBookingNotification(booking: Booking): Promise<void>;
  sendContactNotification(message: ContactMessage): Promise<void>;
}

// WhatsApp Business API simulation (in production, you would use Twilio or similar)
export class WhatsAppNotificationService implements NotificationService {
  private notificationPhone: string;

  constructor(notificationPhone: string) {
    this.notificationPhone = notificationPhone;
  }

  async sendBookingNotification(booking: Booking): Promise<void> {
    const message = this.formatBookingMessage(booking);
    await this.sendWhatsAppMessage(message);
  }

  async sendContactNotification(contactMessage: ContactMessage): Promise<void> {
    const message = this.formatContactMessage(contactMessage);
    await this.sendWhatsAppMessage(message);
  }

  private formatBookingMessage(booking: Booking): string {
    const date = booking.pickupDate.toLocaleDateString('es-DO');
    const time = booking.pickupDate.toLocaleTimeString('es-DO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return `🚗 *NUEVA RESERVA - Dominican Transport Pro*

📅 *Fecha:* ${date} a las ${time}
👥 *Pasajeros:* ${booking.passengers}
📍 *Origen:* ${booking.origin}
📍 *Destino:* ${booking.destination}
🚙 *Vehículo:* ${booking.vehicleType}
🔄 *Servicio:* ${booking.serviceType === 'round_trip' ? 'Ida y vuelta' : 'Solo ida'}
💰 *Precio:* $${booking.estimatedPrice} USD

👤 *Cliente:*
• Nombre: ${booking.customerName}
• Email: ${booking.customerEmail}
• Teléfono: ${booking.customerPhone}

${booking.specialRequests ? `📝 *Solicitudes especiales:* ${booking.specialRequests}` : ''}

#Reserva #DominicanTransport`;
  }

  private formatContactMessage(contactMessage: ContactMessage): string {
    return `📞 *NUEVO MENSAJE DE CONTACTO - Dominican Transport Pro*

👤 *Cliente:* ${contactMessage.name}
📧 *Email:* ${contactMessage.email}
${contactMessage.phone ? `📱 *Teléfono:* ${contactMessage.phone}` : ''}
🎯 *Servicio de interés:* ${contactMessage.serviceInterest}

💬 *Mensaje:*
${contactMessage.message}

⏰ *Recibido:* ${contactMessage.createdAt ? new Date(contactMessage.createdAt).toLocaleString('es-DO') : 'Ahora'}

#Contacto #DominicanTransport`;
  }

  private async sendWhatsAppMessage(message: string): Promise<void> {
    // En un entorno de producción, aquí usarías la API de WhatsApp Business (Twilio, etc.)
    // Por ahora, simularemos el envío y lo logearemos
    console.log(`📱 Enviando WhatsApp a ${this.notificationPhone}:`);
    console.log(message);
    console.log('---');

    // Simular delay de envío
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // En producción, aquí iría algo como:
    // await twilioClient.messages.create({
    //   from: 'whatsapp:+14155238886',
    //   to: `whatsapp:${this.notificationPhone}`,
    //   body: message
    // });
  }
}

// Crear instancia del servicio de notificaciones
export const notificationService = new WhatsAppNotificationService("+1 (809) 444-8800");