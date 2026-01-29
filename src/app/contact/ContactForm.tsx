'use client';

import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, MessageCircle, Linkedin, Github } from 'lucide-react';
import { useState } from 'react';

export function ContactForm() {
    const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const nome = formData.get('nome') as string;
        const cognome = formData.get('cognome') as string;
        const email = formData.get('email') as string;
        const messaggio = formData.get('messaggio') as string;

        const subject = `Contact Request from ${nome} ${cognome}`;
        const body = `Name: ${nome} ${cognome}\nEmail: ${email}\n\nMessage:\n${messaggio}`;

        const mailtoLink = `mailto:mattioli.simone.10@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoLink;
    };

    return (
        <div className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
                    <p className="text-xl text-muted-foreground">Have questions? We are here to help.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                            <p className="text-muted-foreground mb-6">Fill out the form or contact us directly.</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium">Email</p>
                                <a href="mailto:mattioli.simone.10@gmail.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    mattioli.simone.10@gmail.com
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium">WhatsApp</p>
                                <p className="text-sm text-muted-foreground">+39 334 798 5325</p>
                                <p className="text-xs text-muted-foreground italic">(Please write on WhatsApp, do not call)</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium">Location</p>
                                <p className="text-sm text-muted-foreground">Italy</p>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="pt-6 border-t">
                            <h4 className="text-sm font-semibold mb-3">Follow me on</h4>
                            <div className="flex gap-4">
                                <a
                                    href="https://www.linkedin.com/in/simonemattioli2003/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-muted p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                    <Linkedin className="w-5 h-5" />
                                </a>
                                <a
                                    href="https://github.com/simo-hue"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-muted p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                    <Github className="w-5 h-5" />
                                </a>
                                <a
                                    href="https://simo-hue.github.io"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-muted p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center font-bold text-xs px-4"
                                >
                                    Portfolio
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-card p-8 rounded-2xl border shadow-sm">
                        <form onSubmit={handleSendMessage} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Name</label>
                                    <input name="nome" type="text" required className="w-full px-3 py-2 bg-background border rounded-md" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Surname</label>
                                    <input name="cognome" type="text" required className="w-full px-3 py-2 bg-background border rounded-md" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Email</label>
                                <input name="email" type="email" required className="w-full px-3 py-2 bg-background border rounded-md" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Message</label>
                                <textarea name="messaggio" required className="w-full px-3 py-2 bg-background border rounded-md min-h-[120px]"></textarea>
                            </div>
                            <Button type="submit" className="w-full">Send Message</Button>
                        </form>
                        <p className="text-xs text-center text-muted-foreground mt-4">
                            By clicking "Send Message", your default email client will open with the message pre-filled.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
