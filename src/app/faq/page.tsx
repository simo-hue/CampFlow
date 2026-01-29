import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "FAQ | Frequently Asked Questions about CampFlow",
    description: "All answers about CampFlow features, installation and usage. Discover how to manage your campsite with our open source software.",
};

export default function FAQPage() {
    return (
        <div className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions (FAQ)</h1>
                    <p className="text-xl text-muted-foreground">Everything you need to know about CampFlow and its developer.</p>
                </div>

                <div className="space-y-8">
                    {/* General */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-primary">General</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="gen-1">
                                <AccordionTrigger>What is CampFlow?</AccordionTrigger>
                                <AccordionContent>
                                    CampFlow is an all-in-one open-source platform for managing campsites, holiday villages, and camper parking areas. It allows you to manage reservations, guests, pitches, and check-ins from a single modern interface.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="gen-2">
                                <AccordionTrigger>Is it really free?</AccordionTrigger>
                                <AccordionContent>
                                    Yes! The "Community" version is 100% free and open-source. You can download the code and install it on your server without paying for licenses. We also offer paid services for those who prefer a managed solution (Cloud) or technical support.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="gen-3">
                                <AccordionTrigger>Who is it for?</AccordionTrigger>
                                <AccordionContent>
                                    It is ideal for managers of outdoor accommodation facilities of any size, from small agri-campsites to large holiday villages looking for a modern and flexible solution.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="gen-4">
                                <AccordionTrigger>Can I try it before installing?</AccordionTrigger>
                                <AccordionContent>
                                    Certainly. Contact us to access a live demo or watch the demonstration videos in the Features section.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>

                    {/* Technical & Installation */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-primary">Technical & Installation</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="tech-1">
                                <AccordionTrigger>What technologies does it use?</AccordionTrigger>
                                <AccordionContent>
                                    CampFlow is built with modern technologies: Next.js (React) for frontend and backend, Supabase (PostgreSQL) as database and authentication, and Tailwind CSS for styling.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="tech-2">
                                <AccordionTrigger>What are the system requirements for self-hosting?</AccordionTrigger>
                                <AccordionContent>
                                    You need a server (VPS) with Node.js installed and a Supabase instance (or configured PostgreSQL). We recommend at least 2GB of RAM for the Node server.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="tech-3">
                                <AccordionTrigger>Is it difficult to install?</AccordionTrigger>
                                <AccordionContent>
                                    It requires web development skills (git, npm, environment variable management). If you don't have these skills, the "Assisted Setup" or "Cloud Managed" plan is right for you.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="tech-4">
                                <AccordionTrigger>Is the code secure?</AccordionTrigger>
                                <AccordionContent>
                                    Security is a priority. We use robust Supabase authentication and middleware to protect sensitive routes. The code is public, allowing the community to constantly review it.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="tech-5">
                                <AccordionTrigger>Can I modify the code?</AccordionTrigger>
                                <AccordionContent>
                                    Absolutely yes. The open source license allows you to modify, extend, and customize the software for your specific needs.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="tech-6">
                                <AccordionTrigger>Does it support integration with third-party hardware?</AccordionTrigger>
                                <AccordionContent>
                                    Being open source, you can develop integrations with automatic barriers, passport readers, or fiscal printers via custom APIs.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>

                    {/* Features */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-primary">Features</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="feat-1">
                                <AccordionTrigger>Does it manage electronic invoicing?</AccordionTrigger>
                                <AccordionContent>
                                    Currently, CampFlow tracks payments and generates pro-forma receipts. Direct integration with the SDI for Italian electronic invoicing is on the roadmap.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="feat-2">
                                <AccordionTrigger>Can I manage multiple campsites with one account?</AccordionTrigger>
                                <AccordionContent>
                                    The base version is optimized for a single facility. For multi-site management, we offer customizations in the Enterprise plan.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="feat-3">
                                <AccordionTrigger>Does the calendar support drag-and-drop?</AccordionTrigger>
                                <AccordionContent>
                                    Yes, the occupancy calendar allows you to move reservations by dragging them, making planning management extremely intuitive.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="feat-4">
                                <AccordionTrigger>Does it include online check-in?</AccordionTrigger>
                                <AccordionContent>
                                    Yes, you can send a link to customers before their arrival to let them fill in their data, speeding up operations at reception.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="feat-5">
                                <AccordionTrigger>Does it communicate with the Alloggiati Web portal?</AccordionTrigger>
                                <AccordionContent>
                                    We are working on a module to export the .txt file compatible with the State Police portal.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="feat-6">
                                <AccordionTrigger>Is there a limit to the number of pitches?</AccordionTrigger>
                                <AccordionContent>
                                    No software limit. The limit depends only on the power of your server.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="feat-7">
                                <AccordionTrigger>Are the statistics in real time?</AccordionTrigger>
                                <AccordionContent>
                                    Yes, all dashboards are updated in real time as data is entered.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>

                    {/* Developer & Team */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-primary">Developer & Team</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="dev-1">
                                <AccordionTrigger>Who created CampFlow?</AccordionTrigger>
                                <AccordionContent>
                                    CampFlow was designed and developed by Simone Mattioli, a Computer Science student at the University of Verona passionate about technology and the outdoors.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="dev-2">
                                <AccordionTrigger>What is Simone's background?</AccordionTrigger>
                                <AccordionContent>
                                    Simone holds a technical diploma in computer science and is completing his bachelor's degree. He has experience as a Full Stack developer and has worked on AI and High Performance Computing (HPC) projects.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="dev-3">
                                <AccordionTrigger>Does Simone work alone?</AccordionTrigger>
                                <AccordionContent>
                                    Currently CampFlow is maintained primarily by Simone, but being open source, it accepts contributions from other developers in the community.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="dev-4">
                                <AccordionTrigger>Does he have experience in the sector?</AccordionTrigger>
                                <AccordionContent>
                                    In addition to technical skills, Simone has done international volunteering (Brazil) and was part of the Downhill World Cup staff, demonstrating organizational and teamwork skills in dynamic contexts.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="dev-5">
                                <AccordionTrigger>Why an open source project?</AccordionTrigger>
                                <AccordionContent>
                                    Simone believes in sharing knowledge and software accessibility. Making CampFlow open source helps small businesses and improves the software through collective feedback.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="dev-6">
                                <AccordionTrigger>How can I contact the developer?</AccordionTrigger>
                                <AccordionContent>
                                    You can find him on LinkedIn (Simone Mattioli), GitHub (simo-hue) or contact him directly via the contact form on this site.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="dev-7">
                                <AccordionTrigger>What are Simone's passions?</AccordionTrigger>
                                <AccordionContent>
                                    He is a lover of the mountains, wildlife, and outdoor exploration. This passion is reflected in the care for software dedicated to outdoor tourism.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>

                    {/* Pricing & Support */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-primary">Pricing & Support</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="sup-1">
                                <AccordionTrigger>What does the "Assisted Setup" plan include?</AccordionTrigger>
                                <AccordionContent>
                                    It includes complete installation on your server, domain configuration, SSL certificate, and an initial training session for your staff.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="sup-2">
                                <AccordionTrigger>Do you offer 24/7 support?</AccordionTrigger>
                                <AccordionContent>
                                    Standard support is via email on business days. Custom SLA support plans are available for Enterprise clients.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="sup-3">
                                <AccordionTrigger>Do you accept credit card payments?</AccordionTrigger>
                                <AccordionContent>
                                    Yes, for Cloud Managed plans and consultations we accept bank transfers and major credit cards.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="sup-4">
                                <AccordionTrigger>Can I cancel the Cloud subscription at any time?</AccordionTrigger>
                                <AccordionContent>
                                    Yes, there are no long-term contracts. You can cancel monthly and export your data.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="sup-5">
                                <AccordionTrigger>Do you offer refunds?</AccordionTrigger>
                                <AccordionContent>
                                    For Assisted Setup, if we are unable to complete the installation due to technical problems attributable to us, we will refund the full amount.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>
                    {/* Operational & Detailed Details */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-primary">Operations & Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-1">
                                    <AccordionTrigger>Is it possible to manage group bookings?</AccordionTrigger>
                                    <AccordionContent>Yes, you can create multiple bookings and associate them with the same group leader for simplified management.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-2">
                                    <AccordionTrigger>Can I apply discount codes?</AccordionTrigger>
                                    <AccordionContent>Currently, prices are calculated on price lists; coupon management is under development for v2.1.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-3">
                                    <AccordionTrigger>Does the system work on tablets?</AccordionTrigger>
                                    <AccordionContent>Yes, the interface is fully responsive and optimized for use on iPads and Android tablets, perfect for mobility in the campsite.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-4">
                                    <AccordionTrigger>Do I need an always-active internet connection?</AccordionTrigger>
                                    <AccordionContent>Yes, being a cloud-based web application (or connected server), a connection is required. In case of disconnection, data is not lost, but you will not be able to save new data.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-5">
                                    <AccordionTrigger>Can I export data to Excel?</AccordionTrigger>
                                    <AccordionContent>Certainly. Almost all tables (Guests, Reservations) have the "Export CSV" function compatible with Excel.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-6">
                                    <AccordionTrigger>Does it manage the tourist tax?</AccordionTrigger>
                                    <AccordionContent>The system allows you to configure fixed or per-person extra costs, usable to calculate the tourist tax.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-7">
                                    <AccordionTrigger>Does it connect to fiscal printers?</AccordionTrigger>
                                    <AccordionContent>Not natively. A specific middleware module for your printer (Epson, RCH, etc.) needs to be developed ad hoc.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-8">
                                    <AccordionTrigger>Can I customize confirmation emails?</AccordionTrigger>
                                    <AccordionContent>Transactional emails are managed via templates. In the self-hosted plan, you have full control over the HTML code of the emails.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-9">
                                    <AccordionTrigger>Is there a limit on staff users?</AccordionTrigger>
                                    <AccordionContent>No, you can create infinite accounts for your staff (receptionists, laborers, administrators) at no additional cost.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-10">
                                    <AccordionTrigger>Is the database backed up?</AccordionTrigger>
                                    <AccordionContent>On Supabase (Cloud) backups are automatic. If you manage your own server, you must configure backup cronjobs yourself (we can assist you in the Setup plan).</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-11">
                                    <AccordionTrigger>Is it GDPR compliant?</AccordionTrigger>
                                    <AccordionContent>The software is designed for privacy by design. However, legal compliance (appointing a DPO, processing register) is the responsibility of the facility manager.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-12">
                                    <AccordionTrigger>Can I change the interface colors?</AccordionTrigger>
                                    <AccordionContent>The interface supports Light/Dark mode. To change brand colors, you need to modify the Tailwind theme configuration file.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-13">
                                    <AccordionTrigger>Does it manage multiple seasons?</AccordionTrigger>
                                    <AccordionContent>Yes, you can define High, Medium, and Low season periods with different price lists.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-14">
                                    <AccordionTrigger>Can I block a pitch for maintenance?</AccordionTrigger>
                                    <AccordionContent>Yes, there is a "Blocked" status that prevents new reservations on that resource for the selected period.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-15">
                                    <AccordionTrigger>How do I manage "No Shows"?</AccordionTrigger>
                                    <AccordionContent>You can mark the reservation as "Cancelled" or "No Show", immediately freeing up availability on the calendar.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-16">
                                    <AccordionTrigger>Is there an interactive map?</AccordionTrigger>
                                    <AccordionContent>We are developing an interactive SVG module to view the campsite map and click directly on pitches.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-17">
                                    <AccordionTrigger>Who owns my customer data?</AccordionTrigger>
                                    <AccordionContent>You and only you. Unlike booking portals, with CampFlow data is your exclusive property.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-18">
                                    <AccordionTrigger>Can I import data from old software?</AccordionTrigger>
                                    <AccordionContent>It is possible to import registries via CSV. For booking history, we evaluate on a case-by-case basis via the Assisted Setup service.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-19">
                                    <AccordionTrigger>Is it multilingual?</AccordionTrigger>
                                    <AccordionContent>The public frontend is available in Italian and English. The management backend is currently in Italian.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-20">
                                    <AccordionTrigger>What happens if Simone stops developing it?</AccordionTrigger>
                                    <AccordionContent>Being Open Source, the code remains yours. Any other developer can take it over and continue it. You are not bound to us.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
