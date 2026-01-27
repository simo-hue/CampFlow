import { Metadata } from 'next';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
    title: "Contattaci | Supporto CampFlow",
    description: "Hai domande su CampFlow? Contatta Simone Mattioli per supporto tecnico, feature request o informazioni sul progetto open source.",
};

export default function ContactPage() {
    return <ContactForm />;
}
