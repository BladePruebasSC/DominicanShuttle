import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactMessageSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MessageSquare, MapPin, Send, Check } from "lucide-react";
import { CONTACT_SERVICES, COMPANY_INFO } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { InsertContactMessage } from "@shared/schema";

export default function ContactSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertContactMessage>({
    resolver: zodResolver(insertContactMessageSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      serviceInterest: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContactMessage) => {
      return await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Mensaje enviado",
        description: "Gracias por contactarnos. Te responderemos pronto.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
      });
    },
  });

  const onSubmit = (data: InsertContactMessage) => {
    contactMutation.mutate(data);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Teléfono",
      value: COMPANY_INFO.phone,
      detail: "Disponible 24/7",
      href: `tel:${COMPANY_INFO.phone}`,
    },
    {
      icon: Mail,
      title: "Email",
      value: COMPANY_INFO.email,
      detail: "Respuesta en 2 horas",
      href: `mailto:${COMPANY_INFO.email}`,
    },
    {
      icon: MessageSquare,
      title: "WhatsApp",
      value: COMPANY_INFO.phone,
      detail: "Respuesta inmediata",
      href: `https://wa.me/${COMPANY_INFO.whatsapp}`,
    },
    {
      icon: MapPin,
      title: "Cobertura",
      value: "Toda República Dominicana",
      detail: COMPANY_INFO.coverage.join(", "),
    },
  ];

  const benefits = [
    "5+ años de experiencia",
    "Conductores certificados y bilingües",
    "Vehículos modernos y seguros",
    "Seguros de responsabilidad civil",
    "Precios transparentes sin sorpresas",
    "Soporte 24/7 en español e inglés",
  ];

  return (
    <section className="py-20 bg-void relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-coco-gold text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">
            CONTACTO
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
            Contáctanos
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-3xl mx-auto">
            ¿Tienes preguntas? Nuestro equipo está aquí para ayudarte 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="shadow-lg glass-panel border-white/10">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-2xl text-white font-serif">
                Envíanos un Mensaje
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-transparent">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Nombre</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Tu nombre"
                              {...field}
                              className="bg-void/50 border-white/10 text-white placeholder:text-gray-500 focus:border-coco-gold"
                              data-testid="input-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="tu@email.com"
                              {...field}
                              className="bg-void/50 border-white/10 text-white placeholder:text-gray-500 focus:border-coco-gold"
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Teléfono</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+1 (xxx) xxx-xxxx"
                            {...field}
                            className="bg-void/50 border-white/10 text-white placeholder:text-gray-500 focus:border-coco-gold"
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceInterest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">
                          Servicio de Interés
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger
                              className="bg-void/50 border-white/10 text-white focus:border-coco-gold"
                              data-testid="select-service"
                            >
                              <SelectValue placeholder="Selecciona un servicio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-void border-white/10">
                            {CONTACT_SERVICES.map((service) => (
                              <SelectItem
                                key={service.value}
                                value={service.value}
                                className="text-white hover:bg-coco-gold/20"
                              >
                                {service.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Mensaje</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder="Cuéntanos sobre tu viaje..."
                            {...field}
                            className="bg-void/50 border-white/10 text-white placeholder:text-gray-500 focus:border-coco-gold"
                            data-testid="textarea-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-coco-gold hover:text-black transition font-bold uppercase text-xs tracking-[0.2em]"
                    size="lg"
                    disabled={contactMutation.isPending}
                    data-testid="button-send-message"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {contactMutation.isPending ? "Enviando..." : "Enviar Mensaje"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            <Card className="shadow-lg glass-panel border-white/10">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-2xl text-white font-serif">
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 bg-transparent">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start"
                      data-testid={`contact-info-${index}`}
                    >
                      <div className="border border-coco-gold/30 bg-void/50 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                        <IconComponent className="w-6 h-6 text-coco-gold" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{info.title}</h4>
                        {info.href ? (
                          <a
                            href={info.href}
                            className="text-coco-gold hover:text-coco-gold/80 transition"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-gray-300">{info.value}</p>
                        )}
                        <p className="text-sm text-gray-500">{info.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="shadow-lg glass-panel border-white/10">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-xl text-white font-serif">
                  ¿Por Qué Elegirnos?
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-transparent">
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="flex items-center text-gray-300"
                    >
                      <Check className="w-5 h-5 mr-3 text-coco-gold" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
