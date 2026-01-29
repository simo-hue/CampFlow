import { Metadata } from 'next';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
    title: "Contact Us | CampFlow Support",
    description: "Have questions about CampFlow? Contact Simone Mattioli for technical support, feature requests, or information about the open source project.",
};

export default function ContactPage() {
    return <ContactForm />;
}
