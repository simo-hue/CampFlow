export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-24 max-w-3xl">
            <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>

            <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Open Source License</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        CampFlow is distributed as <strong>Open Source</strong> software.
                        You can view, modify, and distribute the source code according to the terms specified in the license present in the repository (typically MIT or Apache 2.0, refer to the official repo).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. "As Is" Usage</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability,
                        fitness for a particular purpose and noninfringement.
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg mt-4 border-l-4 border-primary/50">
                        <p className="text-sm">
                            In no event shall the authors or copyright holders be liable for any claim, damages or other liability,
                            whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. User Responsibility</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Those who choose to install and use CampFlow for managing a real accommodation facility are solely responsible for compliance with local,
                        fiscal, and public security laws (e.g. guest reporting, GDPR management of their customers).
                        The software is a technical tool and does not replace professional legal or fiscal advice.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Changes</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We reserve the right to modify these terms at any time, primarily to reflect updates in the project structure or platform requirements.
                    </p>
                </section>

                <div className="pt-8 border-t text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString('en-US')}
                </div>
            </div>
        </div>
    );
}
