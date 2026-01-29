export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-24 max-w-3xl">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

            <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">1. No Data Collection</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        CampFlow is an <strong>Open Source</strong> project designed for maximum transparency and privacy.
                        This website (hosted on GitHub Pages) and the application itself <strong>do not use tracking cookies</strong>,
                        do not contain third-party analytics scripts (like Google Analytics or Facebook Pixel), and do not collect personal data for marketing purposes.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. Data Entered in the Application</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Any data entered in the demo or in the self-hosted application (guest names, reservations, etc.) resides exclusively:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                        <li>In the local memory of your browser (for live demos).</li>
                        <li>In your personal database (if you decide to install and host CampFlow on your own servers).</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                        We CampFlow developers have no access to your operational data. The data is yours and remains yours.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. GitHub Pages</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        This site is hosted on GitHub Pages. GitHub may collect basic technical logs (e.g. IP address for security and access purposes)
                        as part of the standard service delivery for hosting, as stated in the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" className="text-primary hover:underline">GitHub Privacy Statement</a>.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Contacts</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        If you have technical questions or curiosities about the code, you can open an Issue on the <a href="https://github.com/simo-hue" className="text-primary hover:underline">GitHub repository</a>.
                    </p>
                </section>

                <div className="pt-8 border-t text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString('en-US')}
                </div>
            </div>
        </div>
    );
}
