import Image from "next/image"

export default function PrivacyPage() {
    return (
        <div
            className="flex flex-col gap-4 w-screen min-h-screen bg-indigo-50 py-36 px-64"
        >
            <span
                className="text-indigo-950 text-3xl font-bold"
            >Privacy Policy</span>
            <span
                className="text-indigo-950 text-sm mb-12"
            >This Privacy Policy outlines how our website (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, shares, and protects the personal information of users (&quot;you&quot; or &quot;your&quot;). We are committed to safeguarding your privacy and ensuring the security of the information you provide to us.</span>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 1: Information we Collect</span>
                <span
                    className="text-indigo-950 text-sm"
                >1.1 Personal Information: When you voluntarily provide us with your email address through direct input, we collect and store that information. Additionally, when you authenticate with our website using the Roblox OAuth 2.0 system, we collect your name from Roblox.</span>
                <span
                    className="text-indigo-950 text-sm"
                >1.2 Emails: Providing a valid email is not required to use our application. It is recommended for users to receive enhanced monitoring and an elevated experience. Users will not be punished for choosing not to provide an email.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 2: Use of Personal Information</span>
                <span
                    className="text-indigo-950 text-sm"
                >2.1 Email Communication: We use the email addresses you provide to send you important notifications, updates, and promotional materials related to our services. You can opt-out of receiving such communications by following the instructions provided in the emails or contacting us directly.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 3: Sharing of Personal Information</span>
                <span
                    className="text-indigo-950 text-sm"
                >3.1 Third-Party Service Providers: We may share your email addresses with Sendgrid, a trusted third-party email service provider, to facilitate the delivery of emails and improve our communication with you. Sendgrid is contractually obligated to handle your information securely and in compliance with applicable privacy laws.</span>
                <span
                    className="text-indigo-950 text-sm"
                >3.2 Public Account Information: Public information provided through authentication with Roblox will be available to other users who share a common connection, either through a group or community. If a user wishes to opt into Discord verification through our servers, their display name and username will be publicly visible.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 4: Data Security</span>
                <span
                    className="text-indigo-950 text-sm"
                >4.1 Security Measures: We take reasonable measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. We employ industry-standard security practices and regularly review our security procedures to ensure the confidentiality and integrity of your information.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 5: User Rights</span>
                <span
                    className="text-indigo-950 text-sm"
                >5.1 Access and Control: You have the right to access, modify, or delete your personal information held by us. If you wish to exercise any of these rights, use the settings page on neuro&apos;s client portal.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 6: Cookies and Tracking Technology</span>
                <span
                    className="text-indigo-950 text-sm"
                >6.1 We use cookies and similar tracking technologies to enhance your experience on our website. These technologies help us analyze website traffic, customize content, and gather information about your preferences. You have the option to manage your cookie preferences through your web browser settings.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 7: Children&apos;s Privacy</span>
                <span
                    className="text-indigo-950 text-sm"
                >7.1 Our website is not directed toward individuals under the age of 13. We do not knowingly collect personal information from children without verifiable parental consent. If you believe we have inadvertently collected information from a child, please contact us immediately.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 8: Changes to the Privacy Policy</span>
                <span
                    className="text-indigo-950 text-sm"
                >8.1 We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting an updated version of the policy on our website. The revised Privacy Policy will become effective as of the date posted.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 9: Contact Us</span>
                <span
                    className="text-indigo-950 text-sm"
                >9.1 If you have any questions, concerns, or requests regarding this Privacy Policy or the handling of your personal information, please contact us at: support@theneuro.io</span>
            </div>
            <div
                className="flex flex-row gap-4 mt-12"
            >
                <Image
                    width={64}
                    height={64}
                    className="my-auto"
                    src={"/branding/TransparentBoltTextDark.png"}
                    alt={"Logo"}
                />
                <div
                    className="flex flex-col my-auto"
                >
                    <span
                        className="text-indigo-950 text-lg font-semibold"
                    >Posted on June 03, 2023 at 11:00 AM Eastern Time</span>
                    <span
                        className="text-indigo-950 text-sm"
                    >Authored by Edward, edvwards, approved by neuro</span>
                </div>
            </div>
        </div>
    )
}