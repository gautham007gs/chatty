
// src/app/legal/privacy/page.tsx
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const PrivacyPolicyPage = () => {
  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-background shadow-2xl">
      <AppHeader title="Privacy Policy" />
      <div className="flex-grow overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Privacy Policy for Kruthika Chat</CardTitle>
            <CardDescription>Last Updated: [Date - Please fill this in]</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
              <h3 className="font-semibold">Important: Placeholder Content</h3>
              <p className="text-sm">
                The content on this page is a template and NOT legally binding. You MUST replace `[Date]`, `[Your Company Name/Your Name]`, `[Your Contact Email Address]`, and other bracketed placeholders with your specific information.
                This policy needs to be reviewed by a legal professional to ensure it accurately reflects your data practices and complies with all relevant privacy laws (e.g., GDPR, CCPA, etc.).
              </p>
            </div>

            <section>
              <h2 className="text-xl font-semibold mt-4 mb-2">1. Introduction</h2>
              <p className="text-muted-foreground">
                Welcome to Kruthika Chat (the "Service"), operated by [Your Company Name/Your Name] ("we", "us", or "our").
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
                By using the Service, you agree to the collection and use of information in accordance with this policy.
              </p>
              <p className="text-muted-foreground mt-2">
                The character "Kruthika" you interact with is an Artificial Intelligence (AI) language model.
                Your interactions are with this AI and are not with a real human.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-4 mb-2">2. Information Collection and Use</h2>
              <p className="text-muted-foreground">
                We collect information primarily to provide and improve our Service to you.
              </p>
              <h3 className="text-lg font-medium mt-3 mb-1">Types of Data Collected</h3>
              
              <h4 className="text-md font-medium mt-2">Chat Data & AI Interaction</h4>
               <p className="text-muted-foreground">
                When you use Kruthika Chat, the messages you send and receive (including text and any images you choose to upload) are processed to provide the chat functionality.
                This data is sent to third-party Generative AI service providers (e.g., Google via Genkit for the Gemini model) to generate Kruthika's responses.
                These providers have their own privacy policies governing their use of data.
               </p>
               <p className="text-muted-foreground mt-1">
                We temporarily store your chat history in your browser's local storage to maintain conversation context during your session.
                We do not permanently store your detailed chat conversations or uploaded images on our servers beyond what is necessary for the AI to respond and for you to view your current session history.
                Images you send are processed by the AI and are not retained by our application servers after processing.
               </p>
               <p className="text-[10px] text-muted-foreground/80 mt-1">
                Please be aware: You acknowledge that you are interacting with an AI language model, not a human. Do not share highly sensitive personal information that you would not want processed by an AI system.
               </p>

              <h4 className="text-md font-medium mt-2">Usage Data</h4>
              <p className="text-muted-foreground">
                We may collect information that your browser sends whenever you visit our Service ("Usage Data").
                This Usage Data may include information such as your computer's Internet Protocol (IP) address (primarily for security and abuse prevention, and potentially anonymized analytics), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers (if applicable), and other diagnostic data.
              </p>
              
              <h4 className="text-md font-medium mt-2">Analytics Data (via Supabase)</h4>
              <p className="text-muted-foreground">
                If you have configured Supabase as per our setup guide, we collect aggregated and pseudo-anonymous analytics data. This includes:
              </p>
              <ul className="list-disc list-inside ml-4 text-muted-foreground">
                  <li>Counts of user and AI messages sent (message content itself is not stored in this analytics log beyond a potential snippet for context, and image data is only noted as present or not).</li>
                  <li>Estimates of Daily Active Users (DAU) based on a browser-specific pseudo-anonymous identifier stored in `localStorage`. This ID is not linked to any directly identifiable personal information by us.</li>
              </ul>
              

              <h4 className="text-md font-medium mt-2">Personal Data (If you implement accounts)</h4>
              <p className="text-muted-foreground">
                Currently, Kruthika Chat does not require user accounts. If, in the future, we implement user accounts, we might collect Personal Data such as an email address or username. This policy will be updated accordingly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-4 mb-2">3. Use of Your Information</h2>
              <p className="text-muted-foreground">
                We may use the information we collect for various purposes, including to:
              </p>
              <ul className="list-disc list-inside ml-4 text-muted-foreground">
                <li>Provide, operate, and maintain our Service.</li>
                <li>Improve, personalize, and expand our Service.</li>
                <li>Understand and analyze how you use our Service (via aggregated analytics).</li>
                <li>Generate AI responses to your interactions.</li>
                <li>Communicate with you, if applicable (e.g., for service updates if you provide contact info).</li>
                <li>Prevent abuse and ensure the security of our Service.</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </section>
            
            <section>
                <h2 className="text-xl font-semibold mt-4 mb-2">4. User Responsibilities and Content</h2>
                <p className="text-muted-foreground">
                    You are solely responsible for the content you send, upload, or otherwise share through the Service ("User Content").
                    You agree not to share User Content that is illegal, obscene, defamatory, threatening, infringing of intellectual property rights, invasive of privacy, or otherwise injurious or objectionable.
                    You should not share highly sensitive personal information (e.g., financial details, government IDs, precise health information) through the chat interface.
                    We reserve the right, but not the obligation, to monitor and remove User Content that violates our Terms of Service or this Privacy Policy.
                </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-4 mb-2">5. Sharing and Disclosure of Information</h2>
              <p className="text-muted-foreground">
                We do not sell your personal information. We may share information under the following circumstances:
              </p>
              <ul className="list-disc list-inside ml-4 text-muted-foreground">
                  <li><strong>With Service Providers:</strong> We share chat data (text and images you provide) with third-party GenAI service providers (e.g., Google) to enable Kruthika's responses. We use Supabase for analytics data storage and processing if configured. These providers are bound by their own privacy policies.</li>
                  <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</li>
                  <li><strong>To Protect Rights:</strong> We may disclose information where we believe it necessary to investigate, prevent, or take action regarding illegal activities, suspected fraud, situations involving potential threats to the safety of any person, violations of our Terms of Service, or as evidence in litigation.</li>
                  <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or asset sale, your information may be transferred.</li>
              </ul>
              
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-4 mb-2">6. Data Retention</h2>
              <p className="text-muted-foreground">
                Chat messages are stored in your browser's `localStorage` and persist until you clear your browser data.
                Analytics data in Supabase is retained as per Supabase's policies and our configuration (typically for trend analysis).
                Data sent to third-party AI providers is subject to their retention policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-4 mb-2">7. Security of Your Information</h2>
              <p className="text-muted-foreground">
                We use administrative, technical, and physical security measures to help protect your information.
                While we have taken reasonable steps to secure the information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                Any information disclosed online is vulnerable to interception and misuse by unauthorized parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-4 mb-2">8. Your Data Protection Rights</h2>
              <p className="text-muted-foreground">
                Depending on your location, you may have certain data protection rights. These may include the right to access, correct, update, or request deletion of your personal information.
                Since we primarily store chat data in your browser's `localStorage`, you can manage or delete this data by clearing your browser's cache and site data.
                For requests regarding data held by our third-party service providers (like GenAI providers or Supabase), you would need to consult their respective privacy policies or contact them directly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-4 mb-2">9. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our Service is not intended for use by children under the age of 13 (or a higher age threshold if stipulated by applicable law in your jurisdiction). We do not knowingly collect personally identifiable information from children under 13.
                If you are a parent or guardian and you believe that your child has provided us with personal information, please contact us. If we become aware that we have collected personal information from children without verification of parental consent, we take steps to remove that information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-4 mb-2">10. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
                new Privacy Policy on this page and updating the "Last Updated" date.
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-4 mb-2">11. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at: [Your Contact Email Address]
              </p>
            </section>
            <div className="pt-4 flex justify-center">
                 <Link href="/" legacyBehavior>
                    <Button variant="outline">Back to Chats</Button>
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
